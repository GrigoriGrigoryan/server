import 'reflect-metadata';
import { ConnectionOptions, createConnection } from 'typeorm';

import { getApp } from './app';
import { config } from './config';
import { logger } from './common';

export async function bootstrap() {
  try {
    logger.info(`Establishing a database connection`);
    await createConnection(config.database as ConnectionOptions);
    logger.info(`Database connection established successfully`);
    const app = getApp();
    await app.listen(config.server.port, () => {
      logger.info(`Server is up and listening on port ${config.server.port}`);
    });
  } catch (error) {
    logger.error('Failed to bootstrap the server');
    throw error;
  }
}

bootstrap();
