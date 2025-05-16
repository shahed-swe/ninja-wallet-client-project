import { 
  createContext, 
  ReactNode, 
  useState, 
  useEffect, 
  useCallback 
} from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  balance: number;
  isPremium?: boolean;
  referralCode?: string;
  premiumExpiry?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Enhanced session check with improved error handling and retry capability
  const checkSession = useCallback(async () => {
    try {
      console.log("Checking authentication session...");
      setIsLoading(true);

      // This helps debugging - using a direct XHR request with full credentials
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache, no-store",
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      
      console.log("Session check response status:", response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Session found, user data:", userData);
        
        // Extra validation for owner account
        if (userData.id === 1 && userData.username === "Jbaker00988") {
          console.log("OWNER ACCOUNT logged in successfully");
          
          // Ensure owner account always has premium status and funds
          if (!userData.isPremium) {
            userData.isPremium = true;
          }
          
          if (userData.balance < 75000) {
            userData.balance = 75000;
          }
        }
        
        setUser(userData);
        return; // Early return on success
      } else if (response.status === 401) {
        console.log("No active session found - not logged in");
        setUser(null);
      } else {
        console.error("Session check error:", response.status);
        
        // Try one more time with a fresh request if we got a non-401 error
        console.log("Retrying session check...");
        try {
          const retryResponse = await fetch("/api/auth/session?t=" + new Date().getTime(), {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "Cache-Control": "no-cache, no-store",
              "X-Requested-With": "XMLHttpRequest",
              "Pragma": "no-cache"
            }
          });
          
          console.log("Retry session check response status:", retryResponse.status);
          
          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            console.log("Session found on retry, user data:", userData);
            setUser(userData);
          } else {
            console.log("No active session found after retry");
            setUser(null);
          }
        } catch (retryError) {
          console.error("Session retry error:", retryError);
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = (userData: User) => {
    console.log("Setting user data in auth context:", userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Could not complete logout process",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
