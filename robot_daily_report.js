#!/usr/bin/env node
/**
 * 具身机器人日报 - GitHub Actions 兼容版
 * 使用原生 http 模块，避免依赖冲突
 */

const logger = require('./utils/logger');
const { collectSearchInfo } = require('./scripts/collect_search');
const MessageFormatter = require('./scripts/format_messages');
const settings = require('./config/settings.json');
const fs = require('fs');
const path = require('path');
const http = require('http'); // 使用 Node.js 原生 http 模块，不依赖 axios
const https = require('https'); // 用于 HTTPS 请求
const { format } = require('date-fns');

class RobotNewsDailyReport {
  constructor() {
    this.webhookUrl = process.env.FEISHU_WEBHOOK_URL || '';
    if (this.webhookUrl) {
      logger.info('已设置飞书 Webhook: ' + this.webhookUrl);
    } else {
      logger.warn('未设置 FEISHU_WEBHOOK_URL 环境变量');
    }
  }

  async generateReport() {
    logger.info('=== 开始具身机器人日报生成流程 ===');

    // 步骤1：收集信息
    logger.info('步骤1/5：正在收集具身机器人相关信息...');
    const searchResults = await collectSearchInfo();

    // 步骤2：格式化消息
    logger.info('步骤2/5：正在格式化消息内容...');
    const message = MessageFormatter.formatMessage(searchResults);
    logger.info(`共整理出 ${message.totalCount} 条信息`);

    // 步骤3：保存报告
    logger.info('步骤3/5：正在保存本地报告文件...');
    await this.saveReportFile(message, searchResults);

    // 步骤4：发送飞书（如果配置了 webhook）
    if (this.webhookUrl) {
      logger.info('步骤4/5：正在通过飞书机器人发送通知...');
      await this.sendToFeushu(message);
      logger.info('飞书推送完成！');
    } else {
      logger.info('跳过飞书推送（未配置 Webhook）');
    }

    // 步骤5：更新状态
    logger.info('步骤5/5：更新状态记录...');
    await this.updateLastChecked();

    logger.info('=== 具身机器人日报生成流程完成 ===');
    return { success: true, message: message };
  }

  async sendToFeishu(message) {
    // 使用 Node.js 原生 http 模块发送 POST 请求，完全避免依赖问题
    const payload = {
      msg_type: 'markdown',
      content: {
        markdown: message.content
      }
    };

    const postData = JSON.stringify(payload);
    
    // 根据 URL 协议选择 http 或 https 模块
    const protocol = this.webhookUrl.startsWith('https') ? https : http;
    
    const options = {
      hostname: new URL(this.webhookUrl).hostname,
      path: new URL(this.webhookUrl).pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData, 'utf8')
      }
    };

    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            logger.info('飞书响应：' + JSON.stringify(result));
            resolve({ success: true, data: result });
          } catch (e) {
            resolve({ success: true, raw: data });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.write(postData, 'utf8');
      req.end();

      // 设置超时
      setTimeout(() => {
        req.destroy();
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }

  async saveReportFile(message, searchResults) {
    const reportDir = path.join(__dirname, settings.output.report_dir);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `${dateStr}_日报.md`;
    const filePath = path.join(reportDir, filename);

    let reportContent = '# 🤖 具身机器人日报 - ' + format(new Date(), 'yyyy年MM月dd日 HH:mm:ss') + '\n\n';
    reportContent += '## 📄 摘要\n\n';
    reportContent += '| 项目 | 内容 |\n|------|------|\n';
    reportContent += '| 总消息数 | ' + (message.totalCount || '0') + ' |\n';
    reportContent += '| 生成时间 | ' + message.timestamp + ' |\n';
    reportContent += '| 数据来源 | Baidu/Bing/Google News |\n\n';
    reportContent += message.content + '\n\n---\n*本内容由自动化系统每日定时生成。*';

    fs.writeFileSync(filePath, reportContent, 'utf-8');
    logger.info('报告保存至：' + filePath);
  }

  async updateLastChecked() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const lastCheckedFile = path.join(dataDir, 'last_checked.json');
    fs.writeFileSync(lastCheckedFile, JSON.stringify({
      last_checked: new Date().toISOString(),
      timezone: settings.schedule.timezone
    }, null, 2), 'utf-8');
  }
}

// 主执行入口
if (require.main === module) {
  (async () => {
    try {
      const report = new RobotNewsDailyReport();
      await report.generateReport();
      process.exit(0);
    } catch (err) {
      console.error('ERROR:', err.message);
      process.exit(1);
    }
  })();
}
