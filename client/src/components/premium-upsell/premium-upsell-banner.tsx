import React from 'react';
import { Link } from 'wouter';
import { Sparkles, ArrowRight } from 'lucide-react';
import { usePremiumUpsell } from '@/contexts/premium-upsell-context';
import { Button } from '@/components/ui/button';

type PremiumUpsellBannerProps = {
  className?: string;
};

export const PremiumUpsellBanner = ({ className = '' }: PremiumUpsellBannerProps) => {
  const { data: upsellData, isLoading } = usePremiumUpsell();

  // If user is premium or data is loading, don't show anything
  if (isLoading || !upsellData || upsellData.isPremium) {
    return null;
  }

  // If they have enough transactions to potentially save money
  const hasSavings = upsellData.potentialSavings > 0;
  const breakEvenSoon = upsellData.breakevenTransactions && upsellData.breakevenTransactions < 5;
  const roi = upsellData.potentialSavings > 0 ? (upsellData.potentialSavings / upsellData.monthlyPremiumCost) * 100 : 0;
  const hasGoodRoi = roi > 150; // Over 150% ROI is considered good

  return (
    <div className={`bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-4 border border-primary/20 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-full mr-3">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-medium text-sm md:text-base">
              {hasSavings ? (
                <>Save <span className="font-bold text-primary">${upsellData.potentialSavings.toFixed(2)}</span> on fees with Premium</>
              ) : hasGoodRoi ? (
                <>Get <span className="font-bold text-primary">{Math.round(roi)}%</span> return on your Premium investment</>
              ) : breakEvenSoon ? (
                <>Break even on Premium in just <span className="font-bold text-primary">{upsellData.breakevenTransactions}</span> transactions</>
              ) : (
                <>Upgrade to Premium and save on every transaction</>
              )}
            </h3>
          </div>
        </div>
        <Button asChild size="sm" className="whitespace-nowrap" variant="outline">
          <Link href="/subscribe">
            Upgrade Now
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
