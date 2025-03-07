import type {
  RequestBody,
  ResponseBody
} from "@/background/messages/user-checker"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

const useFollowsYou = (username: string | null) => {
  const [response, setResponse] = useState<ResponseBody | null>(null)

  useEffect(() => {
    if (!username) return

    // Extract the first part of the username if it contains spaces
    const cleanUsername = username.split(" ")[0]

    sendToBackground<RequestBody, ResponseBody>({
      name: "user-checker",
      body: {
        username: cleanUsername
      }
    }).then((res) => {
      setResponse(res)
    })
  }, [])

  return {
    success: response?.success,
    isFollower: response?.isFollower,
    isSubscriber: response?.isSubscriber,
    isVIP: response?.isVIP,
    isModerator: response?.isModerator,
    followingSince: response?.followingSince
  }
}

export default useFollowsYou
