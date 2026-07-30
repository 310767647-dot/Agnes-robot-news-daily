const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.level = 'info';
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }

  log(level, message) {
    const levelNum = this.logLevels[level];
    if (levelNum < this.logLevels[this.level]) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);

    // Also write to file
    try {
      const logDir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, 'daily_report.log');
      fs.appendFileSync(logFile, logMessage + '\n', 'utf-8');
    } catch (err) {
      console.warn('Failed to write log file:', err.message);
    }
  }

  debug(message) { this.log('debug', message); }
  info(message) { this.log('info', message); }
  warn(message) { this.log('warn', message); }
  error(message) { this.log('error', message); }
}

module.exports = new Logger();