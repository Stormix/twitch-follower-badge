import useFollowsYou from "@/hooks/use-follows-you"
import cssText from "data-text:@/style.css"
import { format } from "date-fns"
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList } from "plasmo"

let selectedUser: string | null = null

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const anchorList = []
  const sevenTvUserCardContainer = document.querySelector(
    ".seventv-user-card-float"
  )
  const nativeUserCardContainer = document.querySelector(".viewer-card")

  if (nativeUserCardContainer) {
    // Determine user
    const userLink = nativeUserCardContainer.querySelector("a.tw-link") as
      | HTMLAnchorElement
      | undefined
    const rows = nativeUserCardContainer.querySelectorAll(
      ".viewer-card-header__display-name > div"
    )

    if (userLink && rows.length > 1) {
      selectedUser = userLink.href.split("/").pop()

      // return anchor
      anchorList.push({
        element: rows[1],
        insertPosition: "afterend" as const
      })
    }
  }

  if (sevenTvUserCardContainer) {
    const metrics = sevenTvUserCardContainer.querySelectorAll(
      ".seventv-user-card-metrics > p"
    )
    const name = sevenTvUserCardContainer.querySelector(
      ".seventv-chat-user-username"
    )?.textContent

    selectedUser = name ?? null

    if (metrics.length > 1) {
      anchorList.push({
        element: metrics[1],
        insertPosition: "afterend" as const
      })
    }
  }

  return anchorList
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

const FollowIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="currentColor"
      viewBox="0 0 256 256">
      <path d="M250.53,199.59l-24,8a8,8,0,0,1-9.69-4L187.05,144H104a8,8,0,0,1-8-8V106.34A56,56,0,0,0,112,216c25.91,0,50.09-18.05,56.25-42a8,8,0,1,1,15.5,4c-8.06,31.3-38.23,54-71.75,54A72,72,0,0,1,96,89.81v-19a28,28,0,1,1,16,0V88h56a8,8,0,0,1,0,16H112v24h80a8,8,0,0,1,7.15,4.42l28.9,57.8,17.42-5.81a8,8,0,0,1,5.06,15.18Z"></path>
    </svg>
  )
}

export default function FollowText() {
  const {
    isFollower: followsYou,
    followingSince: followDate,
    success
  } = useFollowsYou(selectedUser)
  if (!followsYou || !success) return null
  return (
    <div className="flex mt-0.5 items-center gap-2 text-white font-inter font-feature-default antialiased">
      <FollowIcon />
      <div className="text-[13px] leading-6">
        Follows you since {format(followDate, "MMMM d, yyyy")}
      </div>
    </div>
  )
}
