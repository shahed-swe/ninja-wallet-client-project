import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Send, 
  Globe, 
  ChevronRight, 
  Layers, 
  Shield, 
  DollarSign,
  Zap,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Thanks for subscribing!",
        description: "We'll keep you updated on the latest Ninja Wallet news.",
      });
      setEmail('');
    }
  };
  
  const handleReferClick = () => {
    const referralCode = 'NINJA' + Math.random().toString(36).substring(2, 8).toUpperCase();
    navigator.clipboard.writeText(`Join Ninja Wallet using my referral code: ${referralCode} and get $5 credit! https://ninjawallet.app/register?ref=${referralCode}`);
    toast({
      title: "Referral link copied!",
      description: "Share with friends to earn rewards!",
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Optimized SEO metadata */}
      <div className="hidden">
        <h1>Ninja Wallet - Modern Digital Payment Platform</h1>
        <p>Send money, manage cards, invest, and save with lower fees. The all-in-one financial solution for modern life.</p>
        <p>Keywords: digital wallet, money transfer, virtual cards, investments, financial education, low fees</p>
      </div>
      
      {/* Header/Nav */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Ninja Wallet</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Limited Time: 47% Off All Premium Fees
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                The Modern <span className="text-primary">Money Transfer</span> Experience
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Send money, manage virtual cards, invest, and more—all with the lowest fees in the industry.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">See Features</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>100k+ Users</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-md overflow-hidden border-primary/20 bg-primary/5">
                <div className="p-6">
                  <Tabs defaultValue="send" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="send">Send</TabsTrigger>
                      <TabsTrigger value="invest">Invest</TabsTrigger>
                      <TabsTrigger value="cards">Cards</TabsTrigger>
                    </TabsList>
                    <TabsContent value="send" className="space-y-4 pt-4">
                      <h3 className="text-xl font-medium">Send Money Instantly</h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 gap-4">
                          <Input className="col-span-3" placeholder="Recipient" />
                          <Input type="number" placeholder="$0.00" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-3">
                            <p className="text-sm text-muted-foreground mb-1">Fee:</p>
                            <div className="flex items-center gap-2">
                              <span className="line-through text-muted-foreground">$1.53</span>
                              <span className="text-green-600 font-semibold">$0.80</span>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Premium</span>
                            </div>
                          </div>
                          <Button className="mt-auto">Send</Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="invest" className="space-y-4 pt-4">
                      <h3 className="text-xl font-medium">Grow Your Money</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-2 rounded-full">
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Stock ETFs</p>
                              <p className="text-xs text-muted-foreground">Diversify your portfolio</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-yellow-500/20 p-2 rounded-full">
                              <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium">Crypto</p>
                              <p className="text-xs text-muted-foreground">Bitcoin, Ethereum & more</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="cards" className="space-y-4 pt-4">
                      <h3 className="text-xl font-medium">Virtual Cards</h3>
                      <div className="rounded-xl bg-primary/90 p-4 text-white">
                        <div className="mb-4 flex justify-between">
                          <div className="text-white/80">Ninja Wallet</div>
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="mb-2 font-mono tracking-wider">•••• •••• •••• 1234</div>
                        <div className="flex justify-between">
                          <div className="text-xs">
                            <div className="text-white/80">Valid Thru</div>
                            <div>12/28</div>
                          </div>
                          <div className="text-xs">
                            <div className="text-white/80">CVV</div>
                            <div>•••</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Daily Limit:</span>
                        <span>$500.00</span>
                      </div>
                      <Button className="w-full">Create Card</Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Why Choose Ninja Wallet
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything You Need in One Place</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Manage all your financial needs with our comprehensive suite of features designed to save you time and money.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <Send className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Money Transfers</h3>
                <p className="text-muted-foreground">
                  Send money to anyone, anywhere, with fees up to 47% lower than competitors. Premium users save even more.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <CreditCard className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Virtual Cards</h3>
                <p className="text-muted-foreground">
                  Create unlimited virtual cards with customizable spending limits for safer online shopping.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <TrendingUp className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Investments</h3>
                <p className="text-muted-foreground">
                  Grow your wealth with our intuitive investment platform supporting stocks, ETFs, and cryptocurrencies.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <Globe className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">International Transfers</h3>
                <p className="text-muted-foreground">
                  Send money globally with competitive exchange rates and reduced fees for premium members.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <Layers className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Financial Education</h3>
                <p className="text-muted-foreground">
                  Access exclusive courses on financial literacy, investing, and wealth management.
                </p>
              </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-6">
                <Shield className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
                <p className="text-muted-foreground">
                  Rest easy with our state-of-the-art encryption and security protocols protecting your financial data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Simple Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get started for free or unlock premium benefits with our affordable subscription plan.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 mt-12">
            {/* Free Plan */}
            <Card className="flex flex-col">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-2xl font-bold">Basic</h3>
                  <p className="text-muted-foreground">Essential features for casual users</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Standard money transfers (13% fee)
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Up to 5 virtual cards
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Basic investment options
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Standard currency exchange (3% markup)
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Basic financial courses
                  </li>
                </ul>
                <Button className="mt-8 w-full" variant="outline" asChild>
                  <Link href="/register">Sign Up Free</Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Premium Plan */}
            <Card className="relative flex flex-col border-primary bg-primary/5">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-2xl font-bold">Premium</h3>
                  <p className="text-muted-foreground">Enhanced features for power users</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="font-medium">Reduced transfer fees (8%)</span>
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">Save 47%</span>
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited virtual cards
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Advanced investment options
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Preferential exchange rates (1.5% markup)
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    All premium financial courses
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-primary"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Priority customer support
                  </li>
                </ul>
                <Button className="mt-8 w-full" asChild>
                  <Link href="/subscribe">Go Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Referral Program */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                Refer & Earn
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Share With Friends,<br />Get Rewarded
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mb-6">
                For every friend who joins using your referral code, you'll both receive $5 credit. Plus, you'll earn 1% of their transaction fees for a year!
              </p>
              <Button size="lg" onClick={handleReferClick}>
                <Users className="mr-2 h-5 w-5" />
                Get Referral Link
              </Button>
            </div>
            <div className="rounded-xl bg-white p-8 shadow-xl">
              <div className="text-center mb-6">
                <Users className="mx-auto h-12 w-12 text-primary" />
                <h3 className="mt-4 text-2xl font-bold">How It Works</h3>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Share your unique referral code</h4>
                    <p className="text-muted-foreground">Send to friends via email, social media, or messaging apps</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Friend creates an account</h4>
                    <p className="text-muted-foreground">They sign up using your referral code</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Both get rewarded</h4>
                    <p className="text-muted-foreground">You each receive $5 credit instantly</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Earn passive income</h4>
                    <p className="text-muted-foreground">Receive 1% of their transaction fees for 12 months</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Don't just take our word for it—hear from our satisfied users around the world.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">
                    "I've saved over $200 in fees this year alone by using Ninja Wallet for my international transfers. The premium subscription pays for itself!"
                  </p>
                  <div className="font-semibold">Sarah K.</div>
                  <div className="text-xs text-muted-foreground">Premium User, 1 year</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">
                    "The virtual cards feature is a game-changer for online shopping. I create a new card for each merchant, keeping my main account secure."
                  </p>
                  <div className="font-semibold">Michael T.</div>
                  <div className="text-xs text-muted-foreground">Basic User, 8 months</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <div className="grid gap-1">
                  <p className="text-sm text-muted-foreground">
                    "I started with the financial courses and now I'm confidently managing my investments. Plus the referral program helps me earn extra cash."
                  </p>
                  <div className="font-semibold">Jennifer L.</div>
                  <div className="text-xs text-muted-foreground">Premium User, 2 years</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              FAQ
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to the most common questions about Ninja Wallet.
            </p>
          </div>
          <div className="mx-auto max-w-3xl mt-12 space-y-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold">How do I get started with Ninja Wallet?</h3>
              <p className="mt-2 text-muted-foreground">
                Simply click the 'Sign Up' button, create an account with your email, and follow the verification process. You'll be up and running in less than 2 minutes!
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold">What makes Ninja Wallet different from other payment apps?</h3>
              <p className="mt-2 text-muted-foreground">
                Ninja Wallet offers the most comprehensive suite of financial tools while maintaining the lowest fee structure in the industry. Our premium plan can save users up to 47% on transaction fees compared to competitors.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold">How secure is my financial data?</h3>
              <p className="mt-2 text-muted-foreground">
                We employ bank-level security with 256-bit encryption, two-factor authentication, and regular security audits. Your financial data is never stored on your device and all transactions require verification.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold">How does the referral program work?</h3>
              <p className="mt-2 text-muted-foreground">
                When someone signs up using your referral code, both of you receive $5 credit once they complete their first transaction. Additionally, you'll earn 1% of their transaction fees for a full year, creating a passive income stream.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold">Can I cancel my premium subscription at any time?</h3>
              <p className="mt-2 text-muted-foreground">
                Yes, you can cancel your premium subscription at any time. Your benefits will continue until the end of your current billing period without any additional charges.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
              Stay Updated
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Newsletter</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Subscribe to get the latest updates, tips, and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="min-w-0 flex-1"
              />
              <Button type="submit">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Ninja Wallet</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern money transfer experience with the lowest fees in the industry.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Product</div>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/features" className="hover:underline">Features</Link>
                <Link href="/pricing" className="hover:underline">Pricing</Link>
                <Link href="/cards" className="hover:underline">Virtual Cards</Link>
                <Link href="/investments" className="hover:underline">Investments</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Company</div>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/about" className="hover:underline">About Us</Link>
                <Link href="/careers" className="hover:underline">Careers</Link>
                <Link href="/blog" className="hover:underline">Blog</Link>
                <Link href="/press" className="hover:underline">Press Kit</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Resources</div>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/help" className="hover:underline">Help Center</Link>
                <Link href="/courses" className="hover:underline">Financial Courses</Link>
                <Link href="/referral" className="hover:underline">Referral Program</Link>
                <Link href="/affiliates" className="hover:underline">Affiliates</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-medium">Legal</div>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/terms" className="hover:underline">Terms of Service</Link>
                <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
                <Link href="/compliance" className="hover:underline">Compliance</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <div className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Ninja Wallet. All rights reserved.
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
