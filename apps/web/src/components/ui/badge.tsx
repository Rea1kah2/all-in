import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border border-line bg-surface text-ink-muted",
        signal: "bg-brass-bg text-brass-ink",
        bull: "bg-bull-bg text-bull",
        bear: "bg-bear-bg text-bear",
        hold: "bg-hold-bg text-hold",
      },
      shape: {
        rounded: "rounded-badge",
        pill: "rounded-pill",
      },
      numeric: {
        true: "font-mono tabular-nums",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      shape: "rounded",
      numeric: false,
    },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, shape, numeric, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, shape, numeric, className }))}
      {...props}
    />
  );
}

export { badgeVariants };
