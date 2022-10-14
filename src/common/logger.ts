import { createLogger, format, transports } from 'winston';
import { StreamOptions } from 'morgan';

const logFormat = format.printf(
  ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message} `,
);

export const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.splat(),
    format.timestamp(),
    logFormat,
  ),
  transports: [new transports.Console({ level: 'debug' })],
});

export const morganStream: StreamOptions = {
  write: (text: string) => logger.info(text.trim()),
};
