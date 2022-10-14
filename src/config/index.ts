import * as dotEnv from 'dotenv';

dotEnv.config();

import { devConfig } from './config.dev';
import { prodConfig } from './config.prod';

const env = process.env.NODE_ENV || 'development';

export const config = env === 'development' ? devConfig : prodConfig;
