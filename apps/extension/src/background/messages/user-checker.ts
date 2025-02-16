import scope from "@/instrument"
import { getApi } from "@/lib/api"
import { logger } from "@/lib/logger"
import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  username: string
}

export type ResponseBody = {
  isFollower: boolean
  followingSince: Date
}

const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  try {
    logger.info(`Looking for ${req.body.username}`)

  const api = await getApi()
  const response = await api.post<{
    isFollower: boolean
    followingSince: Date
  }>('/followers/check', {
    username: req.body.username,
  })

  logger.info(`${req.body.username} is ${response.data.isFollower ? 'a' : 'not a'} fan :)`)

  res.send({
      isFollower: response.data.isFollower,
      followingSince: response.data.followingSince
    })
  } catch (error) {
    logger.error('Failed to check user', error)
    scope.captureException(error)
    res.send({
      isFollower: false,
      followingSince: null
    })
  }
}
export default handler