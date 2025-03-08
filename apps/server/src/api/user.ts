import env from '@/env';
import logger from '@/lib/logger';
import { userLoginSchema } from '@/lib/validation';
import userService from '@/services/user';
import type { ApiContext } from '@/types/api';
import type { JwtPayload } from '@/types/jwt';
import { zValidator as validator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';

const api = new Hono<ApiContext>()
  .post('/login', validator('json', userLoginSchema), async (c) => {
    const { userId, username, accessToken } = c.req.valid('json');
    logger.info('Login request received:', { username });
    const tokens = await userService.login({ userId, username, accessToken });
    logger.info('Login successful:', { username });
    return c.json(tokens);
  })
  .post(
    '/refresh',
    jwt({
      secret: env.JWT_SECRET,
    }),
    async (c) => {
      const payload = c.get('jwtPayload') as JwtPayload;
      logger.info('Refresh request received');
      if (!payload) {
        console.error('Refresh request received but invalid payload');
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const tokens = await userService.refreshToken(payload);
      return c.json(tokens);
    },
  );

export default api;
