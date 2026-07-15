import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-badge border border-line bg-bg px-3 text-sm text-ink transition-colors placeholder:text-ink-faint focus-visible:border-teal focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-bear",
        className,
      )}
      {...props}
    />
  );
}
