import { z } from 'zod';

export const userLoginSchema = z.object({
  userId: z.string(),
  username: z.string(),
  accessToken: z.string(),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

export const checkFollowerSchema = z.object({
  username: z.string(),
});

export type CheckFollower = z.infer<typeof checkFollowerSchema>;
