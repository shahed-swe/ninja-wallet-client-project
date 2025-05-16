import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { OWNER_ID } from "./config";

// Bitcoin and cryptocurrency rates
const cryptoUsdRates = {
  BTC: 37500,
  ETH: 1900,
  USDT: 1,
  USDC: 1
};

export function registerCryptoEndpoints(app: Express, requireAuth: any, asyncHandler: any) {
  // Bitcoin and cryptocurrency buying endpoint - using wallet balance
  app.post("/api/crypto/buy", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { amount, cryptoType, isInstantTransfer = false } = req.body;
      
      // Basic validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      if (!cryptoType) {
        return res.status(400).json({ message: "Cryptocurrency type is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const cryptoRate = cryptoUsdRates[cryptoType as keyof typeof cryptoUsdRates] || 1000; // Fallback value
      const cryptoAmount = amount / cryptoRate; // Convert USD to crypto amount
      
      // Calculate fees
      const feeRate = user.isPremium ? 0.10 : 0.15; // 10% for premium, 15% for standard
      const baseFee = amount * feeRate;
      
      const instantFeeRate = user.isPremium ? 0.01 : 0.02; // 1% for premium, 2% for standard
      const instantFee = isInstantTransfer ? amount * instantFeeRate : 0;
      
      const totalFee = baseFee + instantFee;
      const totalCost = amount + totalFee;
      
      // Check if user has enough balance
      if (user.balance < totalCost) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // CRITICAL: Ensure all crypto purchase fees go to the owner
      if (userId !== OWNER_ID) {
        // Update owner's balance with the fee
        await storage.updateUserBalance(OWNER_ID, totalFee);
        console.log(`Credited owner account with ${totalFee} from crypto purchase fee`);
      } else {
        console.log("Owner account purchase - fees retained in balance");
      }
      
      // Get user's wallets
      const userWallets = await storage.getCryptoWalletsByUserId(userId);
      
      // Check if user has a wallet for this crypto type, if not create one
      let userWallet = userWallets
        .find(w => w.cryptoType === cryptoType && !w.isExternal);
        
      if (!userWallet) {
        // Create a new wallet for the user
        const walletAddress = cryptoType === 'BTC' 
          ? `btc${Math.random().toString(36).substring(2, 10)}${userId}`
          : `${cryptoType.toLowerCase()}${Math.random().toString(36).substring(2, 10)}${userId}`;
          
        userWallet = await storage.createCryptoWallet({
          userId,
          walletAddress,
          cryptoType,
          balance: 0,
          isExternal: false,
          publicKey: null,
          privateKey: null,
          platformName: null
        });
      }
      
      // Create crypto transaction
      const cryptoTransaction = await storage.createCryptoTransaction({
        userId,
        walletId: userWallet.id,
        cryptoType,
        amount: cryptoAmount,
        usdAmount: amount,
        txHash: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        type: 'purchase',
        status: isInstantTransfer ? 'completed' : 'pending',
        recipientAddress: userWallet.walletAddress,
        senderAddress: 'exchange',
        fee: 0,
        platformName: 'Ninja Wallet',
        isCardPurchase: false,
        cardId: null
      });
      
      // Update user's wallet balance
      await storage.updateCryptoWalletBalance(userWallet.id, cryptoAmount);
      
      // Create transaction record for the purchase and fees
      await storage.createTransaction({
        userId,
        type: 'crypto_purchase',
        amount: amount,
        fee: totalFee,
        recipient: 'Crypto Purchase',
        sender: 'Ninja Wallet',
        note: `${cryptoType} purchase - ${cryptoAmount.toFixed(8)} ${cryptoType}`,
        status: 'completed',
        isInstantTransfer
      });
      
      // Create separate transaction for the fee (for tracking)
      if (totalFee > 0 && userId !== OWNER_ID) {
        await storage.createTransaction({
          userId: OWNER_ID,
          type: 'crypto_fee',
          amount: totalFee,
          fee: 0,
          recipient: 'Jbaker00988',
          sender: user.username,
          note: `Crypto ${cryptoType} purchase fee`,
          status: 'completed',
          isInstantTransfer: false
        });
      }
      
      // Deduct the total cost from user's balance
      await storage.updateUserBalance(userId, -totalCost);
      
      // Return the transaction details
      res.status(201).json({
        success: true,
        transaction: cryptoTransaction,
        wallet: userWallet,
        purchaseDetails: {
          usdAmount: amount,
          cryptoAmount,
          fee: totalFee,
          totalCost,
          cryptoType
        }
      });
    } catch (error) {
      console.error("Error processing crypto purchase:", error);
      res.status(500).json({ message: "Error processing cryptocurrency purchase" });
    }
  }));
  
  // Endpoint for buying crypto with a virtual card
  app.post("/api/crypto/buy-with-card", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { cardId, amount, cryptoType, isInstantTransfer = false } = req.body;
      
      // Basic validation
      if (!cardId) {
        return res.status(400).json({ message: "Card ID is required" });
      }
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      if (!cryptoType) {
        return res.status(400).json({ message: "Crypto type is required" });
      }
      
      const card = await storage.getVirtualCardById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      if (card.userId !== userId) {
        return res.status(403).json({ message: "Card belongs to another user" });
      }
      
      // Get current USD value for the crypto
      const cryptoRate = cryptoUsdRates[cryptoType as keyof typeof cryptoUsdRates] || 1000; 
      const cryptoAmount = amount / cryptoRate; // Convert USD to crypto amount
      
      // Calculate fees including card processing fee
      const user = await storage.getUser(userId);
      const feeRate = user?.isPremium ? 0.10 : 0.15; // 10% for premium, 15% for standard
      const baseFee = amount * feeRate;
      
      const instantFeeRate = user?.isPremium ? 0.01 : 0.02; // 1% for premium, 2% for standard
      const instantFee = isInstantTransfer ? amount * instantFeeRate : 0;
      
      const cardFee = amount * 0.03; // 3% card processing fee
      
      const totalFee = baseFee + instantFee + cardFee;
      const totalCost = amount + totalFee;
      
      // CRITICAL: Ensure all fees go to the owner
      if (userId !== OWNER_ID) {
        await storage.updateUserBalance(OWNER_ID, totalFee);
      }
      
      // Find or create a wallet for this crypto type
      const userWallets = await storage.getCryptoWalletsByUserId(userId);
      let userWallet = userWallets
        .find(w => w.cryptoType === cryptoType && !w.isExternal);
        
      if (!userWallet) {
        const walletAddress = cryptoType === 'BTC' 
          ? `btc${Math.random().toString(36).substring(2, 10)}${userId}`
          : `${cryptoType.toLowerCase()}${Math.random().toString(36).substring(2, 10)}${userId}`;
          
        userWallet = await storage.createCryptoWallet({
          userId,
          walletAddress,
          cryptoType,
          balance: 0,
          isExternal: false,
          publicKey: null,
          privateKey: null,
          platformName: null
        });
      }
      
      // Create card transaction
      await storage.createCardTransaction({
        userId,
        cardId,
        amount: totalCost,
        merchantName: `Crypto ${cryptoType} Purchase`,
        merchantCategory: 'crypto',
        status: 'completed',
        isInstantTransfer
      });
      
      // Create crypto transaction
      const cryptoTransaction = await storage.createCryptoTransaction({
        userId,
        walletId: userWallet.id,
        cryptoType,
        amount: cryptoAmount,
        usdAmount: amount,
        txHash: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        type: 'purchase',
        status: 'completed',
        recipientAddress: userWallet.walletAddress,
        senderAddress: 'card',
        fee: totalFee,
        platformName: 'Ninja Wallet',
        isCardPurchase: true,
        cardId
      });
      
      // Update wallet balance
      await storage.updateCryptoWalletBalance(userWallet.id, cryptoAmount);
      
      // Create fee transaction for owner
      if (totalFee > 0 && userId !== OWNER_ID) {
        await storage.createTransaction({
          userId: OWNER_ID,
          type: 'crypto_fee',
          amount: totalFee,
          fee: 0,
          recipient: 'Jbaker00988',
          sender: user?.username || `User #${userId}`,
          note: `Crypto ${cryptoType} card purchase fee`,
          status: 'completed',
          isInstantTransfer: false
        });
      }
      
      res.status(201).json({
        success: true,
        transaction: cryptoTransaction,
        wallet: userWallet,
        purchaseDetails: {
          usdAmount: amount,
          cryptoAmount,
          fee: totalFee,
          totalCost,
          cryptoType
        }
      });
    } catch (error) {
      console.error("Error processing crypto card purchase:", error);
      res.status(500).json({ message: "Error processing cryptocurrency purchase with card" });
    }
  }));
  
  // Endpoint for selling cryptocurrency
  app.post("/api/crypto/sell", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const { amount, walletId, isInstantTransfer = false } = req.body;
      
      // Basic validation
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      if (!walletId) {
        return res.status(400).json({ message: "Wallet ID is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the wallet
      const wallet = await storage.getCryptoWalletById(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Check if wallet has enough crypto balance
      if (wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient cryptocurrency balance" });
      }
      
      const cryptoRate = cryptoUsdRates[wallet.cryptoType as keyof typeof cryptoUsdRates] || 1000;
      const usdAmount = amount * cryptoRate; // Convert crypto to USD
      
      // Calculate fees
      const feeRate = user.isPremium ? 0.10 : 0.15; // 10% for premium, 15% for standard
      const baseFee = usdAmount * feeRate;
      
      const instantFeeRate = user.isPremium ? 0.01 : 0.02; // 1% for premium, 2% for standard
      const instantFee = isInstantTransfer ? usdAmount * instantFeeRate : 0;
      
      const totalFee = baseFee + instantFee;
      const netUsdAmount = usdAmount - totalFee;
      
      // CRITICAL: Ensure all crypto sale fees go to the owner
      if (userId !== OWNER_ID) {
        // Update owner's balance with the fee
        await storage.updateUserBalance(OWNER_ID, totalFee);
        console.log(`Credited owner account with ${totalFee} from crypto sale fee`);
      } else {
        console.log("Owner account sale - fees retained in balance");
      }
      
      // Create crypto transaction
      const cryptoTransaction = await storage.createCryptoTransaction({
        userId,
        walletId: wallet.id,
        cryptoType: wallet.cryptoType,
        amount: -amount, // Negative amount for selling
        usdAmount,
        txHash: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        type: 'sale',
        status: isInstantTransfer ? 'completed' : 'pending',
        senderAddress: wallet.walletAddress,
        recipientAddress: 'exchange',
        fee: 0,
        platformName: 'Ninja Wallet',
        isCardPurchase: false,
        cardId: null
      });
      
      // Update wallet balance (deduct the sold amount)
      await storage.updateCryptoWalletBalance(wallet.id, -amount);
      
      // Create transaction record for the sale and fees
      await storage.createTransaction({
        userId,
        type: 'crypto_sale',
        amount: netUsdAmount,
        fee: totalFee,
        recipient: user.username,
        sender: 'Crypto Sale',
        note: `${wallet.cryptoType} sale - ${amount.toFixed(8)} ${wallet.cryptoType}`,
        status: 'completed',
        isInstantTransfer
      });
      
      // Create separate transaction for the fee (for tracking)
      if (totalFee > 0 && userId !== OWNER_ID) {
        await storage.createTransaction({
          userId: OWNER_ID,
          type: 'crypto_fee',
          amount: totalFee,
          fee: 0,
          recipient: 'Jbaker00988',
          sender: user.username,
          note: `Crypto ${wallet.cryptoType} sale fee`,
          status: 'completed',
          isInstantTransfer: false
        });
      }
      
      // Add the net USD amount to user's balance
      await storage.updateUserBalance(userId, netUsdAmount);
      
      // Return the transaction details
      res.status(201).json({
        success: true,
        transaction: cryptoTransaction,
        wallet,
        saleDetails: {
          cryptoAmount: amount,
          usdAmount,
          fee: totalFee,
          netUsdAmount,
          cryptoType: wallet.cryptoType
        }
      });
    } catch (error) {
      console.error("Error processing crypto sale:", error);
      res.status(500).json({ message: "Error processing cryptocurrency sale" });
    }
  }));
}