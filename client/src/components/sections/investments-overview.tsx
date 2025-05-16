import { FC } from "react";
import { Investment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AssetIcon from "@/components/ui/asset-icon";

interface InvestmentsOverviewProps {
  investments: Investment[];
  isLoading: boolean;
  onViewAll: () => void;
}

const InvestmentsOverview: FC<InvestmentsOverviewProps> = ({ 
  investments, 
  isLoading,
  onViewAll 
}) => {
  // Calculate percentage change for display
  const getPercentageChange = (investment: Investment) => {
    const change = ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
    return change.toFixed(1);
  };
  
  // Calculate current value
  const getCurrentValue = (investment: Investment) => {
    return (investment.quantity * investment.currentPrice).toFixed(2);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Investments</CardTitle>
          <Button variant="link" className="text-sm" onClick={onViewAll}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Skeleton loading state
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-secondary/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : investments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No investments yet. Click "Invest" to get started.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {investments.slice(0, 2).map((investment) => (
                <div key={investment.id} className="bg-secondary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <AssetIcon symbol={investment.assetSymbol} size="sm" className="mr-2" />
                      <span className="font-medium">{investment.assetName}</span>
                    </div>
                    <span className={
                      parseFloat(getPercentageChange(investment)) >= 0 
                        ? "text-green-500 text-sm" 
                        : "text-red-500 text-sm"
                    }>
                      {parseFloat(getPercentageChange(investment)) >= 0 ? "+" : ""}
                      {getPercentageChange(investment)}%
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-1">
                    {investment.quantity.toFixed(investment.assetType === "crypto" ? 8 : 2)} {investment.assetSymbol}
                  </h4>
                  <p className="text-muted-foreground text-sm">≈ ${getCurrentValue(investment)}</p>
                </div>
              ))}
            </div>
            
            {investments.length > 2 && (
              <div className="bg-secondary/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <AssetIcon symbol={investments[2].assetSymbol} size="sm" className="mr-2" />
                    <span className="font-medium">{investments[2].assetName}</span>
                  </div>
                  <span className={
                    parseFloat(getPercentageChange(investments[2])) >= 0 
                      ? "text-green-500 text-sm" 
                      : "text-red-500 text-sm"
                  }>
                    {parseFloat(getPercentageChange(investments[2])) >= 0 ? "+" : ""}
                    {getPercentageChange(investments[2])}%
                  </span>
                </div>
                <h4 className="text-xl font-semibold mb-1">
                  {investments[2].quantity.toFixed(investments[2].assetType === "crypto" ? 8 : 2)} {investments[2].assetSymbol}
                </h4>
                <p className="text-muted-foreground text-sm">≈ ${getCurrentValue(investments[2])}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentsOverview;
