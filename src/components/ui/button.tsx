import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" &&
          "bg-gradient-to-r from-amber-300 via-yellow-600 to-emerald-700 text-zinc-950 shadow-[0_18px_42px_rgba(201,166,107,0.22)] hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(201,166,107,0.28)] focus-visible:outline-amber-300",
        variant === "secondary" &&
          "border border-white/10 bg-white/[0.08] text-stone-50 hover:bg-white/[0.12]",
        variant === "ghost" && "text-stone-300 hover:bg-white/[0.08]",
        className,
      )}
      {...props}
    />
  );
}
