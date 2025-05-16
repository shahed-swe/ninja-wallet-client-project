import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import { Check, Clock, ClipboardCopy, Loader2, SendHorizontal, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import PremiumUpsellCard from '../../components/premium-upsell-card';
import VenmoLogo from '../../components/venmo-logo';

// Define the form schema
const formSchema = z.object({
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  venmoUsername: z.string().min(1, { message: "Venmo username is required" }),
  note: z.string().optional(),
  isInstantTransfer: z.boolean().optional().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function VenmoTransferPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [transferResult, setTransferResult] = useState<any>(null);
  const [baseAmount, setBaseAmount] = useState(0);
  const [feeAmount, setFeeAmount] = useState(0);
  const [instantFee, setInstantFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Get user data
  const { data: user } = useQuery<{
    id: number;
    username: string;
    email: string;
    balance: number;
    isPremium: boolean;
  }>({
    queryKey: ['/api/auth/session'],
    enabled: !transferResult, // Only fetch if not already completed transfer
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      venmoUsername: '',
      note: '',
      isInstantTransfer: true,
    },
  });

  // Watch form values for fee calculation
  const watchAmount = form.watch('amount');
  const isInstantTransfer = form.watch('isInstantTransfer');

  // Calculate fees whenever relevant values change
  useState(() => {
    try {
      const amount = parseFloat(watchAmount || '0');
      if (!isNaN(amount) && amount > 0) {
        const baseAmount = amount;
        setBaseAmount(baseAmount);
        
        // Calculate base fee based on amount and premium status
        let feeRate = 0.13; // Default 13%
        if (amount < 100) {
          feeRate = 0.15; // 15% for small transactions
        } else if (amount > 1000) {
          feeRate = 0.10; // 10% for large transactions
        }
        
        // Apply premium discount if applicable
        if (user?.isPremium) {
          feeRate = 0.08; // Premium users pay 8% regardless of amount
        }
        
        const baseFee = amount * feeRate;
        setFeeAmount(baseFee);
        
        // Add instant transfer fee if selected
        let instantFeeAmount = 0;
        if (isInstantTransfer) {
          const instantFeeRate = user?.isPremium ? 0.01 : 0.02;
          instantFeeAmount = amount * instantFeeRate;
          setInstantFee(instantFeeAmount);
        } else {
          setInstantFee(0);
        }
        
        // Calculate total
        setTotalAmount(baseAmount + baseFee + instantFeeAmount);
      }
    } catch (e) {
      // Ignore calculation errors
    }
  });

  // Create mutation for external wallet transfer
  const sendMoneyMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      const response = await apiRequest('POST', '/api/external-wallet-transfer', {
        amount: parseFloat(formData.amount),
        provider: 'venmo',
        accountId: formData.venmoUsername,
        note: formData.note,
        isInstantTransfer: formData.isInstantTransfer,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      setTransferResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
    },
    onError: (error) => {
      toast({
        title: 'Transfer failed',
        description: error instanceof Error ? error.message : 'Failed to process Venmo transfer',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  function onSubmit(data: FormValues) {
    if (transferResult) return; // Prevent multiple submissions
    
    // Double-check amount again
    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than zero',
        variant: 'destructive',
      });
      return;
    }
    
    // Confirm if transaction fee is high (over $20)
    const fee = feeAmount + (data.isInstantTransfer ? instantFee : 0);
    if (fee > 20 && !user?.isPremium) {
      if (!confirm(`This transaction includes a fee of $${fee.toFixed(2)}. Continue?`)) {
        return;
      }
    }
    
    sendMoneyMutation.mutate(data);
  }

  // Function to open Venmo app
  const openVenmoApp = () => {
    if (!transferResult) return;
    
    try {
      // Try all available methods to open Venmo
      // First try the primary deep link
      window.location.href = transferResult.transferUrl;
      
      // Fallback for if the app doesn't open
      setTimeout(() => {
        // Try alternative deep links
        if (transferResult.paymentOptions?.alternateMobileLinks?.alternative) {
          const venmoLink = transferResult.paymentOptions.alternateMobileLinks.alternative;
          window.open(venmoLink, '_blank');
          
          // Try legacy format as a last resort
          setTimeout(() => {
            if (transferResult.paymentOptions?.alternateMobileLinks?.legacy) {
              window.open(transferResult.paymentOptions.alternateMobileLinks.legacy, '_blank');
            } else if (transferResult.paymentOptions?.webUrl) {
              // If we're still here, open the web version
              window.open(transferResult.paymentOptions.webUrl, '_blank');
            }
          }, 500);
        }
      }, 500);
    } catch (error) {
      // If all else fails, open the web version
      if (transferResult.paymentOptions?.webUrl) {
        window.open(transferResult.paymentOptions.webUrl, '_blank');
      }
    }
  };

  return (
    <div className="container max-w-md py-6">
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => setLocation('/transfers')}
      >
        Back to Transfers
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <VenmoLogo className="h-5 w-5 mr-2" />
            Venmo Transfer
          </CardTitle>
          <CardDescription>
            Send money directly to a Venmo account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!transferResult ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="0.00" 
                          type="number" 
                          step="0.01" 
                          min="0.01"
                          disabled={sendMoneyMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="venmoUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venmo Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="@username" 
                          disabled={sendMoneyMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the recipient's Venmo username (with or without the @ symbol)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isInstantTransfer"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between space-x-2 bg-secondary/5 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Instant Transfer</span>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={sendMoneyMutation.isPending}
                          />
                        </FormControl>
                      </div>
                      {field.value && (
                        <div className="text-sm text-muted-foreground -mt-2 mb-1">
                          Money will be sent immediately. {user?.isPremium ? 'Premium members pay 1%' : 'Standard users pay 2%'} extra for instant transfers.
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                
                {/* Only show premium upsell for large transactions where fee savings would be substantial */}
                {baseAmount >= 100 && !user?.isPremium && (
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
                      <FormLabel>Note (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="What's this for?" 
                          disabled={sendMoneyMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {watchAmount && !isNaN(parseFloat(watchAmount)) && parseFloat(watchAmount) > 0 && (
                  <div className="bg-secondary/10 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Amount</span>
                      <span>${baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Fee {user?.isPremium ? '(8%)' : '(13-15%)'}</span>
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
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={sendMoneyMutation.isPending}
                >
                  {sendMoneyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Send to Venmo
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="text-center p-4 bg-green-50 rounded-md border border-green-200">
                <div className="flex items-center text-green-700 mb-2 justify-center">
                  <Check className="h-5 w-5 mr-2" />
                  <span className="font-medium">Transfer Prepared</span>
                </div>
                <p className="text-green-600 text-sm">Complete the transfer in Venmo</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Amount:</div>
                  <div className="font-medium">${parseFloat(transferResult?.transaction?.amount || 0).toFixed(2)}</div>
                  
                  <div className="text-muted-foreground">Fee:</div>
                  <div className="font-medium">${parseFloat(transferResult?.fee || 0).toFixed(2)}</div>
                  
                  <div className="text-muted-foreground">Recipient:</div>
                  <div className="font-medium">{transferResult?.transaction?.recipient.replace('venmo:', '@')}</div>
                  
                  <div className="text-muted-foreground">Processing Time:</div>
                  <div className="font-medium flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {transferResult?.processingTime || "Immediate"}
                  </div>
                  
                  <div className="text-muted-foreground">New Balance:</div>
                  <div className="font-medium">${parseFloat(transferResult?.newBalance || 0).toFixed(2)}</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2 text-center">Complete your transfer in Venmo</h3>
                <p className="text-xs text-blue-600 mb-4 text-center">We've deducted the funds from your Ninja Wallet balance. Now complete the transfer in Venmo.</p>
                
                {transferResult.paymentOptions && (
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded border border-blue-100">
                      <p className="text-sm font-medium">Payment Instructions:</p>
                      <p className="text-xs mt-1">{transferResult.paymentOptions.paymentInstructions}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded-md border border-blue-100 mb-1">
                        <h4 className="text-sm font-medium text-center text-blue-800">Option 1: App Transfer</h4>
                      </div>
                      
                      <Button 
                        onClick={openVenmoApp}
                        className="w-full bg-[#008CFF] hover:bg-[#0070CC] text-white"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3.94 9.72c.27-2.49 2.39-4.13 4.7-4.13 2.59 0 5.28 1.95 4.96 5.27-.32 3.33-2.58 7.77-5.13 7.77-1.36 0-1.92-.96-1.87-2.25.04-1.22.81-2.84 1.1-3.73.22-.65-.27-1.39-1.01-1.39-.7 0-1.37.62-1.5 1.53-.15 1.05.15 1.5.15 1.5-.88-.33-2.14-1.8-1.4-4.57zm10.98.63c0 .44-.22.44-.31.44-.53 0-.74-.35-.74-.67 0-.34.27-.67.66-.67.39-.01.39.45.39.9z" />
                          <path d="M19.5 8.4c-.43 0-.78.35-.78.78v3.12h-1.57c-.42 0-.78.35-.78.78 0 .44.35.78.78.78h1.57v3.1c0 .44.35.78.78.78.44 0 .79-.35.79-.78v-3.12h1.56c.43 0 .78-.35.78-.78 0-.42-.35-.78-.78-.78h-1.56V9.18c0-.43-.35-.78-.79-.78z" />
                        </svg>
                        Open Venmo App
                      </Button>
                      
                      {/* If the first method doesn't work, offer an alternative mobile link */}
                      <Button 
                        onClick={() => window.location.href = transferResult.paymentOptions.alternateMobileLinks?.alternative}
                        variant="outline"
                        className="w-full"
                      >
                        Try Alternate App Link
                      </Button>
                      
                      <div className="bg-white p-2 rounded-md border border-blue-100 mt-3 mb-1">
                        <h4 className="text-sm font-medium text-center text-blue-800">Option 2: Web Transfer</h4>
                      </div>
                      
                      <Button 
                        onClick={() => window.open(transferResult.paymentOptions.webUrl, '_blank')}
                        variant="outline"
                        className="w-full"
                      >
                        Open Venmo Profile
                      </Button>
                      
                      {/* Add the direct send link if available */}
                      <Button 
                        onClick={() => window.open(transferResult.paymentOptions.webDirectUrl, '_blank')}
                        variant="outline"
                        className="w-full"
                      >
                        Open Direct Pay Page
                      </Button>
                      
                      <div className="bg-white p-2 rounded-md border border-blue-100 mt-3 mb-1">
                        <h4 className="text-sm font-medium text-center text-blue-800">Option 3: Manual Transfer</h4>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(transferResult.paymentOptions.paymentInstructions);
                          toast({
                            title: "Copied to clipboard",
                            description: "Payment instructions copied"
                          });
                        }}
                        variant="secondary"
                        className="w-full"
                      >
                        <ClipboardCopy className="w-4 h-4 mr-2" />
                        Copy Instructions
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center mt-2">If automatic opening doesn't work, copy the instructions and complete the payment manually in Venmo</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setTransferResult(null)} 
                variant="outline" 
                className="w-full"
              >
                Make Another Transfer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}