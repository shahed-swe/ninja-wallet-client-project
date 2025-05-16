import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface PremiumUpsellCardProps {
  size?: "small" | "medium" | "large";
  customMessage?: string;
  hideButton?: boolean;
}

export function PremiumUpsellCard({ 
  size = "medium", 
  customMessage,
  hideButton = false
}: PremiumUpsellCardProps) {
  const [, navigate] = useLocation();
  
  // Style variations based on size
  const containerStyles = {
    small: "text-sm p-3",
    medium: "p-4",
    large: "p-5"
  };
  
  const titleStyles = {
    small: "text-base flex items-center gap-1.5",
    medium: "text-lg flex items-center gap-2",
    large: "text-xl flex items-center gap-2.5"
  };
  
  const contentStyles = {
    small: "text-xs mt-1.5",
    medium: "text-sm mt-2",
    large: "mt-3"
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 overflow-hidden">
      <CardHeader className={containerStyles[size]}>
        <CardTitle className={titleStyles[size]}>
          <Sparkles className="h-4 w-4 text-purple-700" />
          <span className="text-purple-800">Upgrade to Premium</span>
          <Badge className="ml-auto bg-purple-600 hover:bg-purple-700">Save 46%</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`${containerStyles[size]} pt-0 pb-3 text-purple-900 ${contentStyles[size]}`}>
        {customMessage || (
          <div className="space-y-1.5">
            <div className="flex items-center">
              <Zap className="h-3.5 w-3.5 text-purple-700 mr-2" />
              <span>Only 8% fee on all transfers (vs 10-15%)</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-3.5 w-3.5 text-purple-700 mr-2" />
              <span>Only 1% for instant transfers (vs 2%)</span>
            </div>
          </div>
        )}
      </CardContent>
      
      {!hideButton && (
        <CardFooter className={containerStyles[size]}>
          <Button 
            className="w-full bg-purple-700 hover:bg-purple-800 text-white"
            onClick={() => navigate("/billing/premium")}
            size={size === "small" ? "sm" : size === "large" ? "lg" : "default"}
          >
            Upgrade Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default PremiumUpsellCard;