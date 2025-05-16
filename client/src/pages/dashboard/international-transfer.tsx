import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Globe, RefreshCw, Zap } from "lucide-react";
import { PremiumUpsellCard } from "@/components/premium-upsell";

export default function InternationalTransfer() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<number>(100);
  const [recipient, setRecipient] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [exchangeResult, setExchangeResult] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isInstantTransfer, setIsInstantTransfer] = useState<boolean>(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  // Load exchange rates
  useEffect(() => {
    const getExchangeRates = async () => {
      try {
        const response = await apiRequest("GET", "/api/exchange-rates");
        const data = await response.json();
        setExchangeRates(data);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        toast({
          title: "Error",
          description: "Could not fetch exchange rates",
          variant: "destructive",
        });
      }
    };
    
    getExchangeRates();
  }, [toast]);
  
  const handlePreviewTransfer = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (!recipient) {
      toast({
        title: "Recipient Required",
        description: "Please enter a recipient name",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Calculate exchange rate preview
      const response = await apiRequest("POST", "/api/international-transfer", {
        amount,
        recipient,
        note,
        fromCurrency,
        toCurrency,
        isInstantTransfer,
        preview: true // Just get a preview, don't complete the transaction yet
      });
      
      const data = await response.json();
      setExchangeResult(data.exchange);
      setPreviewMode(true);
    } catch (error) {
      console.error("Error getting transfer preview:", error);
      toast({
        title: "Error",
        description: "Could not generate transfer preview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmTransfer = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/international-transfer", {
        amount,
        recipient,
        note,
        fromCurrency,
        toCurrency,
        isInstantTransfer
      });
      
      const data = await response.json();
      
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Transfer Successful",
        description: `You've sent ${data.exchange.convertedAmount} ${data.exchange.toCurrency} to ${recipient}`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed",
        description: "There was an error processing your international transfer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setPreviewMode(false);
    setExchangeResult(null);
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  const currencies = Object.keys(exchangeRates).sort();
  
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
          <h2 className="text-2xl font-bold font-heading mb-1">International Money Transfer</h2>
          <p className="text-muted-foreground">Send money internationally with competitive exchange rates</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>
                Enter the details for your international transfer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewMode ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg mb-1">Transfer Summary</h3>
                      <p className="text-sm text-muted-foreground">Review your transfer details before confirming</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">You send:</span>
                        <span className="font-medium">{amount.toFixed(2)} {fromCurrency}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exchange rate:</span>
                        <span className="font-medium">1 {fromCurrency} = {exchangeResult.appliedRate.toFixed(4)} {toCurrency}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exchange fee:</span>
                        <span className="font-medium">{exchangeResult.fee.toFixed(2)} {fromCurrency}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transfer fee:</span>
                        <span className="font-medium">{user?.isPremium ? "8%" : "13-15%"} of amount</span>
                      </div>
                      
                      {isInstantTransfer && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Instant transfer fee:</span>
                          <span className="font-medium">{user?.isPremium ? "1%" : "2%"} of amount</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                        <span>Recipient gets:</span>
                        <span className="text-primary">{exchangeResult.convertedAmount.toFixed(2)} {toCurrency}</span>
                      </div>
                      
                      {!user?.isPremium && (
                        <div className="mt-3">
                          <PremiumUpsellCard
                            size="small" 
                            customMessage={`Premium members save up to 50% on fees! Save ~$${((exchangeResult.fee * 0.5) + (amount * 0.05)).toFixed(2)} on this transfer.`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient:</span>
                        <span className="font-medium">{recipient}</span>
                      </div>
                      
                      {note && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Note:</span>
                          <span className="font-medium">{note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {!user?.isPremium && (
                    <PremiumUpsellCard
                      size="small"
                      customMessage="Premium members save up to 50% on international transfer fees!"
                    />
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="100.00"
                        className="pl-8"
                        value={amount || ''}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromCurrency">From Currency</Label>
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger id="fromCurrency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="toCurrency">To Currency</Label>
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger id="toCurrency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Name</Label>
                    <Input
                      id="recipient"
                      placeholder="John Doe"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      placeholder="What's this for?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2 bg-secondary/5 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">Instant Transfer</span>
                    </div>
                    <Switch
                      checked={isInstantTransfer}
                      onCheckedChange={setIsInstantTransfer}
                      disabled={isLoading}
                    />
                  </div>
                  {isInstantTransfer && (
                    <div className="text-sm text-muted-foreground -mt-2 mb-1">
                      Money will be sent immediately, like Apple Pay, Zelle or Google Pay. {user?.isPremium ? 'Premium members pay 1%' : 'Standard users pay 2%'} extra for instant transfers.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
              {previewMode ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                    Back
                  </Button>
                  <Button onClick={handleConfirmTransfer} disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Confirm Transfer"
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={handlePreviewTransfer} disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" /> International Transfer Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Send money to over 100 countries worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Typically arrives within 1-2 business days</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Secure transfers with end-to-end encryption</span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span><strong>Premium members</strong> get reduced exchange markup (1.5% vs 3%)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {!user?.isPremium && (
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Save on fees with Premium</CardTitle>
                  <CardDescription>
                    Upgrade to Premium to cut your fees in half
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Premium members enjoy a reduced exchange rate markup of just <strong>1.5%</strong> compared to the standard <strong>3%</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    For this transaction, you would save approximately <strong>${((amount * 0.015) || 0).toFixed(2)}</strong> in exchange fees.
                  </p>
                  <Button className="w-full" onClick={() => navigate("/subscribe")}>
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
