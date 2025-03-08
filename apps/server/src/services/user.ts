import env from '@/env';
import db from '@/lib/db';
import { followersTable, moderatorsTable, subscribersTable, usersTable, vipsTable, type User } from '@/lib/db/schema';
import logger from '@/lib/logger';
import { queueSyncJob } from '@/lib/queues';
import type { CheckFollower, UserLogin } from '@/lib/validation';
import type { JwtPayload, JwtPayloadJSON } from '@/types/jwt';
import { getService } from '@/utils/services';
import { parseDuration } from '@/utils/time';
import { and, eq, isNull } from 'drizzle-orm';
import { sign, verify } from 'hono/jwt';
import { twitchService } from './twitch';

// TODO: check that the twitch tokens are still valid.

export class UserService {
  async get(userId: number) {
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!existingUser.length) {
      throw new Error('User not found');
    }

    return existingUser[0];
  }

  async login(login: UserLogin) {
    const twitchUser = await twitchService.getUser(login.accessToken, login.username);

    if (!twitchUser || twitchUser.id !== login.userId || twitchUser.name !== login.username) {
      throw new Error('Failed to get twitch user');
    }

    const existingUsers = await db.select().from(usersTable).where(eq(usersTable.twitchId, login.userId)).limit(1);
    let user: User | null = null;

    if (existingUsers.length === 0) {
      const insertedUsers = await db
        .insert(usersTable)
        .values({
          twitchId: login.userId,
          username: login.username,
          twitchAccessToken: login.accessToken,
        })
        .returning();

      if (insertedUsers.length === 0) {
        throw new Error('Failed to insert user');
      }

      user = insertedUsers[0];
    } else {
      const updatedUsers = await db
        .update(usersTable)
        .set({
          twitchAccessToken: login.accessToken,
          updatedAt: new Date(),
          deletedAt: null,
        })
        .where(eq(usersTable.twitchId, login.userId))
        .returning();

      if (updatedUsers.length === 0) {
        throw new Error('Failed to update user');
      }

      user = updatedUsers[0];
    }

    // Synchronize streamer followers
    await queueSyncJob({ userId: user.id });

    return this.generateTokens(user);
  }

  async generateTokens(user: User) {
    const seconds = parseDuration(env.JWT_EXPIRES_IN);
    const accessToken = await sign(
      {
        userId: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + seconds,
      } satisfies JwtPayload,
      env.JWT_SECRET,
    );

    const refreshToken = await sign(
      {
        userId: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + seconds,
      } satisfies JwtPayload,
      env.JWT_SECRET,
    );

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async authenticate(accessToken: string) {
    const decoded = await verify(accessToken, env.JWT_SECRET);
    if (!decoded.userId) {
      throw new Error('Invalid access token');
    }

    const userId = parseInt(decoded.userId as string);
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    // Check if user is soft deleted
    if (user[0].deletedAt) {
      throw new Error('User has been removed. Please re-authenticate.');
    }

    return user[0];
  }

  async refreshToken(jwtPayload: JwtPayloadJSON) {
    const userId = jwtPayload.userId;
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    return this.generateTokens(user[0]);
  }

  async checkFollower({
    username,
    userId,
  }: CheckFollower & {
    userId: number;
  }): Promise<{
    isFollower: boolean;
    isSubscriber: boolean;
    isVIP: boolean;
    isModerator: boolean;
    followingSince: Date;
  }> {
    try {
      // Extract the first part of the username if it contains spaces
      const cleanUsername = username.split(' ')[0].toLowerCase();

      const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user.length === 0) {
        throw new Error('User not found');
      }

      // Check if user is a follower
      const follower = await db
        .select()
        .from(followersTable)
        .where(
          and(
            eq(followersTable.followerName, cleanUsername),
            eq(followersTable.userId, userId),
            isNull(followersTable.unfollowedAt),
          ),
        )
        .limit(1);

      const isFollower = follower.length > 0;
      const followingSince = isFollower ? follower[0].followingSince : new Date();

      // Check if user is a subscriber from the database
      const subscriber = await db
        .select()
        .from(subscribersTable)
        .where(
          and(
            eq(subscribersTable.subscriberName, cleanUsername),
            eq(subscribersTable.userId, userId),
            isNull(subscribersTable.unsubscribedAt),
          ),
        )
        .limit(1);

      const isSubscriber = subscriber.length > 0;

      // Check if user is a VIP from the database
      const vip = await db
        .select()
        .from(vipsTable)
        .where(and(eq(vipsTable.vipName, cleanUsername), eq(vipsTable.userId, userId), isNull(vipsTable.removedAt)))
        .limit(1);

      const isVIP = vip.length > 0;

      // Check if user is a moderator from the database
      const moderator = await db
        .select()
        .from(moderatorsTable)
        .where(
          and(
            eq(moderatorsTable.moderatorName, cleanUsername),
            eq(moderatorsTable.userId, userId),
            isNull(moderatorsTable.removedAt),
          ),
        )
        .limit(1);

      const isModerator = moderator.length > 0;

      return {
        isFollower,
        isSubscriber,
        isVIP,
        isModerator,
        followingSince,
      };
    } catch (error) {
      console.error(error);
      return {
        isFollower: false,
        isSubscriber: false,
        isVIP: false,
        isModerator: false,
        followingSince: new Date(),
      };
    }
  }

  /**
   * Soft deletes a user by setting the deletedAt field
   * This will cause the user to be skipped during syncs and force them to re-authenticate
   */
  async removeUser(userId: number): Promise<void> {
    try {
      await db
        .update(usersTable)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId));

      logger.info(`User ${userId} has been soft deleted`);
    } catch (error) {
      console.error(`Failed to remove user ${userId}:`, error);
      throw new Error(`Failed to remove user: ${(error as Error).message}`);
    }
  }
}

export default getService(UserService);
