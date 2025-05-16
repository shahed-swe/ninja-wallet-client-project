import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, CreditCard, AlertTriangle, CheckCircle2, Eye, EyeOff, Copy, Shield } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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

const createCardSchema = z.object({
  cardholderName: z.string().optional(),
  dailyLimit: z.number().min(1).max(10000).optional(),
  monthlyLimit: z.number().min(1).max(50000).optional(),
});

type Card = {
  id: number;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
};

const VirtualCardsPage = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  
  // Fetch virtual cards
  const { data: cards, isLoading, isError } = useQuery<Card[]>({
    queryKey: ["/api/virtual-cards"],
    retry: 1,
    onSuccess: (data) => {
      console.log("Virtual cards loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading virtual cards:", error);
    }
  });
  
  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createCardSchema>) => {
      console.log("Creating card with data:", data);
      const res = await apiRequest("POST", "/api/virtual-cards", data);
      const result = await res.json();
      console.log("Card creation response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Card created successfully:", data);
      toast({
        title: "Card created",
        description: "Your virtual card has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-cards"] });
    },
    onError: (error: Error) => {
      console.error("Card creation error:", error);
      toast({
        title: "Failed to create card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Deactivate card mutation
  const deactivateCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest("DELETE", `/api/virtual-cards/${cardId}`);
    },
    onSuccess: () => {
      toast({
        title: "Card deactivated",
        description: "The card has been deactivated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-cards"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to deactivate card",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<z.infer<typeof createCardSchema>>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      cardholderName: "",
      dailyLimit: 1000,
      monthlyLimit: 5000,
    },
  });
  
  const onSubmit = (data: z.infer<typeof createCardSchema>) => {
    createCardMutation.mutate(data);
  };
  
  const handleDeactivateCard = (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this card?")) {
      deactivateCardMutation.mutate(id);
    }
  };
  
  // Add to mobile wallet function
  const handleAddToMobileWallet = (card: Card) => {
    setSelectedCard(card);
    setShowWalletDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h1 className="text-xl">Failed to load virtual cards</h1>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Virtual Cards</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Virtual Card</DialogTitle>
              <DialogDescription>
                Use this card for online purchases. You can set spending limits to control your expenses.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank to use your account name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dailyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Spending Limit ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="monthlyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Spending Limit ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5000" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createCardMutation.isPending}
                    className="w-full"
                  >
                    {createCardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Card
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {cards && cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <CreditCard className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-medium">No virtual cards yet</h2>
          <p className="text-center text-muted-foreground max-w-md">
            Create your first virtual card to make online purchases securely with customizable spending limits.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Card
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards?.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <div className="bg-primary h-20 flex items-center justify-between px-6">
                <div className="text-white">
                  <p className="font-mono text-sm opacity-80">Virtual Card</p>
                  <p className="font-mono text-lg tracking-wider">{card.cardNumber}</p>
                </div>
                <div>
                  <CreditCard className="h-10 w-10 text-white/70" />
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{card.cardholderName}</CardTitle>
                  {card.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Inactive
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Expires: {card.expiryMonth}/{card.expiryYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily Limit:</span>
                    <span className="font-medium">${card.dailyLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Limit:</span>
                    <span className="font-medium">${card.monthlyLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">{new Date(card.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex justify-between py-4">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedCard(card);
                      setShowCardDetails(true);
                      setShowCVV(false);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Card Details
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = `/cards/${card.id}`}
                  >
                    View Transactions
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                    onClick={() => {
                      setSelectedCard(card);
                      handleAddToMobileWallet(card);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path><path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path><path d="M15 2v5h5"></path></svg>
                    Add to Mobile Wallet
                  </Button>
                </div>
                
                {card.isActive && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeactivateCard(card.id)}
                    disabled={deactivateCardMutation.isPending}
                  >
                    {deactivateCardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Deactivate
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Card Details Dialog */}
      <Dialog open={showCardDetails} onOpenChange={setShowCardDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Virtual Card Details</DialogTitle>
            <DialogDescription>
              Your virtual card details for online purchases. Keep these details secure.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCard && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-white/70">NINJA WALLET</p>
                    <p className="text-lg font-semibold mt-1">{selectedCard.cardholderName}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-white/80" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/70">CARD NUMBER</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-lg tracking-wider">{selectedCard.cardNumber}</p>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCard.cardNumber);
                          toast({
                            title: "Copied",
                            description: "Card number copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-white/70">EXPIRY DATE</p>
                      <p className="font-mono">{selectedCard.expiryMonth}/{selectedCard.expiryYear}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-white/70">CVV</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono">{showCVV ? selectedCard.cvv : '•••'}</p>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10"
                          onClick={() => setShowCVV(!showCVV)}
                        >
                          {showCVV ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Daily Limit</span>
                  <span className="font-medium">${selectedCard.dailyLimit.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Limit</span>
                  <span className="font-medium">${selectedCard.monthlyLimit.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className={selectedCard.isActive ? 
                    "bg-green-50 text-green-600 border-green-200" : 
                    "bg-red-50 text-red-600 border-red-200"}>
                    {selectedCard.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm flex items-start">
                <Shield className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                <p>Keep your card details secure. Never share your full card number, expiry date, and CVV together.</p>
              </div>
              
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button 
                  variant="outline"
                  onClick={() => {
                    const cardDetails = `Card: ${selectedCard.cardNumber}\nExp: ${selectedCard.expiryMonth}/${selectedCard.expiryYear}\nCVV: ${selectedCard.cvv}\nName: ${selectedCard.cardholderName}`;
                    navigator.clipboard.writeText(cardDetails);
                    toast({
                      title: "Card details copied",
                      description: "All card details copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Details
                </Button>
                
                <Button 
                  variant="default"
                  onClick={() => setShowCardDetails(false)}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile Wallet Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Mobile Wallet</DialogTitle>
            <DialogDescription>
              Add this card to your mobile wallet for tap-to-pay functionality.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCard && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs text-white/70">TAP TO PAY ENABLED</p>
                    <p className="text-lg font-semibold mt-1">{selectedCard.cardholderName}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                    <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
                    <path d="M12 12H6"></path>
                    <path d="M12 16H9"></path>
                    <path d="M19 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                    <path d="M22 16a3 3 0 1 0-6 0"></path>
                  </svg>
                </div>
                
                <div className="text-center bg-white/10 py-3 rounded-md">
                  <p className="font-mono text-lg tracking-wider">TAP TO PAY READY</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                  <h4 className="font-semibold mb-2">Compatible with:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                      Apple Pay
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                        <path d="M2 20v.01"></path>
                      </svg>
                      Google Pay
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Samsung Pay
                    </li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Tap-to-Pay Instructions:</h4>
                  <ol className="space-y-2 text-sm text-gray-600 list-decimal pl-4">
                    <li>Open your mobile wallet app (Apple Pay, Google Pay, etc.)</li>
                    <li>Add this card to your digital wallet</li>
                    <li>When making a purchase, hold your phone near any contactless reader</li>
                    <li>Authenticate with your face, fingerprint, or PIN</li>
                    <li>Wait for the confirmation beep or vibration</li>
                  </ol>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Simulate adding to mobile wallet
                    setTimeout(() => {
                      toast({
                        title: "Added to Mobile Wallet",
                        description: "Your card has been added to your mobile wallet",
                      });
                      setShowWalletDialog(false);
                    }, 1500);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Add to Mobile Wallet
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VirtualCardsPage;
