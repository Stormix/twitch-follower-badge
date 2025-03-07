import api from '@/api';
import env from '@/env';
import logger from '@/lib/logger';
import { version } from '@/version';
import { Hono } from 'hono';

const app = new Hono().use('*', async (c, next) => {
  c.res.headers.set('X-Powered-By', 'Bun / Hono');
  c.res.headers.set('X-Version', version);
  await next();
});

export const routes = app.route('/api', api);
export type AppType = typeof routes;

export default {
  port: env.PORT,
  fetch: app.fetch,
  development: env.isDev,
};

logger.info(`Listening on ${env.PORT}`);
