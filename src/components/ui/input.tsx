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
        "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm text-stone-50 shadow-inner shadow-black/20 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-amber-300/10",
        className,
      )}
      {...props}
    />
  );
}
