import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign, Smartphone, Clock, Check, Loader2, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TapToPay() {
  const [amount, setAmount] = useState<string>('5000.00');
  const [phoneNumber, setPhoneNumber] = useState<string>('4048257672');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('ready');
  const { toast } = useToast();

  // Fetch user data to check if they're premium
  useEffect(() => {
    // Fetch user session data to determine premium status
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const userData = await response.json();
          // Check if user has a valid premium expiry date that's in the future
          const isPremiumUser = userData.premiumExpiry && new Date(userData.premiumExpiry) > new Date();
          setIsPremium(isPremiumUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Default to non-premium if fetch fails
        setIsPremium(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Calculate the fee based on premium status
  const calculateFee = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;
    
    // Apply fee structure similar to our regular transfers
    let feePercentage = 0;
    
    if (amountNum < 100) {
      feePercentage = isPremium ? 0.08 : 0.15; // 8% for premium, 15% for standard
    } else if (amountNum >= 100 && amountNum <= 1000) {
      feePercentage = isPremium ? 0.08 : 0.13; // 8% for premium, 13% for standard
    } else {
      feePercentage = isPremium ? 0.08 : 0.10; // 8% for premium, 10% for standard
    }
    
    // Add NFC convenience fee (waived for premium)
    if (!isPremium) {
      feePercentage += 0.005; // 0.5% for standard users
    }
    
    return amountNum * feePercentage;
  };

  const fee = calculateFee();
  const total = parseFloat(amount) + fee;

  // Process tap to pay transaction
  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Make API call to process the payment
      const response = await fetch('/api/tap-to-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          phoneNumber: phoneNumber, // Include the phone number
          location: 'Web Payment Terminal',
          merchantId: 'WEB-' + Math.floor(Math.random() * 10000)
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Success path
        setIsProcessing(false);
        setIsComplete(true);
        setPaymentStatus('completed');
        
        toast({
          title: "Payment Successful",
          description: `$${parseFloat(amount).toFixed(2)} paid successfully to ${phoneNumber} via Tap to Pay`,
          variant: "default",
        });
        
        // Reset after a delay but keep the phone number
        setTimeout(() => {
          setIsComplete(false);
          setPaymentStatus('ready');
          // Don't reset the amount so user can continue sending $5000
        }, 3000);
      } else {
        // Error path
        throw new Error(data.error || 'Payment failed');
      }
    } catch (error: any) {
      setIsProcessing(false);
      setPaymentStatus('ready');
      
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment",
        variant: "destructive",
      });
    }
  };

  // Show different UI based on the payment status
  const renderStatusContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <p className="text-lg font-medium">Processing Payment</p>
            <p className="text-sm text-gray-500">Please wait, authorizing transaction</p>
          </div>
        );
      
      case 'completed':
        return (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="rounded-full bg-green-100 p-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-lg font-medium">Payment Complete</p>
            <div className="text-2xl font-bold">${parseFloat(amount).toFixed(2)}</div>
            <p className="text-sm text-gray-500">Transaction processed securely</p>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desktop-amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="desktop-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10 text-lg h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-number">Recipient Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="phone-number"
                  type="tel"
                  pattern="[0-9]{10}"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 text-lg h-12"
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Recipient:</span>
                <span>{phoneNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fee {isPremium && '(Premium Rate)'}:</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={processPayment} 
              disabled={isProcessing || parseFloat(amount) <= 0 || phoneNumber.length < 10} 
              className="w-full flex items-center justify-center gap-2 h-14"
            >
              <CreditCard className="h-5 w-5" />
              <span>Process Tap to Pay to {phoneNumber}</span>
            </Button>
            
            <div className="text-center text-xs text-gray-500">
              {isPremium ? 'Premium Status: 0% Convenience Fee' : 'Standard Rate: 0.5% Convenience Fee'}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Tap to Pay
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Process contactless payments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStatusContent()}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-gray-500 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Instant Processing</span>
          </div>
          <div>Powered by Ninja Wallet</div>
        </CardFooter>
      </Card>
    </div>
  );
}