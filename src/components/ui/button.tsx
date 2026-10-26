import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:scale-[0.98] shadow-sm shadow-[#7C3AED]/20",
      secondary:
        "bg-[#F3EEFF] text-[#7C3AED] hover:bg-[#E9DEFF] active:scale-[0.98]",
      outline:
        "border border-[#E7E5E4] bg-white text-[#1C1917] hover:bg-[#FAF9F6] active:bg-[#F5F5F4]",
      ghost:
        "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] active:bg-[#E7E5E4]",
      danger:
        "bg-[#DC2626] text-white hover:bg-[#B91C1C] active:scale-[0.98] shadow-sm shadow-red-500/20",
      subtle:
        "bg-[#F5F5F4] text-[#1C1917] hover:bg-[#E7E5E4] active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-6 py-2.5 gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
