import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/components/layout/app-layout';
import BitcoinQRTapToPay from '@/components/BitcoinQRTapToPay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bitcoin, ExternalLink, Smartphone, QrCode, AlertTriangle, Info } from 'lucide-react';

const BitcoinTapToPayPage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <AppLayout>
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <QrCode className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-3xl font-bold">Bitcoin Tap-to-Pay</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <BitcoinQRTapToPay />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How to Use Bitcoin QR at ATMs</CardTitle>
                <CardDescription>
                  Step-by-step guide to using Bitcoin machines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                      </div>
                      <h3 className="font-medium mb-2">Generate QR Code</h3>
                      <p className="text-sm text-muted-foreground">Create a QR code with your desired dollar amount</p>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                      </div>
                      <h3 className="font-medium mb-2">Visit Bitcoin ATM</h3>
                      <p className="text-sm text-muted-foreground">Go to a compatible Bitcoin machine near you</p>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                      </div>
                      <h3 className="font-medium mb-2">Scan & Complete</h3>
                      <p className="text-sm text-muted-foreground">Scan QR code, follow ATM prompts to complete transaction</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm flex items-start">
                    <Info className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium">Compatible Bitcoin ATM Networks:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>CoinFlip</li>
                        <li>Bitcoin Depot</li>
                        <li>CoinCloud</li>
                        <li>Coinsource</li>
                        <li>RockItCoin</li>
                      </ul>
                      <p className="text-xs">Fees and limits may vary by ATM operator.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bitcoin Mobile App</CardTitle>
                <CardDescription>
                  Use our mobile app for easier Bitcoin transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted aspect-video rounded-lg flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <p className="text-sm">
                  Our mobile app provides a better experience for Bitcoin transactions with:
                </p>
                
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <div className="mr-2 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span>Native QR code scanning capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span>Real-time Bitcoin price alerts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span>ATM location finder with directions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span>Biometric security for transactions</span>
                  </li>
                </ul>
                
                <div className="flex space-x-2 pt-2">
                  <Button className="flex-1">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.04 21.29h-10c-2.21 0-4-1.79-4-4v-10c0-2.21 1.79-4 4-4h10c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4zm-5-13.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7.5c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
                    </svg>
                    Google Play
                  </Button>
                  <Button className="flex-1">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.05 3.58c1.2.09 2.52 1.32 3.13 2.82.63 1.49.57 2.91.51 4.74-.06 1.38-.08 2.76-.08 4.14s.03 2.76.08 4.14c.06 1.83.12 3.25-.51 4.74-.61 1.5-1.93 2.73-3.13 2.82-1.56.12-3.11.12-4.68.1l-2.08-.01c-1.56.03-3.14.02-4.68-.1-1.19-.09-2.51-1.32-3.13-2.82-.63-1.49-.57-2.91-.5-4.74.06-1.38.08-2.76.08-4.14s-.03-2.76-.08-4.14c-.08-1.83-.14-3.25.5-4.74.62-1.5 1.94-2.73 3.13-2.82 1.56-.12 3.11-.12 4.68-.1l2.08.01c1.56-.03 3.12-.02 4.68.1zm-5.34 12.74l5.12-2.95c.18-.1.25-.3.16-.48-.03-.05-.07-.1-.12-.13l-5.16-2.97c-.18-.11-.4-.04-.5.14-.03.05-.04.1-.04.16v5.9c0 .21.17.38.38.38.07-.01.13-.03.19-.06z"></path>
                    </svg>
                    App Store
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">ATM Security</h3>
                    <p className="text-sm text-muted-foreground">Always use Bitcoin ATMs in well-lit, public areas. Be aware of your surroundings.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Verify Transactions</h3>
                    <p className="text-sm text-muted-foreground">Double-check wallet addresses before confirming. Transactions cannot be reversed.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Check Fees</h3>
                    <p className="text-sm text-muted-foreground">Bitcoin ATMs often charge higher fees than online exchanges. Review the fee structure before proceeding.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bitcoin className="h-5 w-5 text-amber-500 mr-2" />
                  Bitcoin Trading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Want to buy or sell Bitcoin directly within Ninja Wallet? 
                  Use our easy trading interface for the best rates.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/crypto/bitcoin-trading')}
                >
                  Go to Bitcoin Trading
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BitcoinTapToPayPage;