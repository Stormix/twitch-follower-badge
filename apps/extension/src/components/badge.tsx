import { formatDate } from "@/lib/date"
import { storage } from "@/lib/storage"
import { Tooltip } from "radix-ui"

import { useStorage } from "@plasmohq/storage/hook"

const Badge = ({
  isFollower,
  followingSince
}: {
  isFollower: boolean
  followingSince: Date
}) => {
  const [showIfNotFollower] = useStorage({
    key: "showBadgeForNonFollowers",
    instance: storage
  })

  if (!isFollower && !showIfNotFollower) return null
  return (
    <Tooltip.Provider delayDuration={800} skipDelayDuration={500}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div className="bg-zinc-800 text-white/50 py-1/2 px-2 rounded-md ml-2">
            {isFollower ? "Follows you" : ""}
            {!isFollower && showIfNotFollower ? "Not a fan" : ""}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content className="bg-black/95 text-white p-1 rounded-md mb-4">
          {isFollower
            ? `Follows you since ${formatDate(followingSince)}`
            : "Not a fan"}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default Badge
