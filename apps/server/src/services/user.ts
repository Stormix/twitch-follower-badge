import env from '@/env';
import db from '@/lib/db';
import { followersTable, usersTable, type User } from '@/lib/db/schema';
import { queueSyncJob } from '@/lib/queues';
import type { CheckFollower, UserLogin } from '@/lib/validation';
import type { JwtPayload } from '@/types/jwt';
import { getService } from '@/utils/services';
import { parseDuration } from '@/utils/time';
import { and, eq } from 'drizzle-orm';
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

    return user[0];
  }

  async refreshToken(refreshToken: string) {
    const decoded = await verify(refreshToken, env.JWT_SECRET);
    if (!decoded.userId) {
      throw new Error('Invalid refresh token');
    }
    const userId = parseInt(decoded.userId as string);
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    return {
      ...this.generateTokens(user[0]),
      refreshToken: refreshToken,
    };
  }

  async checkFollower({
    username,
    userId,
  }: CheckFollower & {
    userId: number;
  }): Promise<{
    isFollower: boolean;
    followingSince: Date;
  }> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user.length === 0) {
        throw new Error('User not found');
      }

      const follower = await db
        .select()
        .from(followersTable)
        .where(and(eq(followersTable.followerName, username.toLowerCase()), eq(followersTable.userId, userId)))
        .limit(1);

      if (follower.length === 0) {
        return {
          isFollower: false,
          followingSince: new Date(),
        };
      }

      return {
        isFollower: true,
        followingSince: follower[0].followingSince,
      };
    } catch (error) {
      console.error(error);
      return {
        isFollower: false,
        followingSince: new Date(),
      };
    }
  }
}

export default getService(UserService);
