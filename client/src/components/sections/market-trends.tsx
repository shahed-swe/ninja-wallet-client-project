import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssetIcon from "@/components/ui/asset-icon";

interface Trend {
  name: string;
  symbol: string;
  price: number;
  change: number;
  type: string;
}

interface MarketTrendsProps {
  trends: Trend[];
}

const MarketTrends: FC<MarketTrendsProps> = ({ trends }) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Market Trends</CardTitle>
          <Select defaultValue="24h">
            <SelectTrigger className="w-[90px] h-8">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="1y">1y</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground">
              No market data available
            </div>
          ) : (
            trends.map((trend) => (
              <div key={trend.symbol} className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center">
                  <AssetIcon symbol={trend.symbol} size="sm" className="mr-3" />
                  <div>
                    <p className="font-medium">{trend.name}</p>
                    <p className="text-muted-foreground text-xs">{trend.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${trend.price.toFixed(2)}</p>
                  <p className={`text-xs ${trend.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {trend.change >= 0 ? "+" : ""}{trend.change}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketTrends;
