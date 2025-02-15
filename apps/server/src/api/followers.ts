import env from '@/env';
import logger from '@/lib/logger';
import { checkFollowerSchema } from '@/lib/validation';
import userService from '@/services/user';
import type { JwtPayload } from '@/types/jwt';
import { zValidator as validator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { jwt, type JwtVariables } from 'hono/jwt';

const api = new Hono<{
  Variables: JwtVariables;
}>()
  .use(
    '*',
    jwt({
      secret: env.JWT_SECRET,
    }),
  )
  .post('/check', validator('json', checkFollowerSchema), async (c) => {
    const { username } = c.req.valid('json');
    const payload = c.get('jwtPayload') as JwtPayload;
    if (!payload) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    logger.info('Check follower request received:', { username });

    return c.json(await userService.checkFollower({ username, userId: payload.userId }));
  });

export default api;
