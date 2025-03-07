import { formatDate } from "@/lib/date"
import { storage } from "@/lib/storage"
import { Tooltip } from "radix-ui"
import { FaGem, FaHeart, FaStar, FaUser } from "react-icons/fa"
import { LuSword } from "react-icons/lu"

import { useStorage } from "@plasmohq/storage/hook"

const Badge = ({
  isFollower,
  isSubscriber,
  isVIP,
  isModerator,
  followingSince
}: {
  isFollower: boolean
  isSubscriber: boolean
  isVIP: boolean
  isModerator: boolean
  followingSince: Date
}) => {
  const [showIfNotFollower] = useStorage({
    key: "showBadgeForNonFollowers",
    instance: storage
  })

  // Don't show badge if user is not a follower/subscriber/VIP/moderator and showIfNotFollower is false
  if (
    !isFollower &&
    !isSubscriber &&
    !isVIP &&
    !isModerator &&
    !showIfNotFollower
  )
    return null

  // Determine badge text, colors, and icon based on user status
  let badgeText = ""
  let badgeColor = ""
  let circleColor = ""
  let tooltipText = ""
  let Icon = FaUser

  if (isSubscriber) {
    badgeText = "Subscriber"
    badgeColor = "bg-purple-800"
    circleColor = "bg-purple-400"
    tooltipText = "This user is subscribed to your channel"
    Icon = FaStar
  } else if (isModerator) {
    badgeText = "Moderator"
    badgeColor = "bg-green-800"
    circleColor = "bg-green-400"
    tooltipText = "This user is a moderator in your channel"
    Icon = LuSword
  } else if (isVIP) {
    badgeText = "VIP"
    badgeColor = "bg-pink-800"
    circleColor = "bg-pink-400"
    tooltipText = "This user is a VIP in your channel"
    Icon = FaGem
  } else if (isFollower) {
    badgeText = "Follows you"
    badgeColor = "bg-blue-800"
    circleColor = "bg-blue-400"
    tooltipText = `Follows you since ${formatDate(followingSince)}`
    Icon = FaHeart
  } else if (showIfNotFollower) {
    badgeText = "Not a fan"
    badgeColor = "bg-zinc-800"
    circleColor = "bg-zinc-500"
    tooltipText = "Not a fan"
    Icon = FaUser
  }

  return (
    <Tooltip.Provider delayDuration={800} skipDelayDuration={500}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div
            className={`${badgeColor} text-white py-1 px-2 rounded-md ml-2 flex items-center shadow-sm`}>
            <div
              className={`${circleColor} rounded-full p-1 mr-1.5 flex items-center justify-center w-5 h-5 shadow-inner`}>
              <Icon size={10} className="text-white" />
            </div>
            <span className="text-xs font-medium">{badgeText}</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content className="bg-black/95 text-white p-2 rounded-md mb-4 text-xs">
          {tooltipText}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default Badge
