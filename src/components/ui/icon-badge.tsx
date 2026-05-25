"use client"

import { cn } from "@/lib/utils"
import { getIconByValue } from "@/shared/icons"

export function IconBadge({
  icon,
  color,
  size = "md",
  className,
}: {
  icon: string
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const IconComp = getIconByValue(icon)

  const sizeClasses = {
    sm: "size-6 [&>svg]:size-3",
    md: "size-8 [&>svg]:size-4",
    lg: "size-10 [&>svg]:size-5",
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <IconComp />
    </div>
  )
}
