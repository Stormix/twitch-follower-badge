import { Hono } from 'hono';

const health = new Hono().get('/', (c) => c.text('Health ok!'));

export default health;
