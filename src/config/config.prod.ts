import { TokenTypes } from '../common/token-types';

export const prodConfig = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.SERVER_PORT) || 3000,
    host: process.env.SERVER_HOST,
  },
  database: {
    type: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    entities: ['./**/*.entity.ts'],
    synchronize: false,
  },
  auth: {
    saltRound: Number(process.env.AUTH_SALT_ROUND),
    token: {
      [TokenTypes.ACCESS]: {
        secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
        exp: process.env.AUTH_ACCESS_TOKEN_EXP,
      },
      [TokenTypes.REFRESH]: {
        secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
        exp: process.env.AUTH_REFRESH_TOKEN_EXP,
      },
      [TokenTypes.ACTIVATION]: {
        secret: process.env.AUTH_ACTIVATION_TOKEN_SECRET,
        exp: process.env.AUTH_ACTIVATION_TOKEN_EXP,
      },
    },
  },
  email: {
    apiKey: process.env.MAIL_SERVICE_API_KEY,
    senderAddress: process.env.MAIL_SENDER_ADDRESS,
  },
};
