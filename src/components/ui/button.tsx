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
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#121316] focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#121316] text-white hover:bg-black active:scale-[0.98] shadow-sm shadow-[#121316]/10",
      secondary:
        "bg-white hover:bg-[#F2EFEB] text-[#121316] border border-[#E8E5DF] active:scale-[0.98] shadow-xs",
      outline:
        "border border-[#E8E5DF] bg-transparent text-[#121316] hover:bg-[#F2EFEB] hover:border-[#D5D0C6] active:bg-[#E8E5DF]",
      ghost:
        "text-[#5A554E] hover:text-[#121316] hover:bg-[#F2EFEB] active:bg-[#E8E5DF]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] shadow-xs shadow-rose-600/20",
      subtle:
        "bg-[#F2EFEB] text-[#121316] hover:bg-[#E8E5DF] active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-xs px-4 py-2 gap-2 font-semibold",
      lg: "text-sm px-6 py-2.5 gap-2.5 font-semibold",
      icon: "h-9 w-9 p-0 rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
