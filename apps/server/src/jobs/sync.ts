import db from '@/lib/db';
import { followersTable } from '@/lib/db/schema';
import mainLogger from '@/lib/logger';
import { getService } from '@/utils/services';
import type { HelixChannelFollower } from '@twurple/api';
import { sql } from 'drizzle-orm';
import batch from 'it-batch';
import { TwitchService } from '../services/twitch';

const logger = mainLogger.getSubLogger({ name: 'syncFollowers' });

const bulkInsertFollowers = async (userId: number, followers: HelixChannelFollower[]) => {
  try {
    const uniqueFollowers = Object.values(
      followers.reduce(
        (acc, follower) => ({
          ...acc,
          [follower.userId]: follower,
        }),
        {} as Record<string, HelixChannelFollower>,
      ),
    );

    await db
      .insert(followersTable)
      .values(
        uniqueFollowers.map((follower) => ({
          followerId: follower.userId,
          followerName: follower.userName,
          userId,
          followingSince: new Date(follower.followDate),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: [followersTable.followerId, followersTable.userId],
        set: {
          followingSince: sql`EXCLUDED."followingSince"`,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    logger.error(`Failed to bulk insert followers for user ${userId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const syncFollowers = async (userId: number) => {
  const twitchService = getService(TwitchService);
  const followersCount = await twitchService.getFollowersCount(userId);
  const batches = batch(twitchService.getFollowers(userId), 100);

  let upserted = 0;
  for await (const batch of batches) {
    await bulkInsertFollowers(userId, batch);
    upserted += batch.length;
    logger.info(`Upserted ${upserted}/${followersCount} followers for user ${userId}`);
  }
};
