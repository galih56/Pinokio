import type React from "react"
import { cn } from "@/lib/utils"

interface CountIndicatorProps {
  count: number
  maxCount?: number
  className?: string
}

export function CountIndicator({ count, maxCount = 99, className }: CountIndicatorProps) {
  if (count <= 0) return null

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-amber-500 rounded-full min-w-[1.2rem] h-[1.2rem]",
        className,
      )}
    >
      {count > maxCount ? `${maxCount}+` : count}
    </div>
  )
}

export function CountIndicatorContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative inline-flex", className)}>{children}</div>
}

