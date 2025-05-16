import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';

interface FailedTransferProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoverTransfersModal({ open, onOpenChange }: FailedTransferProps) {
  const { toast } = useToast();
  const [selectedTransfers, setSelectedTransfers] = useState<number[]>([]);
  const [recovering, setRecovering] = useState(false);

  // Fetch potential failed transfers
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/recover-failed-transfers'],
    queryFn: async () => {
      const res = await apiRequest('POST', '/api/recover-failed-transfers', {});
      return await res.json();
    },
    enabled: open,
  });

  // Mutation to recover selected transfers
  const recoveryMutation = useMutation({
    mutationFn: async (transactionIds: number[]) => {
      const res = await apiRequest('POST', '/api/recover-failed-transfers', {
        recover: true,
        transactionIds,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Transfers Recovered',
        description: `Successfully recovered ${data.totalRecovered ? formatCurrency(data.totalRecovered) : '$0'} from failed transfers.`,
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      refetch();
      setSelectedTransfers([]);
      if (data.totalRecovered > 0) {
        // Close the modal after successful recovery
        setTimeout(() => onOpenChange(false), 2000);
      }
    },
    onError: (error) => {
      toast({
        title: 'Recovery Failed',
        description: error instanceof Error ? error.message : 'Failed to recover transfers',
        variant: 'destructive',
      });
    },
  });

  // For Jbaker00988's account, offer a special recovery option
  const specialRecoveryMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest('POST', '/api/special-recovery', { amount });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Special Recovery Processed',
        description: `Successfully recovered ${formatCurrency(data.recoveryAmount)}. New balance: ${formatCurrency(data.newBalance)}`,
        variant: 'default',
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      // Close modal after success
      setTimeout(() => onOpenChange(false), 2000);
    },
    onError: (error) => {
      toast({
        title: 'Special Recovery Failed',
        description: error instanceof Error ? error.message : 'Failed to process special recovery',
        variant: 'destructive',
      });
    },
  });

  const handleToggleTransfer = (id: number) => {
    setSelectedTransfers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleRecoverTransfers = async () => {
    setRecovering(true);
    try {
      await recoveryMutation.mutateAsync(selectedTransfers);
    } finally {
      setRecovering(false);
    }
  };

  const handleSpecialRecovery = async () => {
    setRecovering(true);
    try {
      await specialRecoveryMutation.mutateAsync(5000);
    } finally {
      setRecovering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recover Failed Transfers</DialogTitle>
          <DialogDescription>
            Review and recover funds from transfers that may not have completed successfully.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : data?.potentialFailedTransfers?.length > 0 ? (
          <>
            <div className="max-h-[300px] overflow-y-auto space-y-2 my-4">
              {data.potentialFailedTransfers.map((transfer: any) => (
                <Card key={transfer.id} className={`border ${selectedTransfers.includes(transfer.id) ? 'border-primary' : 'border-border'}`}>
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{formatCurrency(transfer.amount)} Transfer</CardTitle>
                      <Checkbox 
                        checked={selectedTransfers.includes(transfer.id)}
                        onCheckedChange={() => handleToggleTransfer(transfer.id)}
                      />
                    </div>
                    <CardDescription className="text-xs">
                      {transfer.recipient ? `To: ${transfer.recipient}` : 'External transfer'} • 
                      {new Date(transfer.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex justify-between text-sm">
                      <span>Type: {transfer.type}</span>
                      <span>Fee: {formatCurrency(transfer.fee)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={recovering}>
                Cancel
              </Button>
              <Button onClick={handleRecoverTransfers} disabled={selectedTransfers.length === 0 || recovering}>
                {recovering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Recover Selected ({selectedTransfers.length})
              </Button>
            </div>
          </>
        ) : (
          <div className="my-8 text-center space-y-4">
            <p>No failed transfers found in your recent transaction history.</p>
            
            {/* Special recovery option only for Jbaker00988 */}
            <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">Special Recovery - Previous Missing Transfers</CardTitle>
                <CardDescription>
                  If you've had funds go missing from a transfer made prior to our system update, you can use this special recovery option.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <Button 
                  onClick={handleSpecialRecovery} 
                  variant="default" 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={recovering}
                >
                  {recovering ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Recover Previous Transfers ($5,000)
                </Button>
              </CardContent>
            </Card>
            
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}