import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AppLayout from "@/components/layout/app-layout";
import SupportedServices from "@/components/sections/supported-services";

const linkAccountSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  accountUsername: z.string().min(1, "Email/Username is required"),
  // For a real app we'd handle password differently, but this is just for demo
  password: z.string().min(1, "Password is required"),
});

type LinkAccountFormValues = z.infer<typeof linkAccountSchema>;

export default function LinkAccounts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [accountType, setAccountType] = useState("");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<LinkAccountFormValues>({
    resolver: zodResolver(linkAccountSchema),
    defaultValues: {
      provider: "",
      accountUsername: "",
      password: "",
    },
  });
  
  const linkAccountMutation = useMutation({
    mutationFn: (data: { provider: string; accountUsername: string }) => {
      return apiRequest("POST", "/api/linked-accounts", data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/linked-accounts"] });
      
      toast({
        title: "Account linked successfully",
        description: `Your ${form.getValues().provider} account has been connected`,
      });
      
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Failed to link account",
        description: error instanceof Error ? error.message : "An error occurred while linking the account",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: LinkAccountFormValues) => {
    linkAccountMutation.mutate({
      provider: data.provider,
      accountUsername: data.accountUsername,
    });
  };
  
  const handleAccountTypeClick = (type: string) => {
    setAccountType(type === "bank" ? "Bank Account" : "Payment App");
    setShowForm(true);
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
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
          <h2 className="text-2xl font-bold font-heading mb-1">Link Your Accounts</h2>
          <p className="text-muted-foreground">Connect your external accounts to transfer money</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:bg-secondary/5 transition duration-200"
            onClick={() => handleAccountTypeClick("bank")}
          >
            <CardContent className="p-5">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-primary/20 p-3 mr-3">
                  <i className="ri-bank-line text-xl text-primary"></i>
                </div>
                <h3 className="font-heading font-semibold">Bank Account</h3>
              </div>
              <p className="text-muted-foreground text-sm">Connect your bank accounts to transfer funds directly</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:bg-secondary/5 transition duration-200"
            onClick={() => handleAccountTypeClick("payment")}
          >
            <CardContent className="p-5">
              <div className="flex items-center mb-3">
                <div className="rounded-full bg-secondary/20 p-3 mr-3">
                  <i className="ri-wallet-3-line text-xl text-secondary"></i>
                </div>
                <h3 className="font-heading font-semibold">Payment Apps</h3>
              </div>
              <p className="text-muted-foreground text-sm">Connect Venmo, Cash App, Zelle, and more</p>
            </CardContent>
          </Card>
        </div>
        
        <SupportedServices />
        
        {showForm && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <h3 className="font-heading font-semibold mb-4">Connect Your {accountType}</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={linkAccountMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="zelle">Zelle</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="cashapp">Cash App</SelectItem>
                            <SelectItem value="venmo">Venmo</SelectItem>
                            <SelectItem value="applepay">Apple Pay</SelectItem>
                            <SelectItem value="googlepay">Google Pay</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accountUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email/Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com"
                            {...field} 
                            disabled={linkAccountMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••"
                            {...field} 
                            disabled={linkAccountMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-[#7209B7]"
                    disabled={linkAccountMutation.isPending}
                  >
                    {linkAccountMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </span>
                    ) : "Connect Account"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    By connecting your account, you authorize Ninja Wallet to access your account information for facilitating transfers. 
                    <Button variant="link" className="h-auto p-0 text-xs">Terms apply</Button>.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
