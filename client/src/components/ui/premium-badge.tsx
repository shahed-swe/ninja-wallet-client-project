import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  variant?: "default" | "subtle" | "outline";
  size?: "sm" | "default" | "lg";
}

export function PremiumBadge({ 
  className, 
  variant = "default", 
  size = "default" 
}: PremiumBadgeProps) {
  const variants = {
    default: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600",
    subtle: "bg-amber-100 text-amber-800 border-amber-200",
    outline: "bg-transparent text-amber-500 border-amber-500"
  };
  
  const sizes = {
    sm: "text-xs py-0.5 px-1.5",
    default: "text-xs py-1 px-2",
    lg: "text-sm py-1 px-3"
  };
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-medium",
      variants[variant],
      sizes[size],
      className
    )}>
      <Crown className="mr-1 h-3 w-3" />
      Premium
    </span>
  );
}
