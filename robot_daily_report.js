#!/usr/bin/env node
/**
 * 具身机器人日报 - 主入口脚本
 * 
 * 功能：每天早上9点自动收集、整理并发送具身机器人相关的最新信息
 * 运行方式：node robot_daily_report.js 或在 GitHub Actions 中运行
 */

const logger = require('./utils/logger');
const { collectSearchInfo } = require('./scripts/collect_search');
const MessageFormatter = require('./scripts/format_messages');
const FeishuNotifier = require('./scripts/send_feishu');
const settings = require('./config/settings.json');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

class RobotNewsDailyReport {
  constructor() {
    this.notifier = new FeishuNotifier();
  }

  async generateReport() {
    logger.info('=== 开始具身机器人日报生成流程 ===');

    try {
      // 步骤1：搜索收集信息
      logger.info('步骤1/5：正在收集具身机器人相关信息...');
      const searchResults = await collectSearchInfo();

      if (searchResults.length === 0) {
        logger.warn('未找到任何相关消息，但程序会继续执行。');
      }

      // 步骤2：格式化消息内容
      logger.info('步骤2/5：正在格式化消息内容...');
      const message = MessageFormatter.formatMessage(searchResults);
      logger.info(`共整理出 ${message.totalCount} 条信息`);

      // 步骤3：保存报告到文件
      logger.info('步骤3/5：正在保存本地报告文件...');
      await this.saveReportFile(message, searchResults);

      // 步骤4：发送到飞书
      logger.info('步骤4/5：正在通过飞书机器人发送通知...');
      const sendResult = await this.notifier.send(message);
      logger.info(`飞书发送结果：${sendResult.success ? '成功' : '失败'}`);

      // 步骤5：更新最后检查时间
      logger.info('步骤5/5：更新状态记录...');
      await this.updateLastChecked();

      logger.info('=== 具身机器人日报生成流程完成 ===');
      return {
        success: true,
        message: message,
        sendResult: sendResult
      };
    } catch (error) {
      logger.error(`生成日报过程中发生错误：${error.message}`);
      throw error;
    }
  }

  async saveReportFile(message, searchResults) {
    const reportDir = path.join(__dirname, settings.output.report_dir);
    
    // 如果目录不存在则创建
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `${dateStr}_日报.md`;
    const filePath = path.join(reportDir, filename);

    // 构建报告内容字符串
    let reportContent = '';
    reportContent += '# 🤖 具身机器人日报 - ' + format(new Date(), 'yyyy年MM月dd日 HH:mm:ss') + '\n\n';
    reportContent += '## 📄 摘要\n\n';
    reportContent += '| 项目 | 内容 |\n';
    reportContent += '|------|------|\n';
    reportContent += '| 总消息数 | ' + (message.totalCount || '0') + ' |\n';
    reportContent += '| 生成时间 | ' + message.timestamp + ' |\n';
    reportContent += '| 数据来源 | Baidu/Bing/Google News |\n\n';
    reportContent += message.content + '\n\n---\n';
    reportContent += '*本内容由自动化系统每日定时生成。*';

    fs.writeFileSync(filePath, reportContent, 'utf-8');
    logger.info('报告已保存至：' + filePath);
  }

  async updateLastChecked() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const lastCheckedFile = path.join(dataDir, 'last_checked.json');
    const data = {
      last_checked: new Date().toISOString(),
      timezone: settings.schedule.timezone
    };

    fs.writeFileSync(lastCheckedFile, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// 主函数（普通模式）
async function main() {
  const report = new RobotNewsDailyReport();
  await report.generateReport();
}

// 如果直接运行此文件
if (require.main === module) {
  const processArgs = process.argv.slice(2);
  
  // 检查是否为测试模式
  if (processArgs.includes('--test') || processArgs.includes('test')) {
    logger.info('=== 测试模式开始 ===');
    (async () => {
      try {
        // 从环境变量读取 webhook（如果需要覆盖默认设置）
        if (process.env.FEISHU_WEBHOOK_URL) {
          settings.bot.webhook_url = process.env.FEISHU_WEBHOOK_URL;
          logger.info('使用环境变量中的飞书 Webhook');
        }
        
        const report = new RobotNewsDailyReport();
        const result = await report.generateReport();
        logger.info('=== 测试完成 ===');
        if (!result.success) {
          process.exit(1);
        }
        process.exit(0);
      } catch (error) {
        console.error('测试失败:', error.message);
        process.exit(1);
      }
    })();
  } else {
    // 生产模式（包括 GitHub Actions）
    (async () => {
      try {
        // 从环境变量读取 webhook（GitHub Actions 会传递这个变量）
        if (process.env.FEISHU_WEBHOOK_URL) {
          settings.bot.webhook_url = process.env.FEISHU_WEBHOOK_URL;
          logger.info('使用环境变量中的飞书 Webhook');
        }
        
        const report = new RobotNewsDailyReport();
        await report.generateReport();
        process.exit(0);
      } catch (err) {
        logger.error('程序执行失败：' + err.message);
        process.exit(1);
      }
    })();
  }
}

// 导出为模块供其他脚本使用
module.exports = RobotNewsDailyReport;