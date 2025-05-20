import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number
    max?: number
    color?: string
  }
>(({ className, value, max = 100, color = "bg-primary", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all progress-bar", color)}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
