import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Bitcoin, CreditCard, Loader2, Check, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BitcoinQRTapToPay = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrData, setQrData] = useState<string>('');
  const [amount, setAmount] = useState<string>('100');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  // Generate QR code data for Bitcoin payment
  const generateQrCode = async () => {
    setIsLoading(true);
    
    try {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid amount greater than zero.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Get wallet information and generate QR code
      const response = await apiRequest('POST', '/api/crypto/qr-code', {
        amount: parseFloat(amount),
        cryptoType: 'BTC',
      });
      
      const data = await response.json();
      
      // Set the QR code data and wallet address
      setQrData(data.qrCodeData);
      setWalletAddress(data.walletAddress);
      setIsGenerated(true);
      
      toast({
        title: 'QR Code Generated',
        description: 'Your Bitcoin payment QR code has been generated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'QR Code Generation Failed',
        description: error.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Simulate QR code generation if API isn't available yet
  const handleGenerateDemo = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Create a demo Bitcoin payment URI
      const demoWalletAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      const amountValue = parseFloat(amount);
      const qrValue = `bitcoin:${demoWalletAddress}?amount=${amountValue / 37500}`;
      
      setQrData(qrValue);
      setWalletAddress(demoWalletAddress);
      setIsGenerated(true);
      setIsLoading(false);
      
      toast({
        title: 'Demo QR Code Generated',
        description: 'This is a demo QR code for Bitcoin machine integration.',
      });
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Bitcoin className="h-5 w-5 text-amber-500 mr-2" />
              Bitcoin QR Tap-to-Pay
            </CardTitle>
            <CardDescription>
              Generate QR codes for Bitcoin machine payments
            </CardDescription>
          </div>
          {user?.isPremium && (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
              Premium Feature
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {!isGenerated ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="btc-amount">Amount in USD</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="btc-amount"
                  type="number"
                  placeholder="Enter amount in USD"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This amount will be converted to Bitcoin at current market rate
              </p>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleGenerateDemo}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate Bitcoin QR Code
                </>
              )}
            </Button>
            
            <div className="bg-muted p-4 rounded-lg text-sm space-y-3">
              <h3 className="font-medium">How it works:</h3>
              <ol className="space-y-2 pl-5 list-decimal">
                <li>Generate a QR code with your desired amount</li>
                <li>Scan the QR code at any compatible Bitcoin ATM or machine</li>
                <li>Complete the transaction at the machine</li>
                <li>Your Ninja Wallet Bitcoin balance will update automatically</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
              <p>QR code successfully generated</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-md mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-1 rounded-lg">
                  {/* Simulated QR code - in a real app this would be a real QR code component */}
                  <QrCode size={200} className="text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <p className="font-medium">Bitcoin Payment</p>
                <p className="text-sm text-muted-foreground">${parseFloat(amount).toFixed(2)} USD</p>
                <p className="text-xs text-muted-foreground">≈ {(parseFloat(amount) / 37500).toFixed(8)} BTC</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Bitcoin Wallet Address</Label>
              <div className="flex">
                <Input 
                  value={walletAddress} 
                  readOnly 
                  className="font-mono text-xs" 
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    toast({
                      title: "Copied",
                      description: "Wallet address copied to clipboard",
                    });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-14a2 2 0 0 0-2-2h-2"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M21 14H11"/><path d="m15 10-4 4 4 4"/></svg>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">Valid for 60 minutes</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsGenerated(false)}
              >
                Generate New
              </Button>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-start">
              <Shield className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
              <p>Only scan this QR code at trusted Bitcoin machines. Never share your QR code with anyone.</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col text-center text-xs text-muted-foreground px-6 pt-0">
        <p>
          Bitcoin payments are subject to network conditions and may take time to confirm.
        </p>
      </CardFooter>
    </Card>
  );
};

export default BitcoinQRTapToPay;