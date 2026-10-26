"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ScoreRingProps {
  score: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function ScoreRing({
  score,
  size = 90,
  strokeWidth = 8,
  label,
  className,
}: ScoreRingProps) {
  const percentage = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 80) return "#15803D"; // Emerald
    if (val >= 60) return "#B45309"; // Amber
    return "#DC2626"; // Rose
  };

  const strokeColor = getColor(percentage);

  return (
    <div
      className={cn("inline-flex flex-col items-center justify-center relative", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E5DF"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Active Stroke */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Center Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold text-[#121316] tracking-tight font-mono">
          {percentage}%
        </span>
        {label && (
          <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
