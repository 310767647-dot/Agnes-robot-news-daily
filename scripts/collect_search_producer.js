/**
 * 🔧 生产环境搜索脚本 - 具身机器人日报
 * 
 * 本文件包含从真实数据源获取信息的实现框架。
 * 当前为演示模式，使用模拟数据。实际部署时请替换为真实 API。
 * 
 * ===================================================================
 * 📋 推荐的中国国内可用新闻数据源方案
 * ===================================================================
 * 
 * 方案一：第三方聚合 API（最简单，无需备案）
 * ---------------------------------------------------------
 * 服务：聚合数据（www.juhe.cn）、易源聚合（www.epubtop.com）
 * 特点：提供新闻 API，含关键词过滤、分页、返回 JSON 格式
 * 缺点：免费额度有限，高级功能需付费
 * 
 * 示例接入代码（需替换 YOUR_API_KEY）：
 * ```javascript
 * async function searchJuhe(keyword) {
 *   const url = `http://v.juhe.cn/toutiao/index.php` +
 *     type=news&title=${keyword}&page=1&pagesize=10&key=YOUR_API_KEY`;
 *   const res = await axios.get(url);
 *   return res.data.result.data.map(item => ({
 *     title: item.title,
 *     url: item.url,
 *     description: item.summary,
 *     source: item.source || '聚合数据',
 *     date: item.pubtime,
 *   }));
 * }
 * ```
 * 
 * 方案二：RSS 抓取（免费，但部分网站不提供 RSS）
 * ---------------------------------------------------------
 * 可抓取的国内科技媒体 RSS：
 * - 36Kr: https://36kr.com/rss/feed.xml
 * - 虎嗅: https://www.huxiu.com/rss/index.html
 * - 钛媒体: https://www.tmzine.cn/api/v1/feed.rss
 * 
 * 示例代码：
 * ```javascript
 * async function fetchRss(url) {
 *   const { data } = await axios.get(url, { responseType: 'text' });
 *   const $ = cheerio.load(data);
 *   const items = [];
 *   $('item').each((i, el) => {
 *     items.push({
 *       title: $(el).find('title').text(),
 *       url: $(el).find('link').text(),
 *       description: $(el).find('description').text(),
 *       source: 'RSS Feed',
 *       date: $(el).find('pubDate').text(),
 *     });
 *   });
 *   return items;
 * }
 * ```
 * 
 * 方案三：微信公众号文章 API（需要企业资质）
 * ---------------------------------------------------------
 * 通过第三方服务（如西瓜数据、新榜）获取公众号文章数据。
 * 需企业认证，成本较高，适合大型项目。
 * 
 * 方案四：百度指数/微信指数（趋势数据，非单篇新闻）
 * ---------------------------------------------------------
 * 百度指数平台提供关键词趋势数据，适合做行业分析。
 * https://index.baidu.com/
 * 
 * ===================================================================
 * ⚠️ 注意事项
 * ===================================================================
 * 1. 遵守各网站的 robots.txt 和使用条款
 * 2. 添加合理的请求间隔（建议 >1秒），避免被封 IP
 * 3. 设置 User-Agent 头，标识自己的应用
 * 4. 处理 API 限流和错误重试逻辑
 * 5. 敏感信息（API Key）不要硬编码在代码中，使用环境变量
 * ===================================================================
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const settings = require('../config/settings.json');

// ============================================================
🇨🇳 国内数据源（演示模式 - 可替换为真实 API）
// ============================================================

async function searchChineseSources(keyword) {
  logger.info(`[国内源] 搜索关键词: ${keyword}`);
  
  // 【生产环境提示】在此处调用真实的 API，例如：
  // return await fetchFromJuheApi(keyword);
  // return await fetchFromRssFeeds(keyword);
  
  // 当前为模拟数据演示
  const mockData = generateMockData(keyword);
  logger.info(`[国内源] 返回 ${mockData.length} 条模拟数据`);
  return mockData;
}

function generateMockData(keyword) {
  const sources = [
    { name: '36Kr', domain: '36kr.com' },
    { name: '钛媒体', domain: 'tmzine.cn' },
    { name: 'CSDN', domain: 'csdn.net' },
    { name: '知乎', domain: 'zhihu.com' },
    { name: '虎嗅', domain: 'huxiu.com' }
  ];

  const categories = ['技术突破', '融资动态', '行业分析', '新品发布', '合作签约'];
  const articles = [];

  sources.forEach(source => {
    categories.forEach((cat, idx) => {
      articles.push({
        title: `${keyword} ${cat}: 详细内容摘要...`,
        url: `${source.domain}/${Math.random().toString(36).substr(2, 8)}.html`,
        description: `${keyword}领域${cat}的最新进展，多家机构关注。${cat}是行业发展的重要驱动力。`,
        source: source.name,
        date: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString()
      });
    });
  });

  return articles;
}

// ============================================================
🌍 国际数据源（演示模式）
// ============================================================

async function searchInternationalSources(keyword) {
  logger.info(`[国际源] 搜索关键词: ${keyword}`);
  // 生产环境可接入 TechCrunch、MIT Technology Review 等英文媒体的 RSS
  return [];
}

// ============================================================
主收集函数
// ============================================================

async function collectSearchInfo() {
  const allResults = [];
  const uniqueUrls = new Set();

  for (const keyword of settings.search.keywords) {
    logger.info(`开始搜索: ${keyword}`);
    
    try {
      // 优先中文源
      const chineseResults = await searchChineseSources(keyword);
      chineseResults.forEach(result => {
        if (!uniqueUrls.has(result.url)) {
          uniqueUrls.add(result.url);
          allResults.push(result);
        }
      });

      // 如果中文结果不足，补充英文源
      if (allResults.length < 10) {
        const intlResults = await searchInternationalSources(keyword);
        intlResults.forEach(result => {
          if (!uniqueUrls.has(result.url)) {
            uniqueUrls.add(result.url);
            allResults.push(result);
          }
        });
      }
    } catch (error) {
      logger.error(`搜索 ${keyword} 失败: ${error.message}`);
    }
  }

  // 去重并排序
  allResults.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  logger.info(`共收集 ${allResults.length} 条结果`);
  return allResults;
}

module.exports = { collectSearchInfo };