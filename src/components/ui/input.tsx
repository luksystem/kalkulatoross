import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-stone-200 bg-white/80 px-4 text-sm text-stone-950 shadow-inner shadow-stone-900/[0.03] outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:ring-4 focus:ring-stone-200/70",
        className,
      )}
      {...props}
    />
  );
}
