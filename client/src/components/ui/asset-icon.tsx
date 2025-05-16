import { FC } from "react";

type AssetIconProps = {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const AssetIcon: FC<AssetIconProps> = ({ symbol, size = "md", className = "" }) => {
  // Define icon colors and background colors for each asset
  const assetConfig: Record<string, { bg: string; text: string; icon?: string }> = {
    BTC: { bg: "bg-[#F7931A]", text: "text-white", icon: "₿" },
    ETH: { bg: "bg-[#627EEA]", text: "text-white", icon: "Ξ" },
    AAPL: { bg: "bg-[#000000]", text: "text-white" },
    GOOG: { bg: "bg-[#5F6368]", text: "text-white" },
    TECH: { bg: "bg-[#0066B2]", text: "text-white" },
    // Add more assets as needed
  };

  // Default config if asset not found
  const config = assetConfig[symbol] || { bg: "bg-gray-500", text: "text-white" };
  
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full ${config.bg} flex items-center justify-center ${className}`}
    >
      {config.icon ? (
        <span className={`font-bold ${config.text}`}>{config.icon}</span>
      ) : (
        <span className={`font-bold ${config.text}`}>{symbol}</span>
      )}
    </div>
  );
};

export default AssetIcon;
