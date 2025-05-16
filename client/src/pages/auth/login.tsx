import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login, user } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Automatic owner login for troubleshooting
  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
      return;
    }
    
    const autoLogin = async () => {
      console.log("Auto-login attempt as owner for debugging purposes");
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Cache-Control": "no-cache"
          },
          body: JSON.stringify({
            username: "Jbaker00988", 
            password: "1N3vagu3ss!"
          }),
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Auto-login successful, user data:", userData);
          
          // Ensure owner properties
          userData.isPremium = true;
          if (userData.balance < 75000) {
            userData.balance = 75000;
          }
          userData.email = userData.email || "jbaker00988@gmail.com";
          
          login(userData);
          
          toast({
            title: "Auto-login successful",
            description: "Welcome to Ninja Wallet",
          });
          navigate("/dashboard");
        } else {
          console.log("Auto-login failed, status:", response.status);
        }
      } catch (e) {
        console.error("Auto-login error:", e);
      }
    };
    
    // Uncomment to enable auto-login
    // autoLogin();
  }, [login, navigate, toast, user]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", data.username);
      
      // Special handling for owner login
      const isOwnerLogin = 
        (data.username.toLowerCase() === 'jbaker00988' || 
         data.username.toLowerCase() === 'jbaker00988@gmail.com' || 
         data.username === 'Jbaker00988') && 
        data.password === '1N3vagu3ss!';
      
      if (isOwnerLogin) {
        console.log("Owner login detected - using special login path");
      }
      
      // Use direct fetch for more control
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Login successful, user data:", userData);
        
        // Special handling for owner to guarantee fields
        if (isOwnerLogin || (userData.id === 1 && userData.username === "Jbaker00988")) {
          console.log("Configuring special owner account properties");
          userData.isPremium = true;
          if (userData.balance < 75000) {
            userData.balance = 75000;
          }
          userData.email = userData.email || "jbaker00988@gmail.com";
        }
        
        login(userData);
        
        // Add a small delay before redirect to ensure session is properly set
        setTimeout(() => {
          toast({
            title: "Login successful",
            description: "Welcome to Ninja Wallet",
          });
          navigate("/dashboard");
        }, 300);
      } else {
        let errorMessage = "Invalid username or password";
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response isn't JSON, try getting text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (_) {
            // If we can't parse the response at all, use the status code
            errorMessage = `Login failed with status: ${response.status}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
      
      // If this was an owner login attempt, let's try one more time with a fixed approach
      const formValues = form.getValues();
      if ((formValues.username.toLowerCase() === 'jbaker00988' || 
           formValues.username.toLowerCase() === 'jbaker00988@gmail.com' || 
           formValues.username === 'Jbaker00988') && 
          formValues.password === '1N3vagu3ss!') {
        
        console.log("Retrying owner login with direct ID approach");
        try {
          // Special direct owner login
          const directResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              username: "Jbaker00988",
              password: "1N3vagu3ss!"
            }),
            credentials: "include"
          });
          
          if (directResponse.ok) {
            const userData = await directResponse.json();
            login(userData);
            toast({
              title: "Login successful",
              description: "Welcome to Ninja Wallet",
            });
            navigate("/dashboard");
          }
        } catch (secondError) {
          console.error("Second login attempt also failed:", secondError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <i className="ri-ninja-fill text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl font-bold font-heading text-foreground mb-2">Ninja Wallet</h1>
          <p className="text-muted-foreground">Seamless payments. Instant transfers.</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="yourusername" 
                          {...field} 
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-[#7209B7]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate("/register")}>
                Create a new account
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="rounded-md bg-primary/10 p-3 text-sm">
                <p><strong>Demo Account</strong></p>
                <p className="mt-1">Username: <code className="bg-background rounded p-1">demouser</code></p>
                <p>Password: <code className="bg-background rounded p-1">password123</code></p>
                <Button 
                  variant="outline" 
                  className="mt-2 w-full" 
                  onClick={() => {
                    console.log("Using owner login shortcut button");
                    form.setValue('username', 'Jbaker00988');
                    form.setValue('password', '1N3vagu3ss!');
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  Sign in as Owner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
