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
          classes: "bg-emerald-50/90 text-emerald-800 border border-emerald-200 shadow-xs",
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
          defaultLabel: "Strong",
        };
      case "medium":
        return {
          classes: "bg-amber-50/90 text-amber-900 border border-amber-200 shadow-xs",
          icon: <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />,
          defaultLabel: "Medium",
        };
      case "weak":
        return {
          classes: "bg-rose-50/90 text-rose-800 border border-rose-200 shadow-xs",
          icon: <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />,
          defaultLabel: "Weak",
        };
      case "not_assessed":
        return {
          classes: "bg-[#F2EFEB] text-[#6B665E] border border-[#E8E5DF]",
          icon: <HelpCircle className="w-3 h-3 text-[#6B665E] shrink-0" />,
          defaultLabel: "Not Assessed",
        };
      case "insufficient":
        return {
          classes: "bg-rose-50 text-rose-800 border border-rose-200",
          icon: <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />,
          defaultLabel: "Insufficient Evidence",
        };
      case "preliminary":
        return {
          classes: "bg-amber-50 text-amber-900 border border-amber-200",
          icon: <Shield className="w-3 h-3 text-amber-600 shrink-0" />,
          defaultLabel: "Preliminary Evidence",
        };
      case "established":
        return {
          classes: "bg-emerald-50 text-emerald-800 border border-emerald-200",
          icon: <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />,
          defaultLabel: "Established Evidence",
        };
      case "ai":
        return {
          classes: "bg-white text-[#121316] border border-[#E8E5DF] shadow-xs",
          icon: <Sparkles className="w-3 h-3 text-[#121316] shrink-0" />,
          defaultLabel: "AI Grounded",
        };
      case "syllabus":
        return {
          classes: "bg-[#F2EFEB] text-[#4A463F] border border-[#E8E5DF]",
          icon: null,
          defaultLabel: "Syllabus",
        };
      case "neutral":
      case "default":
      default:
        return {
          classes: "bg-[#F2EFEB] text-[#4A463F] border border-[#E8E5DF]",
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
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap",
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
