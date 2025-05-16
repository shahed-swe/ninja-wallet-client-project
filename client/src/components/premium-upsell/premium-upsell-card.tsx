import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, ArrowRight, DollarSign, TrendingUp, Globe, Zap } from 'lucide-react';
import { usePremiumUpsell } from '@/contexts/premium-upsell-context';

type PremiumUpsellCardProps = {
  size?: 'small' | 'medium' | 'large';
  position?: 'sidebar' | 'inline' | 'standalone';
  showDetails?: boolean;
  customMessage?: string;
};

export const PremiumUpsellCard = ({
  size = 'medium',
  position = 'inline',
  showDetails = true,
  customMessage,
}: PremiumUpsellCardProps) => {
  const { data: upsellData, isLoading } = usePremiumUpsell();

  // If user is premium or data is loading, don't show anything
  if (isLoading || !upsellData || upsellData.isPremium) {
    return null;
  }

  // Get the top opportunity based on priority
  const topOpportunity = upsellData.opportunities[0];
  if (!topOpportunity) {
    return null;
  }

  const getIconForOpportunityType = (type: string) => {
    switch (type) {
      case 'fee_savings':
        return <DollarSign className="h-5 w-5" />;
      case 'investment_access':
        return <TrendingUp className="h-5 w-5" />;
      case 'currency_exchange':
        return <Globe className="h-5 w-5" />;
      case 'education':
        return <Zap className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'sidebar':
        return 'w-full';
      case 'standalone':
        return 'w-full max-w-sm mx-auto';
      default:
        return 'w-full';
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 ${getPositionClasses()}`}>
      <CardHeader className={`pb-2 ${getSizeClasses()}`}>
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">
            Upgrade to Premium
          </CardTitle>
        </div>
        {size !== 'small' && (
          <CardDescription>
            {customMessage || topOpportunity.description}
          </CardDescription>
        )}
      </CardHeader>
      {showDetails && size !== 'small' && (
        <CardContent className={`pb-2 ${getSizeClasses()}`}>
          <div className="space-y-2">
            {upsellData.potentialSavings > 0 && (
              <div className="flex justify-between text-sm">
                <span>Potential fee savings:</span>
                <span className="font-semibold text-green-600">${upsellData.potentialSavings.toFixed(2)}</span>
              </div>
            )}
            {upsellData.breakevenTransactions > 0 && (
              <div className="flex justify-between text-sm">
                <span>Breakeven transactions:</span>
                <span className="font-semibold">{upsellData.breakevenTransactions}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Monthly premium cost:</span>
              <span className="font-semibold">${upsellData.monthlyPremiumCost.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      )}
      <CardFooter className={getSizeClasses()}>
        <Button asChild className="w-full" size={size === 'small' ? 'sm' : 'default'}>
          <Link href="/subscribe">
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
