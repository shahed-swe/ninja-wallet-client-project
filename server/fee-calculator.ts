/**
 * Fee Calculator Service
 * Implements various fee structures to maximize revenue directed to owner account
 * 
 * CRITICAL: All fees calculated by this service MUST be credited to the owner's account (jbaker00988)
 * Do not modify these fee calculations without ensuring compliance with the revenue configuration
 */

import { REVENUE_CONFIG, validateRevenueConfig, OWNER_ID } from "./config";
import { paymentEnforcer } from "./payment-enforcer";

export interface FeeOptions {
  isPremiumUser?: boolean;
  isReferralBonus?: boolean;
  isInternationalTransfer?: boolean;
  isInstantTransfer?: boolean;
  currencyExchangeRate?: number;
  investmentPackageType?: 'standard' | 'premium' | 'exclusive';
  [key: string]: any; // Allow additional properties for compatibility
}

export class FeeCalculator {
  // Base fee rates
  private static BASE_RATE = 0.13; // 13% standard fee
  private static PREMIUM_RATE = 0.08; // 8% for premium users
  private static SMALL_TRANSACTION_RATE = 0.15; // 15% for small transactions
  private static LARGE_TRANSACTION_RATE = 0.10; // 10% for large transactions
  private static REFERRAL_DISCOUNT = 0.01; // 1% discount
  
  // Instant transfer fee (additional percentage)
  static INSTANT_TRANSFER_FEE = 0.02; // Additional 2% for instant transfers
  static PREMIUM_INSTANT_TRANSFER_FEE = 0.01; // Additional 1% for premium users
  
  // Exchange markup rates
  private static EXCHANGE_MARKUP = 0.03; // 3% markup on exchange rate
  
  // External wallet fee - any card added to external wallet incurs this fee
  static EXTERNAL_WALLET_FEE = 0.10; // 10% fee for adding to external wallets like Apple Wallet/Google Pay
  
  // Investment package fees
  private static INVESTMENT_FEES = {
    standard: 0.13, // 13% fee
    premium: 0.15, // 15% fee
    exclusive: 0.20, // 20% fee
  };
  
  // NEW PASSIVE INCOME STREAMS
  
  // Staking rewards - fee from user staking activities
  static STAKING_FEE = 0.12; // 12% fee on staking rewards
  static PREMIUM_STAKING_FEE = 0.08; // 8% fee for premium users
  
  // Merchant cashback - percentage from merchant transactions
  static MERCHANT_CASHBACK_RATE = 0.025; // 2.5% cashback from merchants
  
  // Recurring subscription fee (monthly)
  static SUBSCRIPTION_BASE_FEE = 4.99; // Basic subscription
  static SUBSCRIPTION_PREMIUM_FEE = 12.99; // Premium subscription
  
  // Interest from lending pools (annual rate, calculated daily)
  static LENDING_POOL_INTEREST = 0.18; // 18% annual interest
  static LENDING_POOL_PREMIUM_INTEREST = 0.12; // 12% premium customer rate
  
  // Affiliate marketing revenue share
  static AFFILIATE_MARKETING_RATE = 0.40; // 40% of affiliate revenue
  
  // Card inactivity fee (monthly, after 6 months)
  static CARD_INACTIVITY_FEE = 5.99;
  
  // Foreign transaction fee
  static FOREIGN_TRANSACTION_FEE = 0.03; // 3% on foreign transactions
  static PREMIUM_FOREIGN_TRANSACTION_FEE = 0.015; // 1.5% for premium users
  
  /**
   * CRITICAL FUNCTION: Get the fee recipient ID
   * This function ALWAYS returns jbaker00988's account ID
   * regardless of any parameters passed
   * 
   * @returns The owner ID (always jbaker00988's ID: 1)
   */
  static getFeeRecipient(recipientId?: number): number {
    // Use the payment enforcer to guarantee the fee goes to jbaker00988
    return paymentEnforcer.enforcePaymentDestination(recipientId);
  }

