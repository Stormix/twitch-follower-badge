import env from '@/env';
import { syncAllModerators, syncAllSubscribers, syncAllVips, syncFollowers } from '@/jobs/sync';
import Queue from 'bee-queue';
import { Cron } from 'croner';
import { eq } from 'drizzle-orm';
import { Logger } from 'tslog';
import db from './db';
import { usersTable } from './db/schema';

interface SyncFollowersJob {
  userId: number;
}

const logger = new Logger({
  name: 'SynchronizationQueue',
});

export const synchronizationQueue = new Queue<SyncFollowersJob>('synchronization', {
  redis: {
    url: env.REDIS_URL,
  },
});

void synchronizationQueue.process(async (job) => {
  const { userId } = job.data;

  await syncFollowers(userId);
  await syncAllSubscribers(userId);
  await syncAllVips(userId);
  await syncAllModerators(userId);
});

synchronizationQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

synchronizationQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

export const queueSyncJob = async ({ userId, delay }: SyncFollowersJob & { delay?: number }) => {
  try {
    // Check if user is soft deleted
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      logger.warn(`User ${userId} not found, skipping sync job`);
      return;
    }

    if (user[0].deletedAt) {
      logger.info(`User ${userId} is soft deleted, skipping sync job`);
      return;
    }

    const job = await synchronizationQueue.createJob({ userId }).save();
    if (delay) {
      job.delayUntil(Date.now() + delay);
    }
    logger.info(`Queued sync job for user ${userId}`);
  } catch (error) {
    console.error('Failed to queue sync job', error);
  }
};

// Run every 15 min
export const syncCron = new Cron('*/15 * * * *', async () => {
  const users = await db.select().from(usersTable);
  logger.info(`Synchronizing ${users.length} users`);
  let index = 0;
  for (const user of users) {
    await queueSyncJob({ userId: user.id, delay: index * 30 * 1000 }); // 30 seconds delay
    index++;
  }
});
