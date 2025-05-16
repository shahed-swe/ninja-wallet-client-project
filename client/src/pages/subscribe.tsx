import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { Check, TrendingUp, DollarSign, Clock, AlertCircle, BadgePercent, Shield } from "lucide-react";
import { usePremiumUpsell } from "@/contexts/premium-upsell-context";
import { Badge } from "@/components/ui/badge";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard",
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Successfully subscribed
        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        
        toast({
          title: "Subscription Successful",
          description: "You are now a premium member!",
        });
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-[#7209B7]"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : `Subscribe for $9.99/month`}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get personalized premium upsell data
  const { data: upsellData } = usePremiumUpsell();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Get subscription setup on component mount
  useEffect(() => {
    const getSubscription = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await apiRequest("POST", "/api/subscribe");
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.status === 'active') {
          // Already subscribed
          toast({
            title: "Already Subscribed",
            description: `You are already a Premium member! Your subscription is active until ${new Date(data.currentPeriodEnd).toLocaleDateString()}.`,
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Subscription setup error:", error);
        toast({
          title: "Error",
          description: "Failed to initialize subscription",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getSubscription();
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) {
    return null;
  }

  const premiumFeatures = [
    "Reduced fees (8% instead of 13-15%)",
    "Better currency exchange rates (1.5% markup vs 3%)",
    "Priority customer support",
    "Enhanced security features",
    "No hidden fees for any transactions"
  ];

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
          <h2 className="text-2xl font-bold font-heading mb-1">Premium Subscription</h2>
          <p className="text-muted-foreground">Upgrade to Ninja Wallet Premium for exclusive benefits</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
              BEST VALUE
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Ninja Wallet Premium</CardTitle>
              <CardDescription className="text-zinc-300">
                Save money on every transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-zinc-300">/month</span>
              </div>
              
              <ul className="space-y-2">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-zinc-400">
                Cancel anytime. No long-term commitment required.
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Enter your payment details to activate Premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Unable to initialize subscription setup.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personalized savings section */}
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <BadgePercent className="mr-2 h-6 w-6 text-primary" />
            Your Personalized Savings
          </h3>
          
          {upsellData && upsellData.potentialSavings > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center text-center">
                  <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-green-500">${upsellData.potentialSavings.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">Your potential savings</span>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">
                    {upsellData.potentialSavings > 0 ? 
                      `${Math.round((upsellData.potentialSavings / 9.99) * 100)}%` : 
                      '0%'}
                  </span>
                  <span className="text-sm text-muted-foreground">Return on investment</span>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg flex flex-col items-center text-center">
                  <Clock className="h-8 w-8 text-amber-500 mb-2" />
                  <span className="text-2xl font-bold">
                    {upsellData.breakevenTransactions > 0 ? 
                      `${upsellData.breakevenTransactions}` : 
                      'N/A'}
                  </span>
                  <span className="text-sm text-muted-foreground">Transactions to break even</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {upsellData.highestSingleTransactionSaving > 0 && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Your highest single transaction would have saved <span className="font-semibold text-green-500">${upsellData.highestSingleTransactionSaving.toFixed(2)}</span> with premium</span>
                  </div>
                )}
                
                {upsellData.potentialSavings > 9.99 && (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Premium would <span className="font-semibold text-green-500">already pay for itself</span> based on your transaction history</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  <span>Premium members get <span className="font-semibold">50% lower markup</span> on currency exchanges</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <span>We don't have enough transaction data to calculate your personalized savings yet. Complete more transactions to see your potential savings.</span>
              </div>
              
              <p>
                With Ninja Wallet Premium, you'll save significantly on transaction fees. For example, if you transfer $1,000 per month, you'll save approximately $50-70 in fees compared to the standard plan. Premium pays for itself quickly for active users!
              </p>
              
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Premium members pay only <span className="font-semibold text-green-500">8% fees</span> instead of 13-15%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
