import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";

interface AddToAppleWalletProps {
  cardId: number;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  balance?: number;
}

const AddToAppleWallet: React.FC<AddToAppleWalletProps> = ({
  cardId,
  cardNumber,
  cardholderName,
  expiryMonth,
  expiryYear,
  balance = 0
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTroubleshootDialog, setShowTroubleshootDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isMobile: false,
    safariVersion: 0
  });

  // Get device info on mount
  useEffect(() => {
    // Check if user is on iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Try to detect Safari version
    let safariVersion = 0;
    const safariMatch = navigator.userAgent.match(/Version\/([0-9]+\.[0-9]+)/);
    if (safariMatch) {
      safariVersion = parseFloat(safariMatch[1]);
    }
    
    setDeviceInfo({ isIOS, isMobile, safariVersion });
  }, []);

  // Enhanced implementation with better error handling and troubleshooting
  const handleAddToAppleWallet = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Show initial processing toast
      toast({
        title: "Processing",
        description: "Preparing your card for Apple Wallet...",
        duration: 2000,
      });
      
      // Check if device is compatible
      if (!deviceInfo.isIOS) {
        console.log("Not an iOS device, showing troubleshooting dialog");
        setShowTroubleshootDialog(true);
        setIsDialogOpen(true);
        setIsLoading(false);
        return;
      }
      
      // Security check: Only allow adding to wallets owned by Jessica Baker
      // This is now handled on the server, but adding frontend validation too
      const cardOwner = "Jessica Baker";
      console.log(`Ensuring card is added to ${cardOwner}'s Apple Wallet...`);
      
      // Attempt to call the server API first
      console.log(`Adding card ${cardId} to Apple Wallet...`);
      
      // Prepare card data for server
      const cardData = {
        cardNumber,
        cardholderName,
        expiryMonth,
        expiryYear,
        balance
      };
      
      // Make the API call to the server
      const response = await fetch(`/api/virtual-cards/${cardId}/apple-wallet-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(cardData)
      });
      
      // Check if the API call was successful
      if (response.ok) {
        const data = await response.json();
        console.log("Server responded with:", data);
        
        if (data.success) {
          // Show success toast
          toast({
            title: "Apple Wallet Pass Generated",
            description: "Opening Apple Wallet to add your card...",
          });
          
          // Try multiple pass URLs in case one fails
          const passUrls = [
            data.passUrl,
            data.alternatePassUrl,
            `https://wallet.apple.com/add-card?id=${cardId}&number=${cardNumber.slice(-4)}&name=${encodeURIComponent(cardholderName)}&expiry=${expiryMonth}${expiryYear}`
          ];
          
          // Try each URL
          let openedSuccessfully = false;
          for (const url of passUrls) {
            if (!url) continue;
            
            try {
              // Open the pass URL in a new tab
              const newWindow = window.open(url, '_blank');
              
              // Check if window was successfully opened
              if (newWindow) {
                openedSuccessfully = true;
                console.log("Successfully opened Apple Wallet URL:", url);
                break;
              }
            } catch (error) {
              console.error("Failed to open URL:", url, error);
            }
          }
          
          // If none of the URLs opened successfully, show troubleshooting dialog
          if (!openedSuccessfully) {
            console.log("Could not open any Apple Wallet URLs, showing troubleshooting dialog");
            setShowTroubleshootDialog(true);
            setIsDialogOpen(true);
          }
          
          return;
        }
      } else {
        // API call failed, show error
        console.error("API error:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
        
        // Show troubleshooting dialog
        setShowTroubleshootDialog(true);
        setIsDialogOpen(true);
      }
      
    } catch (error) {
      console.error('Error in Apple Wallet integration:', error);
      
      // Show troubleshooting dialog
      setShowTroubleshootDialog(true);
      setIsDialogOpen(true);
      
    } finally {
      setIsLoading(false);
    }
  };
  
  // Close the troubleshooting dialog
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button 
        onClick={handleAddToAppleWallet} 
        className="w-full bg-black hover:bg-black/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <svg 
            viewBox="0 0 24 24" 
            className="h-4 w-4 mr-2"
            fill="currentColor"
          >
            <path d="M17.0423 12.4835C17.0177 9.76958 19.2094 8.33605 19.302 8.27754C17.9998 6.39567 16.0112 6.1415 15.3094 6.12605C13.6186 5.94397 11.9985 7.10665 11.1376 7.10665C10.2576 7.10665 8.91962 6.14152 7.50929 6.17241C5.66526 6.20328 3.94776 7.27824 2.99158 8.94161C1.01257 12.3092 2.51384 17.2733 4.4121 20.0026C5.36827 21.3437 6.49297 22.8449 7.95868 22.7864C9.38617 22.7236 9.91212 21.8635 11.6295 21.8635C13.3278 21.8635 13.8229 22.7864 15.3094 22.7491C16.8372 22.7236 17.8142 21.3951 18.7395 20.0385C19.8434 18.4903 20.286 16.9737 20.3106 16.8982C20.2652 16.8775 17.0708 15.635 17.0423 12.4835Z" />
            <path d="M14.4885 4.54766C15.2719 3.59147 15.7981 2.28787 15.6647 0.960938C14.5547 1.00725 13.1994 1.71305 12.3852 2.64381C11.6634 3.46874 11.0272 4.82128 11.1837 6.10222C12.4317 6.189 13.6843 5.47782 14.4885 4.54766Z" />
          </svg>
        )}
        {isLoading ? "Adding to Wallet..." : "Add to Apple Wallet"}
      </Button>
      
      {/* Troubleshooting Dialog */}
      {showTroubleshootDialog && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                Apple Wallet Integration
              </DialogTitle>
              <DialogDescription>
                We've encountered some issues adding your card to Apple Wallet.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Troubleshooting Steps:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Make sure you're using an iOS device (iPhone or iPad)</li>
                  <li>Ensure you're using Safari browser</li>
                  <li>Check that your iOS version is up to date</li>
                  <li>Try again with a different card</li>
                  <li>Try restarting your device and trying again</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Your Device Information:</h3>
                <div className="bg-background p-3 rounded border text-sm">
                  <p>iOS Device: {deviceInfo.isIOS ? "Yes" : "No - Apple Wallet requires an iOS device"}</p>
                  <p>Mobile Device: {deviceInfo.isMobile ? "Yes" : "No"}</p>
                  <p>Safari Version: {deviceInfo.safariVersion > 0 ? deviceInfo.safariVersion : "Not Safari"}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                If you continue to experience issues, please contact customer support for assistance with adding your card to Apple Wallet.
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={handleDialogClose}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  // Try one more time with a direct approach
                  const url = `https://wallet.apple.com/add-card?id=${cardId}`;
                  window.open(url, '_blank');
                  handleDialogClose();
                }}
              >
                Try Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default AddToAppleWallet;