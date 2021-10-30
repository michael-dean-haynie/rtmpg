import config from '../config';

export class Logger {
  private static logLevelMatches(level: LogLevel): boolean {
    const levelPriority = LogLevelMapping.get(level) || 0;
    const configuredPriority = LogLevelMapping.get(config.app.logLevel) || 0;

    return levelPriority <= configuredPriority;
  }

  static error(message: string) {
    if (this.logLevelMatches('error')) {
      console.log(`<app-error> ${message}`);
    }
  }

  static warning(message: string) {
    if (this.logLevelMatches('warning')) {
      console.log(`<app-warning> ${message}`);
    }
  }

  static info(message: string) {
    if (this.logLevelMatches('info')) {
      console.log(`<app-info> ${message}`);
    }
  }

  static debug(message: string) {
    if (this.logLevelMatches('debug')) {
      console.log(`<app-debug> ${message}`);
    }
  }

  static trace(message: string) {
    if (this.logLevelMatches('trace')) {
      console.log(`<app-trace> ${message}`);
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
