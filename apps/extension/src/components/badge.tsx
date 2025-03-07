import { formatDate } from "@/lib/date"
import { storage } from "@/lib/storage"
import { Tooltip } from "radix-ui"

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

  // Determine badge text and color based on user status
  let badgeText = ""
  let badgeColor = ""
  let tooltipText = ""

  if (isSubscriber) {
    badgeText = "Subscriber"
    badgeColor = "bg-purple-700"
    tooltipText = "This user is subscribed to your channel"
  } else if (isModerator) {
    badgeText = "Moderator"
    badgeColor = "bg-green-700"
    tooltipText = "This user is a moderator in your channel"
  } else if (isVIP) {
    badgeText = "VIP"
    badgeColor = "bg-pink-700"
    tooltipText = "This user is a VIP in your channel"
  } else if (isFollower) {
    badgeText = "Follows you"
    badgeColor = "bg-blue-700"
    tooltipText = `Follows you since ${formatDate(followingSince)}`
  } else if (showIfNotFollower) {
    badgeText = "Not a fan"
    badgeColor = "bg-zinc-800"
    tooltipText = "Not a fan"
  }

  return (
    <Tooltip.Provider delayDuration={800} skipDelayDuration={500}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div
            className={`${badgeColor} text-white py-1/2 px-2 rounded-md ml-2`}>
            {badgeText}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content className="bg-black/95 text-white p-1 rounded-md mb-4">
          {tooltipText}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default Badge
