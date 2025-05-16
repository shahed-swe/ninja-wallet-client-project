import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import MobileTapToPay from "@/components/MobileTapToPay";

export default function MobileTapToPayPage() {
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
    <div className="min-h-screen bg-gray-50">
      <div className="py-4 px-4 bg-primary text-primary-foreground">
        <h1 className="text-xl font-bold">Ninja Wallet</h1>
        <div className="text-xs mt-1 opacity-80">Tap to Pay Mobile Terminal</div>
      </div>
      
      <div className="p-4 mt-2">
        <MobileTapToPay />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg text-center"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}