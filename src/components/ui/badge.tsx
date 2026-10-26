import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Sparkles,
} from "lucide-react";

export type BadgeVariant =
  | "strong"
  | "medium"
  | "weak"
  | "not_assessed"
  | "insufficient"
  | "preliminary"
  | "established"
  | "ai"
  | "syllabus"
  | "default"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label?: string;
  showIcon?: boolean;
}

export function Badge({
  className,
  variant = "default",
  label,
  children,
  showIcon = true,
  ...props
}: BadgeProps) {
  const getBadgeConfig = (): {
    classes: string;
    icon: React.ReactNode;
    defaultLabel: string;
  } => {
    switch (variant) {
      case "strong":
        return {
          classes: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]",
          icon: <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />,
          defaultLabel: "Strong",
        };
      case "medium":
        return {
          classes: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
          icon: <AlertTriangle className="w-3 h-3 text-[#D97706] shrink-0" />,
          defaultLabel: "Medium",
        };
      case "weak":
        return {
          classes: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
          icon: <AlertCircle className="w-3 h-3 text-[#DC2626] shrink-0" />,
          defaultLabel: "Weak",
        };
      case "not_assessed":
        return {
          classes: "bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4]",
          icon: <HelpCircle className="w-3 h-3 text-[#78716C] shrink-0" />,
          defaultLabel: "Not Assessed",
        };
      case "insufficient":
        return {
          classes: "bg-[#F5F5F4] text-[#78716C] border border-[#E7E5E4]",
          icon: <ShieldAlert className="w-3 h-3 text-[#78716C] shrink-0" />,
          defaultLabel: "Insufficient Evidence",
        };
      case "preliminary":
        return {
          classes: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
          icon: <Shield className="w-3 h-3 text-[#D97706] shrink-0" />,
          defaultLabel: "Preliminary Evidence",
        };
      case "established":
        return {
          classes: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]",
          icon: <ShieldCheck className="w-3 h-3 text-[#16A34A] shrink-0" />,
          defaultLabel: "Established Evidence",
        };
      case "ai":
        return {
          classes: "bg-[#F3EEFF] text-[#7C3AED] border border-[#DDD6FE]",
          icon: <Sparkles className="w-3 h-3 text-[#7C3AED] shrink-0" />,
          defaultLabel: "AI Grounded",
        };
      case "syllabus":
        return {
          classes: "bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]",
          icon: null,
          defaultLabel: "Syllabus",
        };
      case "neutral":
      case "default":
      default:
        return {
          classes: "bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]",
          icon: null,
          defaultLabel: "",
        };
    }
  };

  const config = getBadgeConfig();
  const displayContent = children || label || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight whitespace-nowrap",
        config.classes,
        className
      )}
      {...props}
    >
      {showIcon && config.icon}
      <span>{displayContent}</span>
    </span>
  );
}
