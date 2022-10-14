import express, { Application, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';

import { morganStream } from './common';
import { getAuthRouter } from './api/Auth/user.router';

export function getApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(morgan('short', { stream: morganStream }));
  app.use('/api/v1/auth', getAuthRouter());
  app.get('/api/status', (req: Request, res: Response) => {
    res.send('Application is ap');
  });

  return app;
}
