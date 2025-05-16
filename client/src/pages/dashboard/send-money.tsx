import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ZapIcon } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import RecentRecipients from "@/components/sections/recent-recipients";
import { PremiumUpsellCard } from "@/components/premium-upsell";

const sendMoneySchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be greater than 0" }
  ),
  note: z.string().optional(),
});

type SendMoneyFormValues = z.infer<typeof sendMoneySchema>;

export default function SendMoney() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Instant transfer option
  const [isInstantTransfer, setIsInstantTransfer] = useState(false);
  
  // Amounts calculated from form input
  const [baseAmount, setBaseAmount] = useState(0);
  const [feeAmount, setFeeAmount] = useState(0);
  const [instantFee, setInstantFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<SendMoneyFormValues>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      recipient: "",
      amount: "",
      note: "",
    },
  });
  
  // Watch amount field to calculate fee
  const watchAmount = form.watch("amount");
  
  useEffect(() => {
    const amount = parseFloat(watchAmount) || 0;
    const baseFee = parseFloat((amount * 0.13).toFixed(2));
    
    // Calculate instant transfer fee (additional 2% for regular, 1% for premium)
    const instantTransferFeeAmount = isInstantTransfer ? 
      parseFloat((amount * (user?.isPremium ? 0.01 : 0.02)).toFixed(2)) : 0;
    
    const total = amount + baseFee + instantTransferFeeAmount;
    
    setBaseAmount(amount);
    setFeeAmount(baseFee);
    setInstantFee(instantTransferFeeAmount);
    setTotalAmount(total);
  }, [watchAmount, isInstantTransfer, user?.isPremium]);
  
  const sendMoneyMutation = useMutation({
    mutationFn: (data: { recipient: string; amount: number; note?: string; isInstantTransfer?: boolean }) => {
      return apiRequest("POST", "/api/transactions", {
        ...data,
        type: "send",
        isInstantTransfer: data.isInstantTransfer,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      toast({
        title: "Payment sent",
        description: `You've sent $${baseAmount} to ${form.getValues().recipient}`,
      });
      
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An error occurred while sending money",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: SendMoneyFormValues) => {
    if (user?.balance && totalAmount > user.balance) {
      toast({
        title: "Insufficient balance",
        description: `You need $${totalAmount.toFixed(2)} but have $${user.balance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }
    
    sendMoneyMutation.mutate({
      recipient: data.recipient,
      amount: parseFloat(data.amount),
      note: data.note,
      isInstantTransfer: isInstantTransfer,
    });
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
          <h2 className="text-2xl font-bold font-heading mb-1">Send Money</h2>
          <p className="text-muted-foreground">Transfer funds to anyone, anywhere</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Send To</div>
                  <div className="flex space-x-3 mb-4">
                    <Button type="button" variant="outline" className="flex-1 active">
                      <i className="ri-user-line mr-1"></i>
                      <span>Person</span>
                    </Button>
                    <Button type="button" variant="outline" className="flex-1 opacity-60">
                      <i className="ri-building-line mr-1"></i>
                      <span>Business</span>
                    </Button>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email or Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="recipient@example.com" 
                          {...field} 
                          disabled={sendMoneyMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                            disabled={sendMoneyMutation.isPending}
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
                  {isInstantTransfer && (
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Instant Transfer Fee</span>
                      <span className="text-amber-500">${instantFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border my-2 pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2 bg-secondary/5 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <ZapIcon className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Instant Transfer</span>
                  </div>
                  <Switch
                    checked={isInstantTransfer}
                    onCheckedChange={setIsInstantTransfer}
                    disabled={sendMoneyMutation.isPending}
                  />
                </div>
                {isInstantTransfer && (
                  <div className="text-sm text-muted-foreground -mt-2 mb-1">
                    Money will be sent immediately, like Apple Pay, Zelle or Google Pay. {user?.isPremium ? 'Premium members pay 1%' : 'Standard users pay 2%'} extra for instant transfers.
                  </div>
                )}
                
                {/* Only show this for large transactions where fee savings would be substantial */}
                {baseAmount >= 100 && (
                  <div className="mt-1 mb-2">
                    <PremiumUpsellCard 
                      size="small"
                      customMessage={`Save ~$${(feeAmount * 0.38).toFixed(2)} on this transaction with Premium!`}
                    />
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What's this for?" 
                          {...field} 
                          disabled={sendMoneyMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-[#7209B7]"
                  disabled={sendMoneyMutation.isPending}
                >
                  {sendMoneyMutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : "Send Money"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <RecentRecipients />
      </div>
    </AppLayout>
  );
}
