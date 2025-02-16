import Badge from "@/components/badge"
import useFollowsYou from "@/hooks/use-follows-you"
import cssText from "data-text:@/style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"

let selectedUser: string | null = null

export const getStreamInfoAnchor = () => {
  const streamInfoAnchor = {
    element: document.querySelector(
      "div.metadata-layout__support > div > div > div" // TODO: improve
    ),
    insertPosition: "afterend" as const
  }
  const name =
    (
      document.querySelector(
        "div.metadata-layout__support a"
      ) as HTMLAnchorElement | null
    )?.href
      ?.split("/")
      ?.pop() ?? null

  return { anchor: streamInfoAnchor, name }
}

export const getOfflineAnchor = () => {
  const element = document.querySelector(
    "div.home-header-sticky > div > div > div:nth-child(2)"
  )
  const offlineAnchor = {
    element: element,
    insertPosition: "afterend" as const
  }
  const name =
    (element?.querySelector("a") as HTMLAnchorElement | null)?.href
      ?.split("/")
      ?.pop() ?? null
  return { anchor: offlineAnchor, name }
}

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const { anchor: streamInfoAnchor, name: streamInfoName } =
    getStreamInfoAnchor()
  const { anchor: offlineAnchor, name: offlineName } = getOfflineAnchor()

  if (streamInfoName) {
    selectedUser = streamInfoName
  }
  if (offlineName) {
    selectedUser = offlineName
  }

  return [streamInfoAnchor, offlineAnchor]
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

export default function CardInfo() {
  const { isFollower, followingSince, success } = useFollowsYou(selectedUser)
  if (!success) return null
  return <Badge isFollower={isFollower} followingSince={followingSince} />
}
