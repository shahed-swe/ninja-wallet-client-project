import { FC } from "react";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InstantTransferBadge } from "@/components/ui/instant-transfer-badge";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const RecentTransactions: FC<RecentTransactionsProps> = ({ transactions, isLoading }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <i className="ri-arrow-up-line text-red-500"></i>;
      case "receive":
        return <i className="ri-arrow-down-line text-green-500"></i>;
      case "trade":
        return <i className="ri-stock-line text-blue-500"></i>;
      default:
        return <i className="ri-exchange-line text-gray-500"></i>;
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case "send":
        return "bg-red-500/20";
      case "receive":
        return "bg-green-500/20";
      case "trade":
        return "bg-blue-500/20";
      default:
        return "bg-gray-500/20";
    }
  };

  const getTransactionLabel = (transaction: Transaction) => {
    switch (transaction.type) {
      case "send":
        return `Sent to ${transaction.recipient}`;
      case "receive":
        return `Received from ${transaction.sender}`;
      case "trade":
        return transaction.note || "Trade";
      default:
        return "Transaction";
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const prefix = transaction.type === "send" ? "-" : "+";
    return `${prefix}$${transaction.amount.toFixed(2)}`;
  };

  const getTransactionAmountClass = (type: string) => {
    return type === "send" ? "text-red-500" : "text-green-500";
  };

  const getTimeLabel = (date: Date) => {
    const today = new Date();
    const transactionDate = new Date(date);
    
    if (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    ) {
      return `Today, ${format(transactionDate, 'h:mm a')}`;
    } else if (
      transactionDate.getDate() === today.getDate() - 1 &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    ) {
      return `Yesterday, ${format(transactionDate, 'h:mm a')}`;
    } else {
      return format(transactionDate, 'MMM d, h:mm a');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
          <Button variant="link" className="text-sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-20 mb-1 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center">
                  <div className={`rounded-full ${getTransactionBg(transaction.type)} p-2 mr-3`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{getTransactionLabel(transaction)}</p>
                      <InstantTransferBadge isInstantTransfer={transaction.isInstantTransfer || false} />
                    </div>
                    <p className="text-muted-foreground text-sm">{getTimeLabel(new Date(transaction.createdAt))}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getTransactionAmountClass(transaction.type)}`}>
                    {getTransactionAmount(transaction)}
                  </p>
                  <p className="text-xs text-muted-foreground">Fee: ${transaction.fee?.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
