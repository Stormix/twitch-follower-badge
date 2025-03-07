import env from '@/env';
import { syncAllModerators, syncAllSubscribers, syncAllVips, syncFollowers } from '@/jobs/sync';
import Queue from 'bee-queue';
import { Cron } from 'croner';
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
  logger.error('Queue error:', error);
});

synchronizationQueue.on('failed', (job, error) => {
  logger.error(`Job ${job.id} failed:`, error);
});

export const queueSyncJob = async ({ userId, delay }: SyncFollowersJob & { delay?: number }) => {
  logger.info(`Queueing job for ${userId} (delay: ${delay})`);
  const job = synchronizationQueue.createJob({ userId });
  const delayUntil = delay ? new Date(Date.now() + delay) : undefined;

  if (delayUntil) {
    logger.debug(`Delaying job for ${delayUntil}`);
    job.delayUntil(delayUntil);
  }

  return job.retries(2).timeout(120_000).save();
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
