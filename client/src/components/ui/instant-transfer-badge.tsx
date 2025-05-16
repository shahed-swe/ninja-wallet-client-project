import { FC } from "react";
import { Zap } from "lucide-react";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface InstantTransferBadgeProps {
  isInstantTransfer: boolean;
  className?: string;
}

export const InstantTransferBadge: FC<InstantTransferBadgeProps> = ({ 
  isInstantTransfer,
  className = ""
}) => {
  if (!isInstantTransfer) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`flex items-center gap-1 bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 ${className}`}
          >
            <Zap className="h-3 w-3" />
            <span className="text-xs">Instant</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Instant transfer - processed immediately</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
