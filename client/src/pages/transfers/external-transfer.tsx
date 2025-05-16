import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, ClipboardCopy } from "lucide-react";

// Form validation schema
const externalTransferSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a positive number" }
  ),
  provider: z.string().min(1, "Payment provider is required"),
  accountId: z.string().min(1, "Account ID or username is required"),
  note: z.string().optional(),
});

type ExternalTransferFormValues = z.infer<typeof externalTransferSchema>;

export default function ExternalTransferPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ExternalTransferFormValues>({
    resolver: zodResolver(externalTransferSchema),
    defaultValues: {
      amount: "",
      provider: "venmo",
      accountId: "",
      note: "",
    },
  });

  async function onSubmit(values: ExternalTransferFormValues) {
    if (!user) return;

    setIsSubmitting(true);
    setTransferSuccess(false);
    
    try {
      // Ensure amount is properly parsed to prevent NaN
      const amountValue = parseFloat(values.amount);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than zero",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      const response = await apiRequest("POST", "/api/external-wallet-transfer", {
        amount: amountValue,
        provider: values.provider,
        accountId: values.accountId,
        note: values.note,
      });
      
      const result = await response.json();
      setTransferResult(result);
      setTransferSuccess(true);
      
      toast({
        title: "Transfer Successful",
        description: result.message,
      });
      
      // Don't auto-redirect anymore - this can cause issues on some devices
      // We'll let the user choose how to complete the transfer instead
    } catch (error) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Could not process your transfer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const qrCodeRef = useRef<HTMLDivElement>(null);

  const generateVenmoDeeplink = (username: string, amount: number, note: string) => {
    // Format amount as string with 2 decimal places
    const amountStr = amount.toFixed(2);
    // URL encode the note
    const encodedNote = encodeURIComponent(note || 'Transfer from Ninja Wallet');
    // Generate Venmo deeplink
    return `venmo://paycharge?txn=pay&recipients=${username}&amount=${amountStr}&note=${encodedNote}`;
  };

  const openVenmoApp = () => {
    if (!transferResult) return;
    
    const accountId = transferResult.transaction.recipient.split(':')[1];
    const amount = parseFloat(transferResult.transaction.amount);
    const note = transferResult.transaction.note || 'Transfer from Ninja Wallet';
    
    // Generate the Venmo deeplink
    const venmoLink = generateVenmoDeeplink(accountId, amount, note);
    
    // Open the link
    window.location.href = venmoLink;
    
    // Fallback for if the app doesn't open
    setTimeout(() => {
      // If we're still here after 1 second, the app probably didn't open
      window.open('https://venmo.com', '_blank');
    }, 1000);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">External Transfer</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send to External Wallet</CardTitle>
            <CardDescription>
              Transfer funds directly to Venmo or other payment services
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {transferSuccess ? (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        {transferResult?.message || "Transfer completed successfully!"}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Transfer Details</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <div className="text-muted-foreground">Amount:</div>
                    <div>${parseFloat(transferResult?.transaction?.amount || 0).toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Fee:</div>
                    <div>${parseFloat(transferResult?.fee || 0).toFixed(2)}</div>
                    
                    <div className="text-muted-foreground">Recipient:</div>
                    <div>{transferResult?.transaction?.recipient}</div>
                    
                    <div className="text-muted-foreground">New Balance:</div>
                    <div className="font-medium">${parseFloat(transferResult?.newBalance || 0).toFixed(2)}</div>
                  </div>
                </div>
                
                {transferResult?.transaction?.recipient.startsWith('venmo:') && (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Complete your transfer in Venmo</h3>
                    <p className="text-xs text-blue-600 mb-2">We've deducted the funds from your Ninja Wallet balance. Now complete the transfer in Venmo.</p>
                    
                    {transferResult.paymentOptions && (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-blue-100 text-center">
                          <p className="text-sm font-medium">Payment Instructions:</p>
                          <p className="text-xs mt-1">{transferResult.paymentOptions.paymentInstructions}</p>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <div className="bg-white p-2 rounded-md border border-blue-100 mb-1">
                            <h4 className="text-sm font-medium text-center text-blue-800">Option 1: App Transfer</h4>
                          </div>
                          
                          <Button 
                            onClick={() => window.location.href = transferResult.paymentOptions.mobileDeepLink}
                            className="w-full bg-[#008CFF] hover:bg-[#0070CC] text-white"
                          >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3.94 9.72c.27-2.49 2.39-4.13 4.7-4.13 2.59 0 5.28 1.95 4.96 5.27-.32 3.33-2.58 7.77-5.13 7.77-1.36 0-1.92-.96-1.87-2.25.04-1.22.81-2.84 1.1-3.73.22-.65-.27-1.39-1.01-1.39-.7 0-1.37.62-1.5 1.53-.15 1.05.15 1.5.15 1.5-.88-.33-2.14-1.8-1.4-4.57zm10.98.63c0 .44-.22.44-.31.44-.53 0-.74-.35-.74-.67 0-.34.27-.67.66-.67.39-.01.39.45.39.9z" />
                              <path d="M19.5 8.4c-.43 0-.78.35-.78.78v3.12h-1.57c-.42 0-.78.35-.78.78 0 .44.35.78.78.78h1.57v3.1c0 .44.35.78.78.78.44 0 .79-.35.79-.78v-3.12h1.56c.43 0 .78-.35.78-.78 0-.42-.35-.78-.78-.78h-1.56V9.18c0-.43-.35-.78-.79-.78z" />
                            </svg>
                            Open Venmo App
                          </Button>
                          
                          {/* Add phone-specific options if available */}
                          {transferResult.paymentOptions.phoneLink && (
                            <Button 
                              onClick={() => window.location.href = transferResult.paymentOptions.phoneLink}
                              variant="outline"
                              className="w-full"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              Call Phone Number Directly
                            </Button>
                          )}
                          
                          {/* If the first method doesn't work, offer an alternative mobile link */}
                          {transferResult.paymentOptions.alternateMobileLinks?.alternative && (
                            <Button 
                              onClick={() => window.location.href = transferResult.paymentOptions.alternateMobileLinks.alternative}
                              variant="outline"
                              className="w-full"
                            >
                              Try Alternate App Link
                            </Button>
                          )}
                          
                          {/* Special phone-specific links if available */}
                          {transferResult.paymentOptions.alternateMobileLinks?.phone && (
                            <Button 
                              onClick={() => window.location.href = transferResult.paymentOptions.alternateMobileLinks.phone}
                              variant="outline"
                              className="w-full"
                            >
                              Try Phone-Specific Link
                            </Button>
                          )}
                          
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
                          {transferResult.paymentOptions.webDirectUrl && (
                            <Button 
                              onClick={() => window.open(transferResult.paymentOptions.webDirectUrl, '_blank')}
                              variant="outline"
                              className="w-full"
                            >
                              Open Direct Pay Page
                            </Button>
                          )}
                          
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
                        
                        <div className="mt-4">
                          <details className="text-xs text-gray-600">
                            <summary className="cursor-pointer font-medium">More transfer options</summary>
                            <div className="mt-2 space-y-2 p-2 bg-gray-50 rounded-md">
                              <p className="font-medium mb-1">Recipient Info:</p>
                              <code className="block p-1 bg-white rounded border border-gray-200 text-xs overflow-auto">
                                {transferResult.paymentOptions.venmoUsername}
                              </code>
                              
                              <p className="font-medium mb-1">Amount:</p>
                              <code className="block p-1 bg-white rounded border border-gray-200 text-xs">
                                {transferResult.paymentOptions.formattedAmount}
                              </code>
                              
                              <p className="font-medium mb-1">Payment Note:</p>
                              <code className="block p-1 bg-white rounded border border-gray-200 text-xs">
                                {transferResult.paymentOptions.formattedNote}
                              </code>
                              
                              {Object.entries(transferResult.paymentOptions.alternateMobileLinks || {}).length > 0 && (
                                <>
                                  <p className="font-medium mb-1">Alternative Link Methods:</p>
                                  <div className="grid grid-cols-2 gap-1">
                                    {Object.entries(transferResult.paymentOptions.alternateMobileLinks).map(([key, url]) => (
                                      <Button 
                                        key={key}
                                        onClick={() => window.location.href = url as string}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                      >
                                        Try {key} link
                                      </Button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </details>
                        </div>
                        
                        <p className="text-xs text-gray-500 text-center">If automatic opening doesn't work, copy the instructions and complete the payment manually in Venmo</p>
                      </div>
                    )}
                    
                    {!transferResult.paymentOptions && (
                      <>
                        <Button 
                          onClick={openVenmoApp}
                          className="w-full bg-[#008CFF] hover:bg-[#0070CC] text-white mb-2"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.94 9.72c.27-2.49 2.39-4.13 4.7-4.13 2.59 0 5.28 1.95 4.96 5.27-.32 3.33-2.58 7.77-5.13 7.77-1.36 0-1.92-.96-1.87-2.25.04-1.22.81-2.84 1.1-3.73.22-.65-.27-1.39-1.01-1.39-.7 0-1.37.62-1.5 1.53-.15 1.05.15 1.5.15 1.5-.88-.33-2.14-1.8-1.4-4.57zm10.98.63c0 .44-.22.44-.31.44-.53 0-.74-.35-.74-.67 0-.34.27-.67.66-.67.39-.01.39.45.39.9z" />
                            <path d="M19.5 8.4c-.43 0-.78.35-.78.78v3.12h-1.57c-.42 0-.78.35-.78.78 0 .44.35.78.78.78h1.57v3.1c0 .44.35.78.78.78.44 0 .79-.35.79-.78v-3.12h1.56c.43 0 .78-.35.78-.78 0-.42-.35-.78-.78-.78h-1.56V9.18c0-.43-.35-.78-.79-.78z" />
                          </svg>
                          Open External App
                        </Button>
                        <p className="text-xs text-gray-500">You'll be redirected to the payment app to complete the transfer</p>
                      </>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setTransferSuccess(false);
                    form.reset();
                  }} className="flex-1">
                    Make Another Transfer
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Provider</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="venmo">Venmo</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="cashapp">Cash App</SelectItem>
                            <SelectItem value="zelle">Zelle</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose where you want to send your money
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account ID / Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              form.watch('provider') === 'venmo' 
                                ? '@username or phone number' 
                                : form.watch('provider') === 'zelle' 
                                ? 'email or phone number' 
                                : form.watch('provider') === 'cashapp'
                                ? '$username'
                                : form.watch('provider') === 'paypal'
                                ? 'email address or phone'
                                : '@your-username'
                            }
                            onChange={(e) => {
                              let value = e.target.value;
                              const provider = form.watch('provider');
                              
                              // Format phone numbers as they're typed for Venmo/Zelle
                              if ((provider === 'venmo' || provider === 'zelle' || provider === 'paypal') && 
                                  !value.includes('@') && 
                                  /^[0-9()-\s]*$/.test(value)) {
                                // Remove all non-numeric characters
                                const digitsOnly = value.replace(/\D/g, '');
                                
                                // Format as (XXX) XXX-XXXX
                                if (digitsOnly.length > 0) {
                                  if (digitsOnly.length <= 3) {
                                    value = `(${digitsOnly}`;
                                  } else if (digitsOnly.length <= 6) {
                                    value = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
                                  } else {
                                    value = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
                                  }
                                }
                              }
                              
                              // For Cash App, ensure $ prefix
                              if (provider === 'cashapp' && value && !value.startsWith('$')) {
                                value = '$' + value;
                              }
                              
                              // For Venmo, ensure @ prefix for usernames (but not for phone numbers)
                              if (provider === 'venmo' && value && !value.startsWith('@') && 
                                  !value.startsWith('(') && !/^[0-9()-\s]*$/.test(value)) {
                                value = '@' + value;
                              }
                              
                              field.onChange(value);
                            }}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Your username or account ID for the selected provider
                        </FormDescription>
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
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input
                              type="text"
                              placeholder="0.00"
                              className="pl-7"
                              disabled={isSubmitting}
                              value={field.value || ''}
                              onChange={(e) => {
                                // Only allow valid number input
                                const value = e.target.value;
                                // Allow numeric input with up to 2 decimal places
                                if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Current balance: ${user?.balance.toFixed(2)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="What's this transfer for?"
                            className="resize-none"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Send Money <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 list-decimal list-inside text-sm">
                <li className="pb-3 border-b border-border">
                  <span className="font-medium">Enter recipient details</span>
                  <p className="mt-1 text-muted-foreground">Provide your exact username or account ID for the selected payment provider</p>
                </li>
                <li className="pb-3 border-b border-border">
                  <span className="font-medium">Specify the amount</span>
                  <p className="mt-1 text-muted-foreground">Enter how much you want to transfer (up to your available balance)</p>
                </li>
                <li className="pb-3 border-b border-border">
                  <span className="font-medium">We process your transaction</span>
                  <p className="mt-1 text-muted-foreground">Your Ninja Wallet balance is reduced by the transfer amount plus fees</p>
                </li>
                <li className="pb-3 border-b border-border">
                  <span className="font-medium">Complete in Venmo app</span>
                  <p className="mt-1 text-muted-foreground">Click the "Open Venmo" button to launch Venmo and complete your payment</p>
                </li>
                <li>
                  <span className="font-medium">Instant transfer</span>
                  <p className="mt-1 text-muted-foreground">The money appears instantly in your external account when the transfer is complete</p>
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span>Standard transfers</span>
                  <span className="font-medium">{user?.isPremium ? '8%' : '13%'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span>Small transfers (&lt;$100)</span>
                  <span className="font-medium">{user?.isPremium ? '8%' : '15%'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span>Large transfers (&gt;$1000)</span>
                  <span className="font-medium">{user?.isPremium ? '8%' : '10%'}</span>
                </div>
                {!user?.isPremium && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-md">
                    <p className="text-sm font-medium">Upgrade to Premium</p>
                    <p className="text-xs text-muted-foreground mt-1">Save up to 47% on fees with our premium plan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
