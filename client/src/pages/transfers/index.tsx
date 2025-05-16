import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Globe, MoveRight, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import VenmoLogo from '../../components/venmo-logo';

export default function TransfersIndexPage() {
  const [, setLocation] = useLocation();
  
  // Get user data to check balance
  const { data: user } = useQuery<{
    id: number;
    username: string;
    email: string;
    balance: number;
    isPremium: boolean;
  }>({
    queryKey: ['/api/auth/session'],
  });

  const transferOptions = [
    {
      id: 'instant',
      title: 'Instant Transfer',
      description: 'Send money instantly to other Ninja Wallet users',
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      path: '/dashboard/instant-transfer',
      primaryColor: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      id: 'venmo',
      title: 'Venmo Transfer',
      description: 'Send money to a Venmo account',
      icon: <VenmoLogo className="h-6 w-6" />,
      path: '/transfers/venmo-transfer',
      primaryColor: 'bg-[#008CFF]',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'external',
      title: 'External Transfer',
      description: 'Send money to PayPal, Cash App and more',
      icon: <MoveRight className="h-6 w-6 text-indigo-500" />,
      path: '/transfers/external-transfer',
      primaryColor: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      id: 'international',
      title: 'International Transfer',
      description: 'Send money internationally with competitive rates',
      icon: <Globe className="h-6 w-6 text-green-600" />,
      path: '/dashboard/international-transfer',
      primaryColor: 'bg-green-600',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Balance: <span className="font-medium">${user?.balance?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Money Transfers</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {transferOptions.map((option) => (
          <Card 
            key={option.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setLocation(option.path)}
          >
            <CardHeader className={`${option.lightColor} border-b ${option.borderColor}`}>
              <CardTitle className="flex items-center">
                {option.icon}
                <span className="ml-2">{option.title}</span>
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between pt-6">
              <span className="text-sm text-muted-foreground">
                {option.id === 'instant' ? 
                  'Fees: 1-2% for instant' : 
                  option.id === 'international' ? 
                  'Competitive exchange rates' : 
                  'Regular transfer fees apply'}
              </span>
              <Button variant="ghost" size="sm" className="gap-1">
                Select <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {!user?.isPremium && (
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Upgrade to Ninja Premium</CardTitle>
            <CardDescription className="text-purple-700">Save up to 46% on all transfer fees and get exclusive benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                  <Zap className="h-3.5 w-3.5 text-purple-700" />
                </div>
                <span className="text-sm text-purple-900">Only 8% fee on all transfers (instead of 10-15%)</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                  <Zap className="h-3.5 w-3.5 text-purple-700" />
                </div>
                <span className="text-sm text-purple-900">Only 1% for instant transfers (instead of 2%)</span>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-100 rounded-full p-1 mr-2 mt-0.5">
                  <Zap className="h-3.5 w-3.5 text-purple-700" />
                </div>
                <span className="text-sm text-purple-900">Lower currency exchange markup (1.5% vs 3%)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-purple-700 hover:bg-purple-800"
              onClick={() => setLocation('/billing/premium')}
            >
              Upgrade Now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}