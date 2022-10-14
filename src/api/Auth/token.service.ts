import jwt, { JwtPayload } from 'jsonwebtoken';

import { logger, TokenTypes } from '../../common';
import { config } from '../../config';
import { AuthTokenPair } from '../../common';

export class TokenService {
  constructor() {
    logger.info("'TokenService' initialized");
  }

  public async signToken(type: TokenTypes, payload: object): Promise<string> {
    const { secret, exp } = config.auth.token[type];

    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, secret, { expiresIn: exp }, (error, token) => {
        if (error) {
          reject(error);
        }
        resolve(token);
      });
    });
  }

  public async verifyToken(
    token: string,
    type: TokenTypes,
  ): Promise<JwtPayload> {
    const { secret } = config.auth.token[type];

    const decodedPayload = await new Promise<string | JwtPayload>(
      (resolve, reject) => {
        jwt.verify(token, secret, (error, decoded) => {
          if (error) {
            reject(error);
          }
          resolve(decoded);
        });
      },
    );

    if (typeof decodedPayload === 'string') {
      return {
        userId: '',
      } as JwtPayload;
    }

    return decodedPayload;
  }

  public async generateAuthTokenPair(userId: string): Promise<AuthTokenPair> {
    const accessToken = await this.signToken(TokenTypes.ACCESS, { userId });
    const refreshToken = await this.signToken(TokenTypes.REFRESH, { userId });

    return {
      accessToken,
      refreshToken,
    };
  }
}
