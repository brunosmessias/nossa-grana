"use client"

import { cn } from "@/lib/utils"
import { colorOptions } from "@/shared/icons"

export function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-muted/50 p-3">
      {colorOptions.map((color) => (
        <button
          key={color.hex}
          type="button"
          className={cn(
            "size-8 rounded-full border-2 border-transparent transition-all duration-200 hover:scale-110",
            value === color.hex && "scale-125 border-foreground/80",
          )}
          style={{ backgroundColor: color.hex }}
          onClick={() => onChange(color.hex)}
        />
      ))}
    </div>
  )
}
