"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  variant?: "primary" | "strong" | "medium" | "weak" | "auto";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  showLabel = false,
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const getVariantColor = () => {
    if (variant === "auto") {
      if (percentage >= 80) return "bg-[#16A34A]";
      if (percentage >= 60) return "bg-[#D97706]";
      return "bg-[#DC2626]";
    }
    switch (variant) {
      case "strong":
        return "bg-[#16A34A]";
      case "medium":
        return "bg-[#D97706]";
      case "weak":
        return "bg-[#DC2626]";
      case "primary":
      default:
        return "bg-[#7C3AED]";
    }
  };

  const heightClass = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }[size];

  return (
    <div className={cn("w-full flex items-center gap-3", className)}>
      <div
        className={cn(
          "w-full bg-[#E7E5E4] rounded-full overflow-hidden relative",
          heightClass
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", getVariantColor())}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-[#1C1917] min-w-9 text-right font-mono">
          {percentage}%
        </span>
      )}
    </div>
  );
}
