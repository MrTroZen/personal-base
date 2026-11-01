import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-fg shadow-sm outline-none transition-[border-color,box-shadow] duration-fast placeholder:text-fg-subtle focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30 disabled:cursor-not-allowed disabled:opacity-disabled",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
