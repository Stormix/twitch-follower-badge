import { queueSyncJob } from '@/lib/queues';

const test = async () => {
  await queueSyncJob({ userId: 3 });
};

test();
