CREATE TABLE "followers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "followers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"followerId" varchar(255) NOT NULL,
	"followerName" varchar(255) NOT NULL,
	"followingSince" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "followers_followerId_userId_unique" UNIQUE("followerId","userId")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "twitchRefreshToken";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "twitchTokenExpiresAt";