  /**
   * Calculate transaction fee based on amount and options
   * @param amount Transaction amount in USD
   * @param options Fee calculation options
   * @returns Fee amount in USD
   */
  static calculateTransactionFee(amount: number, options: FeeOptions = {}): number {
    // Validate revenue configuration to ensure all fees go to owner
    if (!REVENUE_CONFIG.ROUTE_ALL_FEES_TO_OWNER) {
      console.warn("WARNING: Fee calculation attempted with incorrect revenue routing configuration");
      validateRevenueConfig();
    }
    
    let feeRate = this.BASE_RATE;
    
    // Apply tiered fee structure based on transaction amount
    if (amount < 100) {
      feeRate = this.SMALL_TRANSACTION_RATE; // 15% for small transactions
    } else if (amount > 1000) {
      feeRate = this.LARGE_TRANSACTION_RATE; // 10% for large transactions
    }
    
    // Apply premium user discount if applicable
    if (options.isPremiumUser) {
      feeRate = this.PREMIUM_RATE; // 8% for premium users
    }
    
    // Apply referral bonus if applicable
    if (options.isReferralBonus) {
      feeRate -= this.REFERRAL_DISCOUNT;
    }
    
    // Add instant transfer fee if applicable
    if (options.isInstantTransfer) {
      feeRate += options.isPremiumUser ? this.PREMIUM_INSTANT_TRANSFER_FEE : this.INSTANT_TRANSFER_FEE;
    }
    
    // Calculate and round fee to 2 decimal places
    return parseFloat((amount * feeRate).toFixed(2));
  }

  /**
   * Calculate investment fee based on amount and package type
   * @param amount Investment amount
   * @param options Fee options including investment package type
   * @returns Fee amount
   */
  static calculateInvestmentFee(amount: number, options: FeeOptions = {}): number {
    // Validate revenue configuration to ensure all investment fees go to owner
    if (!REVENUE_CONFIG.ROUTE_ALL_FEES_TO_OWNER) {
      console.warn("WARNING: Investment fee calculation attempted with incorrect revenue routing configuration");
      validateRevenueConfig();
    }
    
    const packageType = options.investmentPackageType || 'standard';
    const feeRate = this.INVESTMENT_FEES[packageType];
    
    // Apply premium user discount if applicable (except for exclusive packages)
    if (options.isPremiumUser && packageType !== 'exclusive') {
      return parseFloat((amount * (feeRate - 0.02)).toFixed(2));
    }
    
    return parseFloat((amount * feeRate).toFixed(2));
  }

  /**
   * Calculate external wallet fee
   * This applies a 10% fee when adding a card to an external wallet (Apple Wallet, Google Pay, etc.)
   * The fee is always directed to owner account (Jbaker00988)
   * 
   * @param cardBalance The balance on the card being added to external wallet
   * @param options Fee options
   * @returns The fee amount
   */
  static calculateExternalWalletFee(cardBalance: number, options: FeeOptions = {}): number {
    // Validate revenue configuration to ensure all wallet fees go to owner
    validateRevenueConfig();
    
    // External wallet fee is always 10% for non-owner users
    // Check if user is owner (no fee for owner)
    if (options.userId === OWNER_ID) {
      console.log(`OWNER ACCOUNT: No external wallet fee charged for owner (${OWNER_ID})`);
      return 0;
    }
    
    // Calculate fee (10% of card balance)
    const fee = parseFloat((cardBalance * this.EXTERNAL_WALLET_FEE).toFixed(2));
    
    // Log the fee being charged
    console.log(`External wallet fee calculated: $${fee} (10% of $${cardBalance})`);
    console.log(`Fee recipient: Jbaker00988 (${OWNER_ID})`);
    
    return fee;
  }

  /**
   * Calculate currency exchange fee
   * @param amount Amount to exchange
   * @param options Exchange options
   * @returns Object containing fee and exchange rate information
   */
  static calculateExchangeFee(amount: number, options: FeeOptions = {}): {
    fee: number;
    exchangeRate: number;
    amountAfterExchange: number;
  } {
    // Validate revenue configuration to ensure all exchange fees go to owner
    if (!REVENUE_CONFIG.ROUTE_ALL_FEES_TO_OWNER) {
      console.warn("WARNING: Exchange fee calculation attempted with incorrect revenue routing configuration");
      validateRevenueConfig();
    }
    
    const baseExchangeRate = options.currencyExchangeRate || 1;
    const markup = options.isPremiumUser ? this.EXCHANGE_MARKUP / 2 : this.EXCHANGE_MARKUP;
    
    const appliedExchangeRate = baseExchangeRate * (1 - markup);
    const amountAfterExchange = amount * appliedExchangeRate;
    const implicitFee = amount * baseExchangeRate - amountAfterExchange;
    
    return {
      fee: parseFloat(implicitFee.toFixed(2)),
      exchangeRate: appliedExchangeRate,
      amountAfterExchange: parseFloat(amountAfterExchange.toFixed(2)),
    };
  }
}
