import config from '../config';

export class Logger {
  private static logLevelMatches(level: LogLevel): boolean {
    const levelPriority = LogLevelMapping.get(level) || 0;
    const configuredPriority = LogLevelMapping.get(config.app.logLevel) || 0;

    return levelPriority <= configuredPriority;
  }

  private static log(message: string) {
    console.log(`${new Date().toLocaleTimeString()} ${message}`);
  }

  static error(message: string) {
    if (this.logLevelMatches('error')) {
      this.log(`<app-error> ${message}`);
    }
  }

  static warning(message: string) {
    if (this.logLevelMatches('warning')) {
      this.log(`<app-warning> ${message}`);
    }
  }

  static info(message: string) {
    if (this.logLevelMatches('info')) {
      this.log(`<app-info> ${message}`);
    }
  }

  static debug(message: string) {
    if (this.logLevelMatches('debug')) {
      this.log(`<app-debug> ${message}`);
    }
  }

  static trace(message: string) {
    if (this.logLevelMatches('trace')) {
      this.log(`<app-trace> ${message}`);
    }
  }
}

export type LogLevel = 'error' | 'warning' | 'info' | 'debug' | 'trace';

export const LogLevelMapping: Map<LogLevel, number> = new Map([
  ['error', 1],
  ['warning', 2],
  ['info', 3],
  ['debug', 4],
  ['trace', 5]
]);
