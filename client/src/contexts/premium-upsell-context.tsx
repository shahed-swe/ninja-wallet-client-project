import { createContext, ReactNode, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';

type Opportunity = {
  type: string;
  title: string;
  description: string;
  savingsAmount?: number;
  roi?: number;
  priority: 'high' | 'medium' | 'low';
};

type PremiumUpsellData = {
  opportunities: Opportunity[];
  potentialSavings: number;
  highestSingleTransactionSaving: number;
  transactionCount: number;
  breakevenTransactions: number;
  isPremium: boolean;
  monthlyPremiumCost: number;
  message?: string;
};

type PremiumUpsellContextType = {
  data: PremiumUpsellData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

const PremiumUpsellContext = createContext<PremiumUpsellContextType | null>(null);

export function PremiumUpsellProvider({ children }: { children: ReactNode }) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<PremiumUpsellData, Error>({
    queryKey: ["/api/premium-upsell/opportunities"],
    retry: 1,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return (
    <PremiumUpsellContext.Provider
      value={{
        data: data || null,
        isLoading,
        error,
        refetch
      }}
    >
      {children}
    </PremiumUpsellContext.Provider>
  );
}

export function usePremiumUpsell() {
  const context = useContext(PremiumUpsellContext);
  if (!context) {
    throw new Error("usePremiumUpsell must be used within a PremiumUpsellProvider");
  }
  return context;
}
