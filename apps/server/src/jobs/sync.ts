import db from '@/lib/db';
import { followersTable, moderatorsTable, subscribersTable, usersTable, vipsTable } from '@/lib/db/schema';
import mainLogger from '@/lib/logger';
import { getService } from '@/utils/services';
import type { HelixChannelFollower, HelixModerator, HelixSubscription, HelixUserRelation } from '@twurple/api';
import { eq, sql } from 'drizzle-orm';
import batch from 'it-batch';
import { TwitchService } from '../services/twitch';

const logger = mainLogger.getSubLogger({ name: 'syncJob' });

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

    // First, mark all existing followers as unfollowed
    await db
      .update(followersTable)
      .set({
        unfollowedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(sql`${followersTable.userId} = ${userId} AND ${followersTable.unfollowedAt} IS NULL`);

    // Then insert/update current followers
    await db
      .insert(followersTable)
      .values(
        uniqueFollowers.map((follower) => ({
          followerId: follower.userId,
          followerName: follower.userName,
          userId,
          followingSince: new Date(follower.followDate),
          unfollowedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: [followersTable.followerId, followersTable.userId],
        set: {
          followingSince: sql`EXCLUDED."followingSince"`,
          unfollowedAt: null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error(`Failed to bulk insert followers for user ${userId}:`, error);
  }
};

const bulkInsertSubscribers = async (userId: number, subscribers: HelixSubscription[]) => {
  try {
    const uniqueSubscribers = Object.values(
      subscribers.reduce(
        (acc, subscriber) => ({
          ...acc,
          [subscriber.userId]: subscriber,
        }),
        {} as Record<string, HelixSubscription>,
      ),
    );

    // Mark all existing subscribers as unsubscribed
    await db
      .update(subscribersTable)
      .set({
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(sql`${subscribersTable.userId} = ${userId} AND ${subscribersTable.unsubscribedAt} IS NULL`);

    // Insert/update current subscribers
    await db
      .insert(subscribersTable)
      .values(
        uniqueSubscribers.map((subscriber) => ({
          subscriberId: subscriber.userId,
          subscriberName: subscriber.userName,
          userId,
          unsubscribedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: [subscribersTable.subscriberId, subscribersTable.userId],
        set: {
          unsubscribedAt: null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error(`Failed to bulk insert subscribers for user ${userId}:`, error);
  }
};

const bulkInsertVips = async (userId: number, vips: HelixUserRelation[]) => {
  try {
    const uniqueVips = Object.values(
      vips.reduce(
        (acc, vip) => ({
          ...acc,
          [vip.id]: vip,
        }),
        {} as Record<string, HelixUserRelation>,
      ),
    );

    // Mark all existing VIPs as removed
    await db
      .update(vipsTable)
      .set({
        removedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(sql`${vipsTable.userId} = ${userId} AND ${vipsTable.removedAt} IS NULL`);

    // Insert/update current VIPs
    await db
      .insert(vipsTable)
      .values(
        uniqueVips.map((vip) => ({
          vipId: vip.id,
          vipName: vip.name,
          userId,
          removedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: [vipsTable.vipId, vipsTable.userId],
        set: {
          removedAt: null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error(`Failed to bulk insert vips for user ${userId}:`, error);
  }
};

const bulkInsertModerators = async (userId: number, moderators: HelixModerator[]) => {
  try {
    const uniqueModerators = Object.values(
      moderators.reduce(
        (acc, moderator) => ({
          ...acc,
          [moderator.userId]: moderator,
        }),
        {} as Record<string, HelixModerator>,
      ),
    );

    // Mark all existing moderators as removed
    await db
      .update(moderatorsTable)
      .set({
        removedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(sql`${moderatorsTable.userId} = ${userId} AND ${moderatorsTable.removedAt} IS NULL`);

    // Insert/update current moderators
    await db
      .insert(moderatorsTable)
      .values(
        uniqueModerators.map((moderator) => ({
          moderatorId: moderator.userId,
          moderatorName: moderator.userName,
          userId,
          removedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: [moderatorsTable.moderatorId, moderatorsTable.userId],
        set: {
          removedAt: null,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error(`Failed to bulk insert moderators for user ${userId}:`, error);
  }
};

export const syncFollowers = async (userId: number) => {
  try {
    // Check if user is soft deleted
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      logger.warn(`User ${userId} not found, skipping follower sync`);
      return;
    }

    if (user[0].deletedAt) {
      logger.info(`User ${userId} is soft deleted, skipping follower sync`);
      return;
    }

    logger.info(`Starting follower sync for user ${userId}`);
    const twitchService = getService(TwitchService);
    const followersCount = await twitchService.getFollowersCount(userId);
    const batches = batch(twitchService.getFollowers(userId), 100);

    let upserted = 0;
    for await (const batch of batches) {
      await bulkInsertFollowers(userId, batch);
      upserted += batch.length;
      logger.info(`Upserted ${upserted}/${followersCount} followers for user ${userId}`);
    }
  } catch (error) {
    console.error(`Failed to sync followers for user ${userId}:`, error);
  }
};

export const syncAllSubscribers = async (userId: number) => {
  try {
    // Check if user is soft deleted
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      logger.warn(`User ${userId} not found, skipping subscriber sync`);
      return;
    }

    if (user[0].deletedAt) {
      logger.info(`User ${userId} is soft deleted, skipping subscriber sync`);
      return;
    }

    logger.info(`Starting subscriber sync for user ${userId}`);
    const twitchService = getService(TwitchService);
    const batches = batch(twitchService.getSubscribers(userId), 100);

    let upserted = 0;
    for await (const batch of batches) {
      await bulkInsertSubscribers(userId, batch);
      upserted += batch.length;
      logger.info(`Upserted ${upserted} subscribers for user ${userId}`);
    }
  } catch (error) {
    console.error(`Failed to sync subscribers for user ${userId}:`, error);
  }
};

export const syncAllVips = async (userId: number) => {
  try {
    // Check if user is soft deleted
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      logger.warn(`User ${userId} not found, skipping VIP sync`);
      return;
    }

    if (user[0].deletedAt) {
      logger.info(`User ${userId} is soft deleted, skipping VIP sync`);
      return;
    }

    logger.info(`Starting VIP sync for user ${userId}`);
    const twitchService = getService(TwitchService);
    const batches = batch(twitchService.getVIPs(userId), 100);

    let upserted = 0;
    for await (const batch of batches) {
      await bulkInsertVips(userId, batch);
      upserted += batch.length;
      logger.info(`Upserted ${upserted} vips for user ${userId}`);
    }
  } catch (error) {
    console.error(`Failed to sync vips for user ${userId}:`, error);
  }
};

export const syncAllModerators = async (userId: number) => {
  try {
    // Check if user is soft deleted
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      logger.warn(`User ${userId} not found, skipping moderator sync`);
      return;
    }

    if (user[0].deletedAt) {
      logger.info(`User ${userId} is soft deleted, skipping moderator sync`);
      return;
    }

    logger.info(`Starting moderator sync for user ${userId}`);
    const twitchService = getService(TwitchService);
    const batches = batch(twitchService.getModerators(userId), 100);

    let upserted = 0;
    for await (const batch of batches) {
      await bulkInsertModerators(userId, batch);
      upserted += batch.length;
      logger.info(`Upserted ${upserted} moderators for user ${userId}`);
    }
  } catch (error) {
    console.error(`Failed to sync moderators for user ${userId}:`, error);
  }
};
