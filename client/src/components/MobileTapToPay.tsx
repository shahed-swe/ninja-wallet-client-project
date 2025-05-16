import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, DollarSign, Clock, Check, Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// In a real implementation, we'd use these Capacitor plugins
// This is just for reference and would be properly implemented
// when building the actual mobile app
// import { Haptics } from '@capacitor/haptics';
// import { NFC } from 'capacitor-nfc';

export default function MobileTapToPay() {
  const [amount, setAmount] = useState<string>('10.00');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
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

  // Process NFC payment by making API call to our backend
  const startNfcScan = async () => {
    // In a real implementation, this would use the actual NFC plugin
    // For this demo, we'll simulate the NFC scanning but make a real API call
    setIsScanning(true);
    setPaymentStatus('scanning');
    
    // Simulate vibration feedback that would happen on a real device
    // In a real implementation: Haptics.impact({ style: HapticsImpactStyle.Medium });
    
    // Simulate the NFC scanning, then make the actual API call
    setTimeout(async () => {
      setPaymentStatus('processing');
      
      try {
        // Make actual API call to process the payment
        const response = await fetch('/api/tap-to-pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            location: 'Mobile Payment Terminal',
            merchantId: 'MOB-' + Math.floor(Math.random() * 10000)
          }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Success path
          setIsScanning(false);
          setIsComplete(true);
          setPaymentStatus('completed');
          
          // Simulate success vibration
          // In a real implementation: Haptics.notification({ type: HapticsNotificationType.Success });
          
          toast({
            title: "Payment Successful",
            description: `$${parseFloat(amount).toFixed(2)} paid successfully via Tap to Pay`,
            variant: "default",
          });
          
          // Reset after a delay
          setTimeout(() => {
            setIsComplete(false);
            setPaymentStatus('ready');
            setAmount('10.00');
          }, 3000);
        } else {
          // Error path
          throw new Error(data.error || 'Payment failed');
        }
      } catch (error: any) {
        setIsScanning(false);
        setPaymentStatus('ready');
        
        toast({
          title: "Payment Failed",
          description: error.message || "There was an error processing your payment",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  // Show different UI based on the payment status
  const renderStatusContent = () => {
    switch (paymentStatus) {
      case 'scanning':
        return (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="relative">
              <CreditCard className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
            </div>
            <p className="text-lg font-medium">Scanning...</p>
            <p className="text-sm text-gray-500">Hold your phone near the payment terminal</p>
          </div>
        );
      
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
              <Label htmlFor="mobile-amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="mobile-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
                <span>Fee {isPremium && '(Premium Rate)'}:</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={startNfcScan} 
              disabled={isScanning || parseFloat(amount) <= 0} 
              className="w-full flex items-center justify-center gap-2 h-14"
            >
              <Smartphone className="h-5 w-5" />
              <span>Tap to Pay Now</span>
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
            <Smartphone className="h-5 w-5" />
            Mobile Tap to Pay
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Make contactless payments with your phone
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
      
      {(paymentStatus === 'scanning' || paymentStatus === 'processing') && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center">
            {paymentStatus === 'scanning' ? (
              <>
                <CreditCard className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-medium mb-2">Scanning for Terminal</h3>
                <p className="text-sm text-gray-500">
                  Hold your phone close to the payment terminal
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
                <p className="text-sm text-gray-500">
                  Please keep your phone near the terminal
                </p>
              </>
            )}
            
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setIsScanning(false);
                setPaymentStatus('ready');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}