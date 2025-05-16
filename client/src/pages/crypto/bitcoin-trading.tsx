import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AppLayout from '@/components/layout/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  Bitcoin,
  CreditCard,
  ExternalLink,
  ArrowDownUp,
  QrCode,
  Smartphone,
  DollarSign,
  Loader2
} from 'lucide-react';

// Bitcoin price and rates
const BITCOIN_PRICE = 37500; // Current BTC price in USD
const SATOSHI_TO_BTC = 0.00000001; // 1 satoshi = 0.00000001 BTC

const BitcoinTradingPage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [btcAmount, setBtcAmount] = useState('');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [isInstantTransfer, setIsInstantTransfer] = useState(true);
  const [tradingFee, setTradingFee] = useState(0);
  const [instantFee, setInstantFee] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  
  // Get user wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/crypto/wallets'],
    enabled: isAuthenticated
  });
  
  // Get user's cards
  const { data: cards, isLoading: isLoadingCards } = useQuery({
    queryKey: ['/api/virtual-cards'],
    enabled: isAuthenticated && paymentMethod === 'card'
  });
  
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  
  useEffect(() => {
    if (cards && cards.length > 0) {
      setSelectedCard(cards[0].id.toString());
    }
  }, [cards]);
  
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      setSelectedWallet(wallets[0].id.toString());
    }
  }, [wallets]);
  
  // Calculate Bitcoin amount from USD
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const amountValue = parseFloat(amount);
      if (direction === 'buy') {
        // Calculate how much BTC you get for the USD amount
        setBtcAmount((amountValue / BITCOIN_PRICE).toFixed(8));
      } else {
        // Calculate how much USD you get for the BTC amount
        setBtcAmount((amountValue * BITCOIN_PRICE).toFixed(2));
      }
    } else {
      setBtcAmount('');
    }
  }, [amount, direction]);
  
  // Calculate fees
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const amountValue = parseFloat(amount);
      
      // Trading fee (higher for Bitcoin than regular transactions)
      const feeRate = user?.isPremium ? 0.10 : 0.15; // 10% for premium, 15% for standard
      const calculatedTradingFee = direction === 'buy' ? amountValue * feeRate : (amountValue * BITCOIN_PRICE) * feeRate;
      
      // Instant transfer fee
      const instantFeeRate = user?.isPremium ? 0.01 : 0.02; // 1% for premium, 2% for standard
      const calculatedInstantFee = isInstantTransfer ? 
        (direction === 'buy' ? amountValue * instantFeeRate : (amountValue * BITCOIN_PRICE) * instantFeeRate) : 0;
      
      setTradingFee(calculatedTradingFee);
      setInstantFee(calculatedInstantFee);
      setTotalFee(calculatedTradingFee + calculatedInstantFee);
      
      // Total cost
      const totalAmount = direction === 'buy' ? 
        amountValue + calculatedTradingFee + calculatedInstantFee : 
        (amountValue * BITCOIN_PRICE) - calculatedTradingFee - calculatedInstantFee;
      
      setTotalCost(totalAmount);
    } else {
      setTradingFee(0);
      setInstantFee(0);
      setTotalFee(0);
      setTotalCost(0);
    }
  }, [amount, direction, isInstantTransfer, user?.isPremium]);
  
  // Trading mutation
  const tradeMutation = useMutation({
    mutationFn: async () => {
      if (direction === 'buy') {
        if (paymentMethod === 'wallet') {
          // Buy BTC with wallet balance
          return apiRequest('POST', '/api/crypto/buy', {
            amount: parseFloat(amount),
            cryptoType: 'BTC',
            isInstantTransfer
          });
        } else {
          // Buy BTC with card
          return apiRequest('POST', '/api/crypto/buy-with-card', {
            amount: parseFloat(amount),
            cryptoType: 'BTC',
            cardId: parseInt(selectedCard),
            isInstantTransfer
          });
        }
      } else {
        // Sell BTC
        return apiRequest('POST', '/api/crypto/sell', {
          amount: parseFloat(amount),
          cryptoType: 'BTC',
          walletId: parseInt(selectedWallet),
          isInstantTransfer
        });
      }
    },
    onSuccess: (response) => {
      toast({
        title: `Bitcoin ${direction === 'buy' ? 'Purchase' : 'Sale'} Successful`,
        description: `You have successfully ${direction === 'buy' ? 'purchased' : 'sold'} Bitcoin.`,
      });
      
      // Invalidate queries to refresh balances
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      
      // Reset form
      setAmount('');
      setBtcAmount('');
      
      // Show QR code for the transaction in case of a purchase
      if (direction === 'buy') {
        setShowQRCode(true);
      }
    },
    onError: (error: Error) => {
      toast({
        title: `Bitcoin ${direction === 'buy' ? 'Purchase' : 'Sale'} Failed`,
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    
    // Additional validation
    if (direction === 'buy') {
      // Check if user has enough balance for purchase
      if (paymentMethod === 'wallet' && user?.balance && user.balance < totalCost) {
        toast({
          title: 'Insufficient Balance',
          description: 'You do not have enough balance for this purchase.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // Check if user has enough BTC to sell
      const selectedWalletObj = wallets?.find(w => w.id.toString() === selectedWallet);
      if (selectedWalletObj && selectedWalletObj.balance < parseFloat(amount)) {
        toast({
          title: 'Insufficient Bitcoin',
          description: 'You do not have enough Bitcoin for this sale.',
          variant: 'destructive',
        });
        return;
      }
    }
    
    tradeMutation.mutate();
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  const toggleDirection = () => {
    setDirection(prevDirection => prevDirection === 'buy' ? 'sell' : 'buy');
    setAmount('');
    setBtcAmount('');
  };
  
  return (
    <AppLayout>
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Bitcoin className="h-8 w-8 text-amber-500 mr-3" />
          <h1 className="text-3xl font-bold">Bitcoin Trading</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      {direction === 'buy' ? 'Buy Bitcoin' : 'Sell Bitcoin'}
                    </CardTitle>
                    <CardDescription>
                      {direction === 'buy' 
                        ? 'Purchase Bitcoin using your Ninja Wallet balance or card' 
                        : 'Sell your Bitcoin for USD and add to your balance'}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={toggleDirection}>
                    <ArrowDownUp className="h-4 w-4 mr-2" />
                    Switch to {direction === 'buy' ? 'Sell' : 'Buy'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {direction === 'buy' && (
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Tabs defaultValue="wallet" onValueChange={(val: 'wallet' | 'card') => setPaymentMethod(val)}>
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="wallet">Ninja Wallet Balance</TabsTrigger>
                          <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="wallet" className="pt-4">
                          <div className="bg-primary/10 p-3 rounded-md">
                            <p className="text-sm flex justify-between">
                              <span>Available Balance:</span>
                              <span className="font-medium">${user?.balance?.toFixed(2) || '0.00'}</span>
                            </p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="card" className="pt-4">
                          {isLoadingCards ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : cards && cards.length > 0 ? (
                            <div className="space-y-3">
                              <Label>Select Card</Label>
                              <Select 
                                value={selectedCard} 
                                onValueChange={setSelectedCard}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a card" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cards.map(card => (
                                    <SelectItem key={card.id} value={card.id.toString()}>
                                      <div className="flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        <span>{card.cardNumber}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="bg-primary/10 p-3 rounded-md">
                                <p className="text-sm">
                                  A 3% card processing fee will be added to the total.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground text-sm">No cards available</p>
                              <Button 
                                variant="link" 
                                className="text-primary" 
                                onClick={() => navigate('/cards')}
                              >
                                Add a card
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                  
                  {direction === 'sell' && wallets && (
                    <div className="space-y-2">
                      <Label>Select Bitcoin Wallet</Label>
                      <Select 
                        value={selectedWallet} 
                        onValueChange={setSelectedWallet}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallets.filter(wallet => wallet.cryptoType === 'BTC').map(wallet => (
                            <SelectItem key={wallet.id} value={wallet.id.toString()}>
                              <div className="flex items-center">
                                <Bitcoin className="h-4 w-4 mr-2" />
                                <span>{wallet.walletAddress.substring(0, 8)}...{wallet.walletAddress.substring(wallet.walletAddress.length - 4)}</span>
                                <Badge variant="outline" className="ml-2">
                                  {wallet.balance.toFixed(8)} BTC
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {direction === 'buy' ? 'USD Amount' : 'BTC Amount'}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          {direction === 'buy' ? (
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Bitcoin className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <Input
                          id="amount"
                          type="number"
                          placeholder={direction === 'buy' ? "0.00" : "0.00000000"}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-10"
                          step={direction === 'buy' ? "0.01" : "0.00000001"}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>
                        {direction === 'buy' ? 'BTC to Receive' : 'USD to Receive'}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          {direction === 'buy' ? (
                            <Bitcoin className="h-4 w-4 text-amber-500" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          type="text"
                          placeholder={direction === 'buy' ? "0.00000000" : "0.00"}
                          value={btcAmount}
                          readOnly
                          className="pl-10 bg-muted/50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="instant-transfer"
                          checked={isInstantTransfer}
                          onCheckedChange={setIsInstantTransfer}
                        />
                        <Label htmlFor="instant-transfer">Instant Processing</Label>
                      </div>
                      <Badge variant={isInstantTransfer ? "default" : "secondary"}>
                        {isInstantTransfer ? "On" : "Off"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Instant processing adds a {user?.isPremium ? "1%" : "2%"} fee but processes your transaction immediately.
                    </p>
                  </div>
                  
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {direction === 'buy' ? 'Bitcoin Amount:' : 'USD Amount:'}
                        </span>
                        <span>
                          {direction === 'buy' 
                            ? `${parseFloat(btcAmount).toFixed(8)} BTC` 
                            : `$${parseFloat(btcAmount).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trading Fee ({user?.isPremium ? "10%" : "15%"}):</span>
                        <span className="text-amber-600">${tradingFee.toFixed(2)}</span>
                      </div>
                      {isInstantTransfer && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Instant Processing ({user?.isPremium ? "1%" : "2%"}):</span>
                          <span className="text-amber-600">${instantFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between font-medium">
                        <span>
                          {direction === 'buy' ? 'Total Cost:' : 'You Receive:'}
                        </span>
                        <span>${totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  {direction === 'buy' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>Bitcoin prices are volatile. The price may change between the time you place your order and when it's processed.</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={tradeMutation.isPending || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                  >
                    {tradeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Bitcoin className="mr-2 h-4 w-4" />
                        {direction === 'buy' ? 'Buy Bitcoin' : 'Sell Bitcoin'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {showQRCode && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Bitcoin Transaction Complete</CardTitle>
                  <CardDescription>
                    Your Bitcoin purchase has been processed. Use the QR code below for mobile payments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg mb-4 w-48 h-48 flex items-center justify-center">
                    {/* This would be an actual QR code component in a real implementation */}
                    <QrCode className="h-36 w-36 text-black" />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    Scan this code with your mobile Bitcoin wallet app to make payments at Bitcoin machines
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Open in Mobile App
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bitcoin Price</CardTitle>
                <CardDescription>
                  Current market price of Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center mb-2">
                  ${BITCOIN_PRICE.toLocaleString()}
                </div>
                <div className="text-center text-green-600 text-sm">
                  +2.4% (24h)
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" className="text-sm" asChild>
                  <a href="https://www.coindesk.com/price/bitcoin/" target="_blank" rel="noopener noreferrer">
                    View Price Chart
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Bitcoin Wallets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingWallets ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : wallets && wallets.filter(w => w.cryptoType === 'BTC').length > 0 ? (
                  wallets
                    .filter(wallet => wallet.cryptoType === 'BTC')
                    .map(wallet => (
                      <div key={wallet.id} className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Wallet Address</p>
                            <p className="font-mono text-sm truncate max-w-[180px]">
                              {wallet.walletAddress}
                            </p>
                          </div>
                          <Bitcoin className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Balance:</span>
                            <span className="font-medium">{wallet.balance.toFixed(8)} BTC</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">USD Value:</span>
                            <span className="font-medium">
                              ${(wallet.balance * BITCOIN_PRICE).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-2">No Bitcoin wallets yet</p>
                    <p className="text-xs text-muted-foreground">
                      Buy Bitcoin to automatically create a wallet
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {wallets && wallets.filter(w => w.cryptoType === 'BTC').length > 0 && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/crypto/wallets')}>
                    Manage Wallets
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What is Bitcoin?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Bitcoin is a decentralized digital currency that can be transferred on the 
                  peer-to-peer bitcoin network.
                </p>
                <p>
                  Bitcoin transactions are verified by network nodes through cryptography and 
                  recorded in a public distributed ledger called a blockchain.
                </p>
                <div className="bg-primary/10 p-3 rounded-md">
                  <p className="font-medium mb-1">Benefits of Bitcoin:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Not controlled by any central authority</li>
                    <li>Transactions can't be reversed by sender</li>
                    <li>Fast international payments</li>
                    <li>Lower transaction fees</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-sm w-full" asChild>
                  <a href="https://bitcoin.org/" target="_blank" rel="noopener noreferrer">
                    Learn More About Bitcoin
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BitcoinTradingPage;