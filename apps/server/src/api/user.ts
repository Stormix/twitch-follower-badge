import logger from '@/lib/logger';
import { userLoginSchema } from '@/lib/validation';
import userService from '@/services/user';
import type { ApiContext } from '@/types/api';
import { zValidator as validator } from '@hono/zod-validator';
import { Hono } from 'hono';

const api = new Hono<ApiContext>()
  .use('*', async (c, next) => {
    // const session = await auth.api.getSession({ headers: c.req.raw.headers });

    // if (!session) {
    //   c.set('user', null);
    //   c.set('session', null);
    //   return next();
    // }

    // c.set('user', session.user);
    // c.set('session', session.session);
    return next();
  })
  .post('/login', validator('json', userLoginSchema), async (c) => {
    const { userId, username, accessToken } = c.req.valid('json');
    logger.info('Login request received:', { username });
    const tokens = await userService.login({ userId, username, accessToken });
    logger.info('Login successful:', { username });
    return c.json(tokens);
  });

export default api;
