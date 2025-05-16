import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, ArrowRight, Zap, Clock, CheckCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Form validation schema
const transferSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  recipient: z.string().min(1, "Recipient is required"),
  note: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function InstantTransfer() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      recipient: "",
      note: "",
    },
  });
  
  // Calculate fees and totals
  const amount = Number(form.watch("amount") || 0);
  const baseFeeRate = user?.isPremium ? 0.09 : 0.15; // 9% for premium, 15% for standard (includes instant fee)
  const feeAmount = amount * baseFeeRate;
  const totalAmount = amount + feeAmount;
  
  const onSubmit = async (data: TransferFormValues) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/instant-transfer", {
        amount: Number(data.amount),
        recipient: data.recipient,
        note: data.note,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process transfer");
      }
      
      const result = await response.json();
      setTransferResult(result);
      
      toast({
        title: "Transfer Successful",
        description: `$${Number(data.amount).toFixed(2)} sent instantly to ${data.recipient}`,
      });
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred processing your transfer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setTransferResult(null);
    form.reset();
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Zap className="mr-2 h-6 w-6 text-amber-500" /> Instant Transfer
      </h1>
      <p className="text-muted-foreground mb-8">Send money instantly with minimal processing time</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {!transferResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-amber-500" /> Send Money Instantly
                </CardTitle>
                <CardDescription>
                  Funds will be transferred immediately without any waiting period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                {...field}
                                type="text"
                                placeholder="0.00"
                                className="pl-7"
                                disabled={isLoading}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Available balance: ${user?.balance?.toFixed(2) || 0}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recipient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Username, email, or phone number"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What's this payment for?"
                              className="resize-none"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Amount</span>
                        <span>${amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground flex items-center">
                          <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          Instant Fee ({user?.isPremium ? '9%' : '15%'})
                        </span>
                        <span className="text-amber-500">${feeAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border my-2 pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center">
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Send Instantly
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" /> Transfer Complete
                </CardTitle>
                <CardDescription>
                  Your money has been sent instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <div className="flex items-center text-green-700 mb-2">
                    <Zap className="h-5 w-5 mr-2" />
                    <span className="font-medium">Instant Transfer Successful</span>
                  </div>
                  <p className="text-green-600 text-sm">Money has been sent immediately to the recipient</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Amount:</div>
                    <div className="font-medium">${transferResult.transaction.amount.toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Fee:</div>
                    <div className="font-medium">${transferResult.transaction.fee.toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Recipient:</div>
                    <div className="font-medium">{transferResult.transaction.recipient}</div>
                    
                    <div className="text-muted-foreground">Processing Time:</div>
                    <div className="font-medium flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {transferResult.processingTime || "Immediate"}
                    </div>
                    
                    <div className="text-muted-foreground">New Balance:</div>
                    <div className="font-medium">${transferResult.newBalance.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={resetForm} className="w-full">Make Another Transfer</Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Instant Transfer</CardTitle>
              <CardDescription>Fast, reliable money transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Immediate Processing</h3>
                    <p className="text-sm text-muted-foreground">No waiting periods - your money is sent instantly</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">24/7 Availability</h3>
                    <p className="text-sm text-muted-foreground">Transfer money any time, day or night</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Universal Compatibility</h3>
                    <p className="text-sm text-muted-foreground">Send to anyone with Ninja Wallet, email, or phone number</p>
                  </div>
                </div>
                
                <Alert className="bg-amber-50 border-amber-200 mt-6">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Premium Rate: 9%</AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs">
                    {user?.isPremium ? 
                      "You're enjoying reduced fees as a Premium member" : 
                      "Upgrade to Premium to reduce your instant transfer fees from 15% to 9%"}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
