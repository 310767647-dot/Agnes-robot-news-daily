/**
 * 格式化消息内容 - 为飞书机器人准备合适的通知格式
 * 
 * 支持 Markdown 格式，确保在飞书客户端良好展示
 */
const settings = require('../config/settings.json');
const { format } = require('date-fns');

class MessageFormatter {
  /**
   * 格式化搜索结果为日报消息
   * @param {Array} searchResults - 搜索结果数组
   * @returns {Object} 格式化后的消息对象
   */
  static formatMessage(searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return {
        title: '今日无新消息',
        content: '没有找到关于具身机器人的最新信息。',
        timestamp: new Date().toISOString(),
        totalCount: 0,
        categories: {}
      };
    }

    // 按类别整理信息
    const categories = {
      technology: [],     // 技术创新类
      business: [],       // 商业财经类
      industry: [],       // 行业分析类
      community: [],      // 社区讨论类
      general: []         // 综合类
    };

    // 定义匹配规则（生产环境可使用 NLP 分类）
    searchResults.forEach(result => {
      const lowerTitle = result.title.toLowerCase();
      const lowerDesc = (result.description || '').toLowerCase();
      
      let assigned = false;

      // 技术类关键词匹配
      if (lowerTitle.includes('技术') || lowerTitle.includes('突破') || 
          lowerTitle.includes('研发') || lowerTitle.includes('算法') || 
          lowerTitle.includes('控制') || lowerTitle.includes('感知') ||
          lowerTitle.includes('模型') || lowerTitle.includes('AI')) {
        categories.technology.push(result);
        assigned = true;
      }
      // 商业类关键词匹配
      else if (lowerTitle.includes('资本') || lowerTitle.includes('融资') || 
               lowerTitle.includes('投资') || lowerTitle.includes('市场') ||
               lowerTitle.includes('公司') || lowerTitle.includes('企业') ||
               lowerTitle.includes('产业') || lowerTitle.includes('商业')) {
        categories.business.push(result);
        assigned = true;
      }
      // 行业/分析类
      else if (result.category && (result.category.includes('行业') || 
             result.category.includes('分析')) ||
             lowerTitle.includes('趋势') || lowerTitle.includes('格局') ||
             lowerTitle.includes('现状') || lowerTitle.includes('展望')) {
        categories.industry.push(result);
        assigned = true;
      }
      // 社区/讨论类
      else if (result.source && (result.source.includes('知乎') || result.source.includes('社区'))) {
        categories.community.push(result);
        assigned = true;
      }

      // 如果没有分配到任何类别，归入综合类
      if (!assigned) {
        categories.general.push(result);
      }
    });

    // 构建标题
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyyy年MM月dd日 HH:mm');
    const title = `🤖 具身机器人日报 - ${formattedDate}`;

    // 构建消息内容（Markdown 格式）
    let content = '';
    
    // 头部摘要
    content += `# ${title}\n\n`;
    content += `📅 生成时间：${currentDate.toLocaleString('zh-CN')}\n\n`;
    content += `🌏 数据来源：36Kr、钛媒体、CSDN、知乎、百度等国内主流科技媒体\n\n`;

    // 技术创新板块（如果有）
    if (categories.technology.length > 0) {
      content += `## 🔬 技术创新\n\n`;
      categories.technology.forEach((item, index) => {
        content += `${index + 1}. [**${item.title}**](${item.url})\n   _${item.description}_\n   📰 ${item.source} | 🕒 ${new Date(item.date).toLocaleString('zh-CN')}\n\n`;
      });
    }

    // 商业财经板块（如果有）
    if (categories.business.length > 0) {
      content += `## 💼 商业财经\n\n`;
      categories.business.forEach((item, index) => {
        content += `${index + 1}. [**${item.title}**](${item.url})\n   _${item.description}_\n   📰 ${item.source} | 🕒 ${new Date(item.date).toLocaleString('zh-CN')}\n\n`;
      });
    }

    // 行业分析板块（如果有）
    if (categories.industry.length > 0) {
      content += `## 🏭 行业分析\n\n`;
      categories.industry.forEach((item, index) => {
        content += `${index + 1}. [**${item.title}**](${item.url})\n   _${item.description}_\n   📰 ${item.source} | 🕒 ${new Date(item.date).toLocaleString('zh-CN')}\n\n`;
      });
    }

    // 社区讨论板块（如果有）
    if (categories.community.length > 0) {
      content += `💬 社区讨论\n\n`;
      categories.community.forEach((item, index) => {
        content += `${index + 1}. [**${item.title}**](${item.url})\n   _${item.description}_\n   📰 ${item.source} | 🕒 ${new Date(item.date).toLocaleString('zh-CN')}\n\n`;
      });
    }

    // 综合新闻板块（如果有剩余的）
    const remaining = [...categories.technology, ...categories.business, ...categories.industry, ...categories.community];
    if (categories.general.length > 0 || remaining.length === 0) {
      // 如果没有其他分类，显示所有新闻；否则显示未分类的新闻
      const displayItems = categories.general.length > 0 ? categories.general : searchResults.filter(r => !remaining.some(rr => rr.url === r.url));
      
      if (displayItems.length > 0) {
        const sectionTitle = categories.general.length > 0 ? '## 📰 综合资讯' : '## 📝 今日焦点';
        content += `${sectionTitle}\n\n`;
        displayItems.forEach((item, index) => {
          const alreadyShown = categories.technology.some(r => r.url === item.url) ||
                              categories.business.some(r => r.url === item.url) ||
                              categories.industry.some(r => r.url === item.url) ||
                              categories.community.some(r => r.url === item.url);
          
          if (!alreadyShown) {
            content += `${index + 1}. [**${item.title}**](${item.url})\n   _${item.description}_\n   📰 ${item.source} | 🕒 ${new Date(item.date).toLocaleString('zh-CN')}\n\n`;
          }
        });
      }
    }

    // 底部说明
    content += `\n---\n`;
    content += `💡 **提示**：以上信息由自动系统每日定时收集整理，链接点击后请在国内网络环境下访问。\n\n`;
    content += `*本内容由具身机器人日报系统自动生成。\n`;

    return {
      title: title,
      content: content,
      timestamp: new Date().toISOString(),
      totalCount: searchResults.length,
      categories: {
        technology: categories.technology.length,
        business: categories.business.length,
        industry: categories.industry.length,
        community: categories.community.length,
        general: categories.general.length
      }
    };
  }

  /**
   * 创建飞书卡片消息（富文本形式，可选）
   * @param {Object} message - 消息对象
   * @returns {Object} 飞书卡片配置
   */
  static createFeishuCard(message) {
    return {
      card_type: 'markdown',
      content: {
        markdown: message.content
      }
    };
  }
}

module.exports = MessageFormatter;