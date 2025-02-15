import env from '@/env';
import { drizzle } from 'drizzle-orm/neon-http';

const db = drizzle(env.DATABASE_URL);

export default db;
