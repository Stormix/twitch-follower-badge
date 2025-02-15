import type { RequestBody, ResponseBody } from "@/background/messages/user-checker"
import { sendToBackground } from "@plasmohq/messaging"
import { useEffect, useState } from "react"

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
    isFollower: response?.isFollower,
    followingSince: response?.followingSince
  }
}

export default useFollowsYou