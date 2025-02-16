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
    sendToBackground<RequestBody, ResponseBody>({
      name: "user-checker",
      body: {
        username
      }
    }).then((res) => {
      setResponse(res)
    })
  }, [])

  return {
    success: response?.success,
    isFollower: response?.isFollower,
    followingSince: response?.followingSince
  }
}

export default useFollowsYou
