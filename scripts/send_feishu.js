/**
 * 发送飞书通知脚本 - 将格式化后的消息发送到飞书机器人
 */
const axios = require('axios');
const logger = require('../utils/logger');
const settings = require('../config/settings.json');

class FeishuNotifier {
  constructor() {
    this.webhookUrl = settings.bot.webhook_url;
    this.defaultUserName = settings.bot.default_user_name;
  }

  async send(message) {
    if (!this.webhookUrl || this.webhookUrl === '') {
      throw new Error('飞书Webhook URL未设置，请检查配置文件！');
    }

    logger.info(`正在通过飞书机器人发送通知...`);

    // 准备消息内容（支持Markdown格式）
    const payload = {
      msg_type: 'text',
      content: {
        text: message.content
      },
      // 添加可选的卡片式消息增强（如果需要使用）
      // cards: [this.createCard(message)]
    };

    try {
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10秒超时
      });

      logger.info(`飞书发送成功，响应：${JSON.stringify(response.data)}`);
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`飞书发送失败：${error.message}`);
      
      if (error.response) {
        logger.error(`HTTP错误：${error.response.status} - ${error.response.statusText}`);
        logger.error(`响应数据：${JSON.stringify(error.response.data)}`);
      }
      
      throw error; // 抛出错误以便主程序处理
    }
  }

  /**
   * 创建飞书卡片消息（富文本形式）
   * @param {Object} message - 消息对象
   * @returns {Object} 卡片配置
   */
  createCard(message) {
    return {
      tag: 'div',
      direction: 'ltr',
      children: [
        {
          tag: 'h1',
          content: message.title
        },
        {
          tag: 'p',
          content: message.content.replace(/\n/g, '<br>')
        },
        {
          tag: 'p',
          content: `*生成时间：${new Date(message.timestamp).toLocaleString()}*`,
          style: { italic: true }
        }
      ]
    };
  }
}

module.exports = FeishuNotifier;