import { logger } from "@/lib/logger"
import { storage } from "@/lib/storage"
import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  username: string
}
 
export type ResponseBody = {
  isFollower: boolean
  followingSince: Date
}

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  logger.info(`Looking for ${req.body.username}`)

  const response = await fetch(`${process.env.PLASMO_PUBLIC_BACKEND_URL}/api/followers/check`, {
    method: 'POST',
    body: JSON.stringify({ username: req.body.username }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await storage.get('access_token')}`
    },
  })

  const data = await response.json()

  logger.info(`${req.body.username} is ${data.isFollower ? 'a' : 'not a'} fan :)`)

  res.send({
    isFollower: data.isFollower,
    followingSince: data.followingSince
  })
}
 
export default handler