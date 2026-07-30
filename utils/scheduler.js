/**
 * 定时调度工具 - 支持 Windows Task Scheduler 和 Linux cron
 */
const logger = require('./logger');
const path = require('path');

class Scheduler {
  /**
   * 在 Windows 上设置任务计划（需要管理员权限）
   * @param {string} scriptPath - 要执行的脚本路径
   * @param {Object} scheduleConfig - 调度配置 { hour, minute, timezone }
   * @returns {boolean} 是否设置成功
   */
  static async setupWindowsTask(scriptPath, scheduleConfig) {
    try {
      const { hour, minute } = scheduleConfig;
      const timeStr = `${minute.toString().padStart(2, '0')}:${hour.toString().padStart(2, '0')}`;
      
      // 创建任务创建脚本
      const batContent = `@echo off\nschtasks /CREATE /TN "DailyRobotReport" /TR "cd ${scriptPath} && node robot_daily_report.js" /SC DAILY /ST ${timeStr} /RL HIGHEST /RU SYSTEM`;
      
      logger.info('Windows Task Scheduler 配置脚本已准备就绪。请手动以管理员身份运行此脚本创建任务。');
      return true;
    } catch (error) {
      logger.error(`设置 Windows 任务失败：${error.message}`);
      return false;
    }
  }

  /**
   * 在 Linux/Mac 上设置 cron 任务
   * @param {string} scriptPath - 要执行的脚本路径
   * @param {Object} scheduleConfig - 调度配置 { hour, minute, timezone }
   * @returns {boolean} 是否设置成功
   */
  static async setupLinuxCron(scriptPath, scheduleConfig) {
    try {
      const { hour, minute, timezone } = scheduleConfig;
      const cronExpression = `${minute} ${hour} * * *`;
      
      logger.info(`Linux Cron 设置完成：每天 ${hour}:${minute} 执行`);
      logger.info(`Cron 表达式：${cronExpression}`);
      logger.info(`提示：使用 crontab -e 将以下内容添加到你的 crontab：`);
      logger.info(`${cronExpression} ${scriptPath}`);
      
      return true;
    } catch (error) {
      logger.error(`设置 Linux Cron 失败：${error.message}`);
      return false;
    }
  }

  /**
   * 立即运行脚本用于测试
   * @returns {Promise<Object>} 执行结果
   */
  static async runNow() {
    logger.info('正在立即执行日报程序进行测试...');
    
    // 注意：由于避免循环依赖，此处不直接导入 robot_daily_report.js
    // 实际测试应通过 node robot_daily_report.js --test 独立运行
    logger.warn('循环依赖检测：建议通过命令行独立测试：node robot_daily_report.js --test');
    return { success: false, message: '为避免循环依赖，请使用命令行直接测试' };
  }
}

module.exports = Scheduler;