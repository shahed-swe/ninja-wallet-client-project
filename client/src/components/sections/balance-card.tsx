import { FC } from "react";
import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  balance: number;
  onSend: () => void;
  onReceive: () => void;
  onTrade: () => void;
}

const BalanceCard: FC<BalanceCardProps> = ({ balance, onSend, onReceive, onTrade }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-[#7209B7] rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex flex-col">
        <p className="text-white/80 text-sm mb-1">Available Balance</p>
        <h2 className="text-3xl font-bold text-white mb-4">${balance.toFixed(2)}</h2>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30"
            onClick={onSend}
          >
            <i className="ri-arrow-up-line mr-1"></i>
            <span>Send</span>
          </Button>
          <Button
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30"
            onClick={onReceive}
          >
            <i className="ri-add-circle-line mr-1"></i>
            <span>Add Funds</span>
          </Button>
          <Button
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30"
            onClick={onTrade}
          >
            <i className="ri-exchange-line mr-1"></i>
            <span>Trade</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
