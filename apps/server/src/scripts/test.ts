import db from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import logger from '@/lib/logger';
import { synchronizationQueue } from '@/lib/queues';

const test = async () => {
  const users = await db.select().from(usersTable);

  for (const user of users) {
    logger.info(`Queueing job for ${user.id}`);
    const job = synchronizationQueue.createJob({ userId: user.id });
    job.retries(2).timeout(120_000).save();
  }
};

test();
