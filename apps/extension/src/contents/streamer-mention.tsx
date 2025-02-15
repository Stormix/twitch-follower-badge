import useFollowsYou from "@/hooks/use-follows-you"
import cssText from "data-text:@/style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"
import { useMemo } from "react"

let selectedUser: string | null = null


export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchor = document.querySelector("div.streamer-card__balloon > div > div > div > div > div > div >div:nth-child(2) > div > div:nth-child(2) > div")
  return [{
    element: anchor,
    insertPosition: "afterend" as const
  }]
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

export default function CardInfo({
  anchor
}) {
  const name = useMemo(() => {
    const element = anchor.element.querySelector("a") as HTMLAnchorElement
    return element?.textContent?.trim()?.toLowerCase()
  }, [anchor.element])

  const { isFollower: followsYou, followingSince: followDate } = useFollowsYou(name)  
  if (!followsYou) return null
  return <div className="bg-zinc-800 text-white/50 py-1/2 px-2 rounded-md">Follows you</div>
}