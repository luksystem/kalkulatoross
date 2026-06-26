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
          "bg-stone-950 text-white shadow-lg shadow-stone-900/15 hover:-translate-y-0.5 hover:bg-stone-800 focus-visible:outline-stone-900",
        variant === "secondary" &&
          "border border-stone-200 bg-white/70 text-stone-900 hover:bg-white",
        variant === "ghost" && "text-stone-700 hover:bg-stone-100",
        className,
      )}
      {...props}
    />
  );
}
