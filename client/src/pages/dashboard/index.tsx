import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/app-layout";
import BalanceCard from "@/components/sections/balance-card";
import QuickActions from "@/components/sections/quick-actions";
import RecentTransactions from "@/components/sections/recent-transactions";
import TransactionSpeedChart from "@/components/sections/transaction-speed-chart";
import InvestmentsOverview from "@/components/sections/investments-overview";
import { PremiumUpsellBanner } from "@/components/premium-upsell";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch recent transactions
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions 
  } = useQuery({
    queryKey: ["/api/transactions/recent"],
    enabled: isAuthenticated,
  });
  
  // Fetch investments
  const { 
    data: investments, 
    isLoading: isLoadingInvestments 
  } = useQuery({
    queryKey: ["/api/investments"],
    enabled: isAuthenticated,
  });
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        {/* Premium upsell banner - only shows for non-premium users */}
        <PremiumUpsellBanner className="mb-4" />
        
        <BalanceCard 
          balance={user?.balance || 0} 
          onSend={() => navigate("/transfers")}
          onReceive={() => navigate("/checkout")}
          onTrade={() => navigate("/dashboard/investments")}
        />
        
        <QuickActions 
          onLinkAccount={() => navigate("/dashboard/link-accounts")}
          onSendMoney={() => navigate("/transfers")}
          onExternalTransfer={() => navigate("/transfers/external-transfer")}
          onInstantTransfer={() => navigate("/dashboard/instant-transfer")}
          onTapToPay={() => navigate("/dashboard/tap-to-pay")}
          onInvest={() => navigate("/dashboard/investments")}
          onLearn={() => navigate("/courses")}
        />
        
        <RecentTransactions 
          transactions={Array.isArray(transactions) ? transactions : []} 
          isLoading={isLoadingTransactions}
        />

        <TransactionSpeedChart
          transactions={Array.isArray(transactions) ? transactions : []}
          isLoading={isLoadingTransactions}
        />
        
        <InvestmentsOverview 
          investments={Array.isArray(investments) ? investments : []} 
          isLoading={isLoadingInvestments}
          onViewAll={() => navigate("/investments")}
        />
      </div>
    </AppLayout>
  );
}
