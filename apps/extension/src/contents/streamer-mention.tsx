import Badge from "@/components/badge"
import useFollowsYou from "@/hooks/use-follows-you"
import cssText from "data-text:@/style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useMemo } from "react"

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchor = document.querySelector(
    "div.streamer-card__balloon > div > div > div > div > div > div >div:nth-child(2) > div > div:nth-child(2) > div"
  )
  return [
    {
      element: anchor,
      insertPosition: "afterend" as const
    }
  ]
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
    const element = anchor.element.querySelector("a") as HTMLAnchorElement
    const rawName = element?.textContent?.trim()?.toLowerCase() || ""
    // Extract the first part of the username if it contains spaces
    return rawName.split(" ")[0]
  }, [anchor.element])

  const {
    isFollower: followsYou,
    isSubscriber,
    isVIP,
    isModerator,
    followingSince: followDate,
    success
  } = useFollowsYou(name)
  if (!success) return null
  return (
    <Badge
      isFollower={followsYou}
      isSubscriber={isSubscriber}
      isVIP={isVIP}
      isModerator={isModerator}
      followingSince={followDate}
    />
  )
}
