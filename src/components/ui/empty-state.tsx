import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl border border-dashed border-[#E8E5DF] bg-white/70 backdrop-blur-md",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F2EFEB] text-[#121316] flex items-center justify-center mb-4 shadow-xs">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-[#121316] mb-1 tracking-tight">{title}</h3>
      <p className="text-xs text-[#5A554E] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
