import { FC } from "react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onLinkAccount: () => void;
  onSendMoney: () => void;
  onInvest: () => void;
  onLearn?: () => void;
  onExternalTransfer?: () => void;
  onInstantTransfer?: () => void;
  onTapToPay?: () => void;
}

const QuickActions: FC<QuickActionsProps> = ({ 
  onLinkAccount, 
  onSendMoney, 
  onInvest,
  onLearn,
  onExternalTransfer,
  onInstantTransfer,
  onTapToPay
}) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
      <Button
        variant="outline"
        className="bg-secondary/5 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm h-auto"
        onClick={onLinkAccount}
      >
        <div className="rounded-full bg-primary/20 p-3 mb-2">
          <i className="ri-link text-xl text-primary"></i>
        </div>
        <span className="text-sm">Link Account</span>
      </Button>
      
      <Button
        variant="outline"
        className="bg-secondary/5 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm h-auto"
        onClick={onSendMoney}
      >
        <div className="rounded-full bg-secondary/20 p-3 mb-2">
          <i className="ri-send-plane-fill text-xl text-secondary"></i>
        </div>
        <span className="text-sm">Send Money</span>
      </Button>
      
      <Button
        variant="outline"
        className="bg-secondary/5 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm h-auto"
        onClick={onInstantTransfer}
      >
        <div className="rounded-full bg-amber-500/20 p-3 mb-2">
          <i className="ri-flashlight-line text-xl text-amber-500"></i>
        </div>
        <span className="text-sm">Instant</span>
      </Button>
      
      <Button
        variant="outline"
        className="bg-secondary/5 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm h-auto"
        onClick={onTapToPay}
      >
        <div className="rounded-full bg-blue-500/20 p-3 mb-2">
          <i className="ri-contactless-line text-xl text-blue-500"></i>
        </div>
        <span className="text-sm">Tap to Pay</span>
      </Button>
      
      <Button
        variant="outline"
        className="bg-secondary/5 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm h-auto"
        onClick={onInvest}
      >
        <div className="rounded-full bg-[#7209B7]/20 p-3 mb-2">
          <i className="ri-stock-line text-xl text-[#7209B7]"></i>
        </div>
        <span className="text-sm">Invest</span>
      </Button>

      <Button
        variant="outline"
        className="bg-secondary/5 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm h-auto"
        onClick={onLearn}
      >
        <div className="rounded-full bg-green-600/20 p-3 mb-2">
          <i className="ri-book-open-line text-xl text-green-600"></i>
        </div>
        <span className="text-sm">Learn</span>
      </Button>
    </div>
  );
};

export default QuickActions;
