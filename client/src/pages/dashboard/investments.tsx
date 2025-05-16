import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AppLayout from "@/components/layout/app-layout";
import MarketTrends from "@/components/sections/market-trends";

const tradeSchema = z.object({
  assetType: z.string().min(1, "Asset type is required"),
  assetName: z.string().min(1, "Asset is required"),
  assetSymbol: z.string().min(1, "Asset symbol is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be greater than 0" }
  ),
});

type TradeFormValues = z.infer<typeof tradeSchema>;

export default function Investments() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [investType, setInvestType] = useState("");

  // Amounts calculated from form input
  const [baseAmount, setBaseAmount] = useState(0);
  const [feeAmount, setFeeAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Fetch market trends
  const { data: marketTrends } = useQuery({
    queryKey: ["/api/market-trends"],
    enabled: isAuthenticated,
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      assetType: "",
      assetName: "",
      assetSymbol: "",
      amount: "",
    },
  });
  
  // Watch amount field to calculate fee
  const watchAmount = form.watch("amount");
  
  useEffect(() => {
    const amount = parseFloat(watchAmount) || 0;
    const fee = parseFloat((amount * 0.13).toFixed(2));
    const total = amount + fee;
    
    setBaseAmount(amount);
    setFeeAmount(fee);
    setTotalAmount(total);
  }, [watchAmount]);
  
  const tradeMutation = useMutation({
    mutationFn: (data: { assetType: string; assetName: string; assetSymbol: string; amount: number }) => {
      return apiRequest("POST", "/api/investments", data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      toast({
        title: "Investment successful",
        description: `You've invested $${baseAmount} in ${form.getValues().assetName}`,
      });
      
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Investment failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your investment",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: TradeFormValues) => {
    if (user?.balance && totalAmount > user.balance) {
      toast({
        title: "Insufficient balance",
        description: `You need $${totalAmount.toFixed(2)} but have $${user.balance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    tradeMutation.mutate({
      assetType: data.assetType,
      assetName: data.assetName,
      assetSymbol: data.assetSymbol,
      amount: parseFloat(data.amount),
    });
  };
  
  const handleInvestTypeClick = (type: string) => {
    setInvestType(type);
    setShowForm(true);
    
    // Reset form but pre-fill asset type
    form.reset({
      assetType: type,
      assetName: "",
      assetSymbol: "",
      amount: "",
    });
  };
  
  // Helper to get available assets based on type
  const getAvailableAssets = () => {
    if (!marketTrends) return [];
    
    return marketTrends.filter(trend => trend.type === investType)
      .map(trend => ({
        name: trend.name,
        symbol: trend.symbol,
      }));
  };
  
  const handleAssetChange = (symbol: string) => {
    const selectedAsset = marketTrends?.find(asset => asset.symbol === symbol);
    if (selectedAsset) {
      form.setValue("assetName", selectedAsset.name);
      form.setValue("assetSymbol", selectedAsset.symbol);
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
            onClick={() => navigate("/dashboard")}
          >
            <i className="ri-arrow-left-line mr-1"></i> Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold font-heading mb-1">Investments</h2>
          <p className="text-muted-foreground">Buy, sell, or trade crypto and stocks</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:bg-secondary/5 transition duration-200"
            onClick={() => handleInvestTypeClick("crypto")}
          >
            <CardContent className="p-5">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-primary/20 p-3 mr-3">
                  <i className="ri-coin-line text-xl text-primary"></i>
                </div>
                <h3 className="font-heading font-semibold">Cryptocurrencies</h3>
              </div>
              <p className="text-muted-foreground text-sm">Trade Bitcoin, Ethereum, and other cryptocurrencies</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-secondary/5 transition duration-200"
            onClick={() => handleInvestTypeClick("stock")}
          >
            <CardContent className="p-5">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-secondary/20 p-3 mr-3">
                  <i className="ri-stock-line text-xl text-secondary"></i>
                </div>
                <h3 className="font-heading font-semibold">Stocks & ETFs</h3>
              </div>
              <p className="text-muted-foreground text-sm">Buy and sell stocks and exchange-traded funds</p>
            </CardContent>
          </Card>
        </div>
        
        <MarketTrends trends={marketTrends || []} />
        
        {showForm && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <h3 className="font-heading font-semibold mb-4">
                Buy {investType === "crypto" ? "Cryptocurrency" : "Stocks & ETFs"}
              </h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="assetSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAssetChange(value);
                          }} 
                          defaultValue={field.value}
                          disabled={tradeMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an asset" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailableAssets().map(asset => (
                              <SelectItem key={asset.symbol} value={asset.symbol}>
                                {asset.name} ({asset.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Transaction Type</div>
                    <div className="flex space-x-3">
                      <Button type="button" variant="outline" className="flex-1 active">
                        <i className="ri-shopping-cart-line mr-1"></i>
                        <span>Buy</span>
                      </Button>
                      <Button type="button" variant="outline" className="flex-1 opacity-60">
                        <i className="ri-exchange-funds-line mr-1"></i>
                        <span>Sell</span>
                      </Button>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <Input 
                              type="text"
                              className="pl-8" 
                              placeholder="0.00"
                              {...field} 
                              disabled={tradeMutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-secondary/10 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Amount</span>
                      <span>${baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Fee (13%)</span>
                      <span className="text-amber-500">${feeAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border my-2 pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-[#7209B7]"
                    disabled={tradeMutation.isPending}
                  >
                    {tradeMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : "Complete Purchase"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
