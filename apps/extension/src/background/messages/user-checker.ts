import scope from "@/instrument"
import { getApi } from "@/lib/api"
import { logger } from "@/lib/logger"

import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  username: string
}

export type ResponseBody = {
  success: boolean
  isFollower: boolean
  isSubscriber: boolean
  isVIP: boolean
  isModerator: boolean
  followingSince: Date
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    logger.info(`Looking for ${req.body.username}`)

    const api = await getApi()
    const response = await api.post<{
      isFollower: boolean
      isSubscriber: boolean
      isVIP: boolean
      isModerator: boolean
      followingSince: Date
    }>("/followers/check", {
      username: req.body.username
    })

    logger.info(
      `${req.body.username} is ${response.data.isFollower ? "a" : "not a"} fan :)`
    )

    if (response.data.isSubscriber) {
      logger.info(`${req.body.username} is a subscriber!`)
    }

    if (response.data.isVIP) {
      logger.info(`${req.body.username} is a VIP!`)
    }

    if (response.data.isModerator) {
      logger.info(`${req.body.username} is a moderator!`)
    }

    res.send({
      success: true,
      isFollower: response.data.isFollower,
      isSubscriber: response.data.isSubscriber,
      isVIP: response.data.isVIP,
      isModerator: response.data.isModerator,
      followingSince: response.data.followingSince
    })
  } catch (error) {
    logger.error("Failed to check user", error)
    scope.captureException(error)
    res.send({
      success: false,
      isFollower: false,
      isSubscriber: false,
      isVIP: false,
      isModerator: false,
      followingSince: null
    })
  }
}
export default handler
