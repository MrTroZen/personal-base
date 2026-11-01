import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-transparent px-4 text-sm font-medium transition-[background-color,color,border-color,transform] duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-disabled active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-active",
        secondary:
          "border-border-strong bg-surface text-fg hover:bg-surface-2 active:bg-surface-3",
        ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg active:bg-surface-3",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 min-h-8 rounded-sm px-3 text-xs",
        lg: "h-12 min-h-12 rounded-lg px-5 text-base",
        icon: "size-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
