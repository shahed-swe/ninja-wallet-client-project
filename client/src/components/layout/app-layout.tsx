import { FC, ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { PremiumBadge } from "@/components/ui/premium-badge";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const getInitials = () => {
    if (!user) return "";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate("/");
  };
  
  const navItems = [
    { id: "home", icon: "ri-home-5-line", label: "Home", path: "/dashboard" },
    { id: "activity", icon: "ri-history-line", label: "Activity", path: "/activity" },
    { id: "cards", icon: "ri-bank-card-line", label: "Cards", path: "/cards" },
    { id: "learn", icon: "ri-book-open-line", label: "Learn", path: "/courses" },
    { id: "profile", icon: "ri-user-line", label: "Profile", path: "/profile" },
  ];
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="bg-secondary/10 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary mr-3">
              <i className="ri-ninja-fill text-xl text-white"></i>
            </div>
            <h1 className="text-xl font-bold font-heading">Ninja Wallet</h1>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <i className="ri-notification-3-line text-xl"></i>
            </Button>
            <div className="relative">
              <Button 
                size="icon" 
                className="flex items-center justify-center h-9 w-9 rounded-full bg-[#7209B7] hover:bg-[#8A2BC8]"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="text-white font-medium text-sm">{getInitials()}</span>
              </Button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-popover border border-border py-1 z-10">
                  <div className="px-4 py-2 text-sm font-medium border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        {user?.firstName} {user?.lastName}
                      </div>
                      {user?.isPremium && <PremiumBadge size="sm" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                    {user?.referralCode && (
                      <div className="text-xs mt-1 bg-secondary/30 rounded px-1 py-0.5">
                        Referral code: <span className="font-mono">{user.referralCode}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-1 border-b border-border">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">TRANSFERS</div>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-none text-sm px-2 py-1 h-auto"
                      onClick={() => navigate('/send-money')}
                    >
                      <i className="ri-send-plane-fill mr-2"></i> Send Money
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-none text-sm px-2 py-1 h-auto text-amber-500"
                      onClick={() => navigate('/instant-transfer')}
                    >
                      <i className="ri-flashlight-line mr-2"></i> Instant Transfer
                    </Button>
                  </div>
                  
                  {!user?.isPremium && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start rounded-none text-sm px-4 py-2 text-amber-500"
                      onClick={() => navigate('/subscribe')}
                    >
                      <i className="ri-vip-crown-line mr-2"></i> Upgrade to Premium
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-none text-sm px-4 py-2"
                    onClick={handleLogout}
                  >
                    <i className="ri-logout-box-r-line mr-2"></i> Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-secondary/10 border-t border-border p-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center justify-center rounded-lg p-2 ${
                location === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <i className={`${item.icon} text-xl mb-1`}></i>
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
