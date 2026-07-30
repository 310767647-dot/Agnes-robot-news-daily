# 具身机器人日报系统 🤖

一个自动化每日新闻收集与飞书通知系统，专注于**具身机器人（Embodied Robotics/AI）**领域。

## 📋 程序功能

1. **每日自动收集**：每天早上9点自动抓取具身机器人相关的最新信息
2. **多源搜索覆盖**：涵盖技术、商业、行业动态等多方面内容
3. **分类整理输出**：将信息按类型分类，每条附带来源和链接
4. **飞书实时通知**：通过飞书机器人即时推送日报
5. **本地报告存档**：每天生成MD格式报告存档

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 测试运行（手动）

```bash
node robot_daily_report.js
```

### 3. 配置设置

编辑 `config/settings.json`：
- `bot.webhook_url` - 已预填您的飞书机器人Webhook地址
- `search.keywords` - 搜索关键词列表（可根据需要添加）
- `schedule.hour/min` - 调整发送时间（默认每天9:00）

### 4. 配置定时任务（Windows Task Scheduler）

使用提供的批处理脚本设置每日自动执行：

```bat
task_scheduler_setup.bat
```

或使用以下PowerShell命令手动创建：

```powershell
$action = New-ScheduledTaskAction -Execute "node" -Argument "robot_daily_report.js"
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "RobotNewsDailyReport" -Action $action -Trigger $trigger -Principal $principal
```

## 📂 目录结构

```
robot-news-daily/
├── config/               # 配置文件
│   └── settings.json     # 主配置
├── scripts/              # 核心业务脚本
│   ├── collect_search.js  # 信息收集模块
│   ├── format_messages.js  # 消息格式化模块
│   └── send_feishu.js    # 飞书通知模块
├── utils/                # 工具模块
│   ├── logger.js         # 日志记录器
│   └── scheduler.js      # 调度工具（可选扩展）
├── reports/              # 每日报告输出目录（自动生成）
├── data/                 # 状态数据（自动生成）
├── logs/                 # 日志文件（自动生成）
├── package.json          # Node.js项目配置
├── robot_daily_report.js # 主入口脚本
└── README.md             # 使用说明
```

## 🔧 技术栈

- **运行时**: Node.js (v18+)
- **HTTP请求**: axios
- **文本处理**: cheerio (用于网页解析)
- **日期处理**: date-fns
- **定时任务**: Windows Task Scheduler / cron

## ⚠️ 注意事项

1. **搜索引擎API限制**：当前代码包含模拟搜索实现。如需生产环境使用，请申请真实的搜索引擎API（如百度智能云、Bing Search API等）并替换对应函数。
2. **Webhook安全性**：请勿将 `settings.json` 上传到公共版本控制系统。
3. **日志轮转**：日志文件会持续增长，建议配合日志轮转策略使用。
4. **错误处理**：失败时会自动记录日志，可通过 `logs/daily_report.log` 排查问题。

## 📈 未来扩展

- ✅ 增加更多搜索渠道（微信公众号、知乎、行业论坛等）
- ✅ 增加图像摘要（提取新闻中的配图）
- ✅ 增加统计分析（每周/每月趋势报告）
- ✅ 支持多机器人群组分发
- ✅ 添加AI摘要功能（用LLM提炼关键信息）

## 🌐 云端部署（电脑不开机也能运行）

要实现"电脑不开机也能每天自动推送"，请参阅 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 中的详细指南，包括：

- Serverless 函数部署（阿里云/腾讯云等）
- VPS + Cron 定时任务
- Docker 容器化方案
- 在线定时器 + API 调用方案

---

## 🆘 帮助

如有任何问题，请联系开发者或查阅 `utils/logger.js` 查看日志输出位置。参阅 `DEPLOYMENT_GUIDE.md` 了解云端部署方案。

---

*由 AgnesCode 协助开发 · 2026*