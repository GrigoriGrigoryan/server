import { Router } from 'express';

import { AuthController } from './auth.controller';

export function getAuthRouter(): Router {
  const authController = new AuthController();
  const authRouter = Router();

  authRouter.post('/register', authController.register);
  authRouter.post('/login', authController.login);
  authRouter.post('/register/validate/:token', authController.validateUser);
  authRouter.post('/token', authController.refreshAccessToken);

  return authRouter;
}
