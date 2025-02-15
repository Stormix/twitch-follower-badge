import type { ApiContext } from '@/types/api';
import { Hono } from 'hono';
import followers from './followers';
import health from './health';
import user from './user';

const api = new Hono<ApiContext>().route('/health', health).route('/user', user).route('/followers', followers);

export default api;
