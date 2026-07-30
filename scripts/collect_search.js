/**
 * 简化版搜索脚本 - 仅用于演示，返回模拟数据
 * 移除对 axios 的依赖以避免兼容性问题
 */

const logger = require('../utils/logger');
const settings = require('../config/settings.json');

async function searchChineseSources(keyword) {
  logger.info(`[国内源] 搜索关键词: ${keyword}`);
  
  // 返回模拟数据（生产环境可替换为真实 API）
  return [
    {
      title: `${keyword}领域技术突破：国产具身智能取得新进展`,
      url: 'https://example.com/news1',
      description: '国内研究机构在具身机器人感知与决策方面取得新成果...',
      source: '36Kr（模拟）',
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: `${keyword}商业动态：多家企业获新一轮融资`,
      url: 'https://example.com/business',
      description: '资本加速布局具身机器人赛道...',
      source: '钛媒体（模拟）',
      date: new Date(Date.now() - 172800000).toISOString()
    }
  ];
}

async function collectSearchInfo() {
  const allResults = [];
  
  for (const keyword of settings.search.keywords) {
    logger.info(`开始搜索关键词: ${keyword}`);
    const results = await searchChineseSources(keyword);
    allResults.push(...results);
  }
  
  allResults.sort((a, b) => new Date(b.date) - new Date(a.date));
  logger.info(`共收集到 ${allResults.length} 条结果`);
  return allResults;
}

module.exports = { collectSearchInfo };
