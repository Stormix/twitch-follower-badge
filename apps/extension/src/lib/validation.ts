import { z } from "zod"

export const userLoginSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  username: z.string(),
  accessToken: z.string()
})

export type UserLogin = z.infer<typeof userLoginSchema>
