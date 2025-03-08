import { integer, pgTable, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  twitchId: varchar({ length: 255 }).notNull().unique(),
  twitchAccessToken: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  deletedAt: timestamp('deletedAt'),
});

export type User = typeof usersTable.$inferSelect;

export const followersTable = pgTable(
  'followers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull(),
    followerId: varchar({ length: 255 }).notNull(),
    followerName: varchar({ length: 255 }).notNull(),
    followingSince: timestamp().notNull().defaultNow(),
    unfollowedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    followerUserUnique: unique().on(table.followerId, table.userId),
  }),
);

export type Follower = typeof followersTable.$inferSelect;

export const subscribersTable = pgTable(
  'subscribers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull(),
    subscriberId: varchar({ length: 255 }).notNull(),
    subscriberName: varchar({ length: 255 }).notNull(),
    unsubscribedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    subscriberUserUnique: unique().on(table.subscriberId, table.userId),
  }),
);

export type Subscriber = typeof subscribersTable.$inferSelect;

export const vipsTable = pgTable(
  'vips',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull(),
    vipId: varchar({ length: 255 }).notNull(),
    vipName: varchar({ length: 255 }).notNull(),
    removedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    vipUserUnique: unique().on(table.vipId, table.userId),
  }),
);

export type Vip = typeof vipsTable.$inferSelect;

export const moderatorsTable = pgTable(
  'moderators',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer().notNull(),
    moderatorId: varchar({ length: 255 }).notNull(),
    moderatorName: varchar({ length: 255 }).notNull(),
    removedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    moderatorUserUnique: unique().on(table.moderatorId, table.userId),
  }),
);

export type Moderator = typeof moderatorsTable.$inferSelect;
