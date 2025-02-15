import { cleanEnv, port, str } from 'envalid';
import { TWITCH_SCOPES } from './constants';

const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ default: 'development' }),
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '1h' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d' }),
  TWITCH_CLIENT_ID: str(),
  TWITCH_SCOPES: str({
    default: 'openid user:read:email ' + TWITCH_SCOPES.join(' '),
  }),
  REDIS_URL: str({ default: 'redis://localhost:6379' }),
});

export type Env = typeof env;
export default env;
