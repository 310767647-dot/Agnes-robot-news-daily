/**
 * 极简版飞书通知脚本 - 仅用于 GitHub Actions 环境
 * 避免了复杂的依赖问题
 */
const axios = require('axios');

class FeishuNotifier {
  constructor() {
    this.webhookUrl = process.env.FEISHU_WEBHOOK_URL || '';
  }

  async send(message) {
    try {
      const response = await axios.post(this.webhookUrl, {
        msg_type: 'markdown',
        content: {
          markdown: message.content
        }
      }, {
        timeout: 10000 // 10秒超时
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ 飞书推送失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = FeishuNotifier;
