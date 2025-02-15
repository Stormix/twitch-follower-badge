import { integer, pgTable, timestamp, unique, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  twitchId: varchar({ length: 255 }).notNull().unique(),
  twitchAccessToken: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
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
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (table) => ({
    followerUserUnique: unique().on(table.followerId, table.userId),
  }),
);

export type Follower = typeof followersTable.$inferSelect;
