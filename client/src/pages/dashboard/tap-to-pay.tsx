import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import TapToPay from "@/components/TapToPay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileTapToPay from "@/components/MobileTapToPay";

export default function TapToPayPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Tap to Pay</h1>
          <p className="text-gray-500">Process contactless payments using your device</p>
        </div>
        
        <Tabs defaultValue="desktop" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="desktop">Desktop Terminal</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Device</TabsTrigger>
          </TabsList>
          <TabsContent value="desktop">
            <div className="bg-white rounded-lg p-4">
              <TapToPay />
            </div>
          </TabsContent>
          <TabsContent value="mobile">
            <div className="bg-white rounded-lg p-4">
              <MobileTapToPay />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-3">About Tap to Pay</h2>
          <p className="mb-4">Ninja Wallet's Tap to Pay feature allows you to accept contactless payments using your device. Our system uses secure NFC technology to process payments instantly.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium mb-2">Desktop Terminal</h3>
              <p className="text-sm text-gray-600">Use your computer as a payment terminal for processing tap payments from customers' devices.</p>
            </div>
            <div className="bg-white p-4 rounded-md border">
              <h3 className="font-medium mb-2">Mobile Device</h3>
              <p className="text-sm text-gray-600">Turn your smartphone into a payment terminal to accept tap payments on the go.</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Standard users pay a 0.5% convenience fee for NFC transactions. Premium users have this fee waived.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}