"use client"

import { cn } from "@/lib/utils"
import { iconOptions } from "@/shared/icons"
import { Button } from "@/components/ui/button"

export function IconPicker({
  value,
  color,
  onChange,
}: {
  value: string
  color: string
  onChange: (iconValue: string) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-2 rounded-xl bg-muted/50 p-3">
      {iconOptions.map((option) => {
        const IconComp = option.icon
        const isSelected = value === option.value
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "rounded-lg transition-all",
              isSelected && "outline-2 outline-offset-2",
            )}
            style={isSelected ? { outlineColor: color, outlineStyle: "solid", backgroundColor: `${color}20` } : undefined}
            onClick={() => onChange(option.value)}
            title={option.label}
          >
            <IconComp size={18} />
          </Button>
        )
      })}
    </div>
  )
}
