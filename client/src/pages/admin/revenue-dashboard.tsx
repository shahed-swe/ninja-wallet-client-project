import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp, Users, CreditCard, Clock, AlertCircle } from 'lucide-react';

interface RevenueStats {
  totalRevenue: number;
  transactionCount: number;
  averageFeePerTransaction: number;
  premiumRevenue: number;
  standardRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  potentialRevenue: number; 
  revenueLostToNonPremium: number;
  revenueByType: {
    send: number;
    receive: number;
    trade: number;
    exchange: number;
    cardTransaction: number;
    investment: number;
  };
  subscriptionRevenue: number;
  premiumUserCount: number;
  totalUsers: number;
  premiumConversionRate: number;
  projectedAnnualRevenue: number;
  timeBasedData: {
    daily: { date: string; revenue: number }[];
    weekly: { week: string; revenue: number }[];
    monthly: { month: string; revenue: number }[];
  };
}

const RevenueDashboard = () => {
  const { data: revenueStats, isLoading, isError } = useQuery<RevenueStats>({
    queryKey: ["/api/admin/revenue"],
    refetchInterval: 60000, // Refetch every minute
    retry: 1,
  });

  const [timeView, setTimeView] = useState('daily');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !revenueStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h1 className="text-xl">Failed to load revenue data</h1>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Calculate month-over-month growth
  const monthlyGrowth = revenueStats.previousMonthRevenue > 0 
    ? ((revenueStats.currentMonthRevenue - revenueStats.previousMonthRevenue) / revenueStats.previousMonthRevenue) * 100
    : 100;

  // Calculate revenue distribution percentages
  const revenueByTypeTotal = Object.values(revenueStats.revenueByType).reduce((a, b) => a + b, 0);
  const revenueDistribution = Object.entries(revenueStats.revenueByType).map(([key, value]) => ({
    type: key,
    amount: value,
    percentage: revenueByTypeTotal > 0 ? (value / revenueByTypeTotal) * 100 : 0
  }));
  
  // Sort revenue distribution by percentage (highest first)
  revenueDistribution.sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track revenue streams and identify growth opportunities</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h2 className="text-3xl font-bold">${revenueStats.totalRevenue.toFixed(2)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className={`h-4 w-4 mr-1 ${monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={monthlyGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {monthlyGrowth.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Annual</p>
                <h2 className="text-3xl font-bold">${revenueStats.projectedAnnualRevenue.toFixed(2)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">
                Based on current growth trends
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Premium Users</p>
                <h2 className="text-3xl font-bold">
                  {revenueStats.premiumUserCount}/{revenueStats.totalUsers}
                </h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={revenueStats.premiumConversionRate} className="h-2" />
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Conversion rate: {revenueStats.premiumConversionRate.toFixed(1)}%</span>
                <span>Target: 30%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Fee/Transaction</p>
                <h2 className="text-3xl font-bold">${revenueStats.averageFeePerTransaction.toFixed(2)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">
                Across {revenueStats.transactionCount} transactions
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Optimization Insights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Optimization Opportunities</CardTitle>
          <CardDescription>
            Potential strategies to increase revenue based on current usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Premium Conversion Opportunity</h3>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                  High Impact
                </Badge>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span>Current standard user revenue:</span>
                  <span className="font-medium">${revenueStats.standardRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Potential premium fee revenue:</span>
                  <span className="font-medium">${revenueStats.potentialRevenue.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-destructive font-semibold">
                  <span>Revenue lost to non-premium:</span>
                  <span>${revenueStats.revenueLostToNonPremium.toFixed(2)}</span>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Implement Premium Upsell Campaign
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Revenue Distribution</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  Insights
                </Badge>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="space-y-3">
                  {revenueDistribution.map(item => (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{item.type}:</span>
                        <span>${item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Focus on Top Revenue Streams
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time-based Revenue Visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            Track revenue patterns across different time periods
          </CardDescription>
          <TabsList className="mt-2">
            <TabsTrigger 
              value="daily" 
              onClick={() => setTimeView('daily')}
              className={timeView === 'daily' ? 'bg-primary text-primary-foreground' : ''}
            >
              Daily
            </TabsTrigger>
            <TabsTrigger 
              value="weekly" 
              onClick={() => setTimeView('weekly')}
              className={timeView === 'weekly' ? 'bg-primary text-primary-foreground' : ''}
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger 
              value="monthly" 
              onClick={() => setTimeView('monthly')}
              className={timeView === 'monthly' ? 'bg-primary text-primary-foreground' : ''}
            >
              Monthly
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {/* Simplified visualization for demo purposes */}
            <div className="h-full flex items-end">
              {timeView === 'daily' && revenueStats.timeBasedData.daily.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-end mx-1 w-full"
                  title={`${item.date}: $${item.revenue.toFixed(2)}`}
                >
                  <div 
                    className="w-full bg-primary rounded-t-sm" 
                    style={{ 
                      height: `${Math.max(10, (item.revenue / Math.max(...revenueStats.timeBasedData.daily.map(d => d.revenue))) * 250)}px` 
                    }}
                  ></div>
                  <span className="text-xs mt-1 truncate w-full text-center">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
              
              {timeView === 'weekly' && revenueStats.timeBasedData.weekly.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-end mx-1 w-full"
                  title={`${item.week}: $${item.revenue.toFixed(2)}`}
                >
                  <div 
                    className="w-full bg-primary rounded-t-sm" 
                    style={{ 
                      height: `${Math.max(10, (item.revenue / Math.max(...revenueStats.timeBasedData.weekly.map(d => d.revenue))) * 250)}px` 
                    }}
                  ></div>
                  <span className="text-xs mt-1 truncate w-full text-center">
                    {item.week}
                  </span>
                </div>
              ))}
              
              {timeView === 'monthly' && revenueStats.timeBasedData.monthly.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-end mx-1 w-full"
                  title={`${item.month}: $${item.revenue.toFixed(2)}`}
                >
                  <div 
                    className="w-full bg-primary rounded-t-sm" 
                    style={{ 
                      height: `${Math.max(10, (item.revenue / Math.max(...revenueStats.timeBasedData.monthly.map(d => d.revenue))) * 250)}px` 
                    }}
                  ></div>
                  <span className="text-xs mt-1 truncate w-full text-center">
                    {new Date(item.month + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Premium vs. Standard Revenue</CardTitle>
            <CardDescription>
              Revenue comparison between premium and standard users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span>Premium Users ({revenueStats.premiumUserCount})</span>
                  </div>
                  <span className="font-medium">${revenueStats.premiumRevenue.toFixed(2)}</span>
                </div>
                <Progress 
                  value={
                    (revenueStats.premiumRevenue / (revenueStats.premiumRevenue + revenueStats.standardRevenue)) * 100
                  } 
                  className="h-2" 
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-zinc-300 mr-2"></div>
                    <span>Standard Users ({revenueStats.totalUsers - revenueStats.premiumUserCount})</span>
                  </div>
                  <span className="font-medium">${revenueStats.standardRevenue.toFixed(2)}</span>
                </div>
                <Progress 
                  value={
                    (revenueStats.standardRevenue / (revenueStats.premiumRevenue + revenueStats.standardRevenue)) * 100
                  } 
                  className="h-2 bg-zinc-200" 
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-1">
                  <span>Premium Subscription Revenue</span>
                  <span className="font-medium">${revenueStats.subscriptionRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Avg. Revenue per Premium User</span>
                  <span className="font-medium">
                    ${
                      revenueStats.premiumUserCount > 0 
                        ? (revenueStats.premiumRevenue / revenueStats.premiumUserCount).toFixed(2) 
                        : '0.00'
                    }
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Avg. Revenue per Standard User</span>
                  <span className="font-medium">
                    ${
                      (revenueStats.totalUsers - revenueStats.premiumUserCount) > 0 
                        ? (revenueStats.standardRevenue / (revenueStats.totalUsers - revenueStats.premiumUserCount)).toFixed(2) 
                        : '0.00'
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Metrics</CardTitle>
            <CardDescription>
              Key transaction stats and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Transactions</TableCell>
                  <TableCell className="text-right">{revenueStats.transactionCount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Average Fee per Transaction</TableCell>
                  <TableCell className="text-right">${revenueStats.averageFeePerTransaction.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Current Month Revenue</TableCell>
                  <TableCell className="text-right">${revenueStats.currentMonthRevenue.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Previous Month Revenue</TableCell>
                  <TableCell className="text-right">${revenueStats.previousMonthRevenue.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Month-over-Month Growth</TableCell>
                  <TableCell className={`text-right ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Premium Conversion Rate</TableCell>
                  <TableCell className="text-right">{revenueStats.premiumConversionRate.toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Revenue Lost to Non-Premium</TableCell>
                  <TableCell className="text-right text-red-600">${revenueStats.revenueLostToNonPremium.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueDashboard;
