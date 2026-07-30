/**
 * 搜索收集脚本 - 从多个搜索引擎获取具身机器人相关的最新信息
 * 
 * 本脚本设计了两种模式：
 * 1. 演示模式（默认）：使用模拟数据展示功能
 * 2. 生产模式：替换为真实的中国国内可用 API
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const settings = require('../config/settings.json');

// ============================================================
// 🇨🇳 国内可访问数据源（演示模式）
// ============================================================

/**
 * 从国内科技媒体和资讯平台获取模拟新闻数据
 * 实际使用时可替换为真实 RSS 抓取或 API 调用
 */
async function searchChineseSources(keyword) {
  logger.info(`正在搜索国内中文资讯源: ${keyword}`);
  
  const results = [];
  const now = new Date();
  
  // 数据来源列表 - 均为中国国内可访问的网站
  const newsSources = [
    {
      name: '36Kr',
      domain: '36kr.com',
      category: '商业财经',
      baseUrl: 'https://36kr.com'
    },
    {
      name: '钛媒体',
      domain: 'tmzine.cn',
      category: '商业财经',
      domain: 'www.tmzine.cn'
    },
    {
      name: '虎嗅网',
      domain: 'huxiu.com',
      category: '行业分析',
      baseUrl: 'https://www.huxiu.com'
    },
    {
      name: '知乎',
      domain: 'zhihu.com',
      category: '社区讨论',
      baseUrl: 'https://www.zhihu.com'
    },
    {
      name: 'CSDN',
      domain: 'csdn.net',
      category: '技术文章',
      baseUrl: 'https://blog.csdn.net'
    },
    {
      name: '百度热搜',
      domain: 'baidu.com',
      category: '综合热点',
      baseUrl: 'https://www.baidu.com/s?wd='
    }
  ];

  // 为每个关键词生成模拟文章（生产环境应替换为真实 API）
  const articleTemplates = [
    {
      titlePattern: '{keyword}领域：{subtopic}',
      subtopics: [
        '国产人形机器人量产倒计时',
        '资本加速赛道布局融资热潮',
        '新技术突破实现自主导航',
        '商业应用场景持续拓展',
        '产业链供应链协同升级',
        '政策支持行业发展蓝图'
      ]
    },
    {
      titlePattern: '{subtopic}深度解析：{keyword}发展现状',
      subtopics: [
        '行业竞争格局与未来趋势',
        '核心技术与专利布局分析',
        '应用场景落地实践案例',
        '投资机会与风险评估'
      ]
    }
  ];

  newsSources.forEach(source => {
    articleTemplates.forEach(template => {
      template.subtopics.forEach(subtopic => {
        const title = template.titlePattern.replace('{keyword}', keyword).replace('{subtopic}', subtopic);
        const dateOffset = Math.floor(Math.random() * 7) + 1; // 1-7天前
        
        results.push({
          title: title,
          url: `${source.baseUrl}/${Math.random().toString(36).substr(2, 12)}`,
          description: `${title}的详细内容摘要...${subtopic}是当前行业关注的焦点，多家企业和研究机构正在积极布局。`,
          source: source.name,
          category: source.category,
          date: new Date(now.getTime() - dateOffset * 86400000).toISOString()
        });
      });
    });
  });

  // 去重（基于 URL）
  const uniqueResults = [];
  const seenUrls = new Set();
  for (const result of results) {
    if (!seenUrls.has(result.url)) {
      seenUrls.add(result.url);
      uniqueResults.push(result);
    }
  }

  // 限制返回数量，避免过多重复内容
  const maxPerKeyword = Math.floor(8 / settings.search.keywords.length);
  const filteredResults = uniqueResults.slice(0, Math.max(maxPerKeyword, 2));

  logger.info(`从国内源收集到 ${filteredResults.length} 条相关结果`);
  return filteredResults;
}

// ============================================================
// 🔧 搜索主函数
// ============================================================

/**
 * 根据关键词收集所有搜索结果
 */
async function collectSearchInfo() {
  const allResults = [];
  const uniqueUrls = new Set();

  for (const keyword of settings.search.keywords) {
    logger.info(`开始搜索关键词: ${keyword}`);
    
    try {
      // 优先获取国内可访问的中文资讯
      const chineseResults = await searchChineseSources(keyword);
      chineseResults.forEach(result => {
        if (!uniqueUrls.has(result.url)) {
          uniqueUrls.add(result.url);
          result.keyword = keyword;
          allResults.push(result);
        }
      });
      
      logger.info(`"${keyword}" 从国内源获取 ${chineseResults.length} 条结果`);
    } catch (error) {
      logger.warn(`搜索中文源失败 ${keyword}: ${error.message}`);
    }
  }

  // 按时间倒序排序（最新优先）
  allResults.sort((a, b) => new Date(b.date) - new Date(a.date));

  logger.info(`共收集到 ${allResults.length} 条独特结果`);
  return allResults;
}

// ============================================================
// 🌍 国际新闻源（可选，如需扩展）
// ============================================================

/**
 * 从英文技术媒体获取新闻（如需生产环境可接入 RSS 或 API）
 */
async function searchInternationalSources(keyword) {
  logger.info(`正在搜索国际英文资讯源: ${keyword}`);
  
  // 此处可添加来自 TechCrunch、The Verge、MIT Technology Review 等的真实 RSS 抓取
  // 当前为模拟数据
  return [];
}

// ============================================================
// 🚀 导出模块
// ============================================================

module.exports = { collectSearchInfo };