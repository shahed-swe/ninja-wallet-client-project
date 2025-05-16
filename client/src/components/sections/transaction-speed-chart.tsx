import { FC, useMemo } from "react";
import { Transaction } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";
import { InstantTransferBadge } from "@/components/ui/instant-transfer-badge";

interface TransactionSpeedChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

type TransactionSpeedData = {
  name: string;
  instantCount: number;
  regularCount: number;
};

export const TransactionSpeedChart: FC<TransactionSpeedChartProps> = ({ 
  transactions,
  isLoading
}) => {
  // Extract data for the chart - monthly transactions by type
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Group transactions by month
    const monthlyData: Record<string, {
      instantCount: number;
      regularCount: number;
    }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { instantCount: 0, regularCount: 0 };
      }
      
      if (transaction.isInstantTransfer) {
        monthlyData[monthYear].instantCount += 1;
      } else {
        monthlyData[monthYear].regularCount += 1;
      }
    });
    
    // Convert to chart data format
    return Object.entries(monthlyData)
      .map(([name, data]) => ({
        name,
        instantCount: data.instantCount,
        regularCount: data.regularCount
      }))
      .sort((a, b) => {
        // Sort by date (assuming name is in format "MMM YYYY")
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
  }, [transactions]);
  
  // Get total counts
  const totalCounts = useMemo(() => {
    if (!transactions || transactions.length === 0) return { instant: 0, regular: 0, total: 0 };
    
    const instant = transactions.filter(t => t.isInstantTransfer).length;
    const regular = transactions.filter(t => !t.isInstantTransfer).length;
    
    return {
      instant,
      regular,
      total: instant + regular
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Transaction Speed Analysis</CardTitle>
          <CardDescription>Loading transaction data...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 bg-muted/30 animate-pulse rounded-md" />
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Transaction Speed Analysis</CardTitle>
          <CardDescription>No transaction data available</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Complete transactions to see speed analytics
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Transaction Speed Analysis</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>
            {totalCounts.instant} instant transfers ({Math.round((totalCounts.instant / totalCounts.total) * 100)}%) of total {totalCounts.total} transactions
          </span>
          <InstantTransferBadge isInstantTransfer={true} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const formatted = name === 'instantCount' ? 'Instant Transfers' : 'Regular Transfers';
                  return [value, formatted];
                }}
              />
              <Legend 
                formatter={(value) => {
                  return value === 'instantCount' ? 'Instant Transfers' : 'Regular Transfers';
                }} 
              />
              <Bar 
                name="instantCount" 
                dataKey="instantCount" 
                stackId="a"
                fill="#f59e0b"
              />
              <Bar 
                name="regularCount" 
                dataKey="regularCount" 
                stackId="a" 
                fill="#4f46e5"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionSpeedChart;
