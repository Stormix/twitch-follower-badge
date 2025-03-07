import Badge from "@/components/badge"
import useFollowsYou from "@/hooks/use-follows-you"
import cssText from "data-text:@/style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useMemo } from "react"

const selectedUser: string | null = null

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchors = document.querySelectorAll(
    "a.preview-card-channel-link > div p"
  )
  return Array.from(anchors).map((anchor) => ({
    element: anchor,
    insertPosition: "afterend" as const
  }))
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

export default function CardInfo({ anchor }) {
  const name = useMemo(() => {
    const element = anchor.element as HTMLAnchorElement
    const rawName = element?.textContent?.trim()?.toLowerCase() || ""
    // Extract the first part of the username if it contains spaces
    return rawName.split(" ")[0]
  }, [anchor.element])

  const {
    isFollower,
    isSubscriber,
    isVIP,
    isModerator,
    followingSince,
    success
  } = useFollowsYou(name)
  if (!success) return null
  return (
    <Badge
      isFollower={isFollower}
      isSubscriber={isSubscriber}
      isVIP={isVIP}
      isModerator={isModerator}
      followingSince={followingSince}
    />
  )
}
