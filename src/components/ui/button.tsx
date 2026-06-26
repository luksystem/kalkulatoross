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
          "bg-gradient-to-r from-stone-950 via-stone-800 to-amber-950 text-white shadow-[0_18px_35px_rgba(31,26,23,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_45px_rgba(31,26,23,0.28)] focus-visible:outline-stone-900",
        variant === "secondary" &&
          "border border-stone-200 bg-white/70 text-stone-900 hover:bg-white",
        variant === "ghost" && "text-stone-700 hover:bg-stone-100",
        className,
      )}
      {...props}
    />
  );
}
