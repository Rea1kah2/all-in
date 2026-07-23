"use client";

import * as Primitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;

export function PopoverContent({
  className,
  sideOffset = 6,
  align = "center",
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 w-72 rounded-card border border-line bg-surface-raised p-4 shadow-xl shadow-black/5 outline-none",
          className,
        )}
        {...props}
      />
    </Primitive.Portal>
  );
}
