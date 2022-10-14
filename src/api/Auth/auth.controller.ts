import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { ResponseManager } from '../../util/ResponseManager';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.register(req.body);
      ResponseManager.created(res, user);
    } catch (error) {
      ResponseManager.error(res, error);
    }
  };

  public validateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.validateUser(req.params.token);
      ResponseManager.ok(res);
    } catch (error) {
      ResponseManager.error(res, error);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const authTokenPair = await this.authService.login(req.body);
      ResponseManager.ok(res, authTokenPair);
    } catch (error) {
      ResponseManager.error(res, error);
    }
  };

  public refreshAccessToken = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const accessToken = await this.authService.refreshAccessToken(req.body);
      ResponseManager.ok(res, accessToken);
    } catch (error) {
      ResponseManager.error(res, error);
    }
  };
}
