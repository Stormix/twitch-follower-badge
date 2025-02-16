import scope from "@/instrument"
import { authenticateUsingTwitch } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { storage } from "@/lib/storage"

import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
  action: "login" | "logout"
}

export type ResponseBody = {
  success: boolean
}

const login = async () => {
  try {
    const { accessToken, refreshToken, user } = await authenticateUsingTwitch()

    await storage.set("access_token", accessToken)
    await storage.set("refresh_token", refreshToken)
    await storage.set("user", user)

    return {
      success: true
    }
  } catch (error) {
    logger.error("Failed to login", error)
    return {
      success: false
    }
  }
}

const logout = async () => {
  try {
    await storage.remove("access_token")
    await storage.remove("user")

    return {
      success: true
    }
  } catch (error) {
    logger.error("Failed to logout", error)

    return {
      success: false
    }
  }
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    switch (req.body.action) {
      case "login": {
        res.send(await login())
        break
      }
      case "logout": {
        res.send(await logout())
        break
      }
      default:
        throw new Error("Invalid action")
    }
  } catch (error) {
    logger.error("Failed to handle auth action", error)
    scope.captureException(error)
    res.send({
      success: false
    })
  }
}

export default handler
