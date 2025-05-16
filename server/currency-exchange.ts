/**
 * Currency Exchange Service
 * Handles international transfers with markup fees
 */

// Map of currencies to USD exchange rates
const exchangeRates: Record<string, number> = {
  USD: 1.0,     // Base currency
  EUR: 0.93,    // Euro
  GBP: 0.79,    // British Pound
  JPY: 151.73,  // Japanese Yen
  CAD: 1.37,    // Canadian Dollar
  AUD: 1.54,    // Australian Dollar
  CNY: 7.24,    // Chinese Yuan
  INR: 83.49,   // Indian Rupee
  BRL: 5.14,    // Brazilian Real
  MXN: 17.04,   // Mexican Peso
};

export interface CurrencyExchangeRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  isPremiumUser: boolean;
}

export interface CurrencyExchangeResult {
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  appliedRate: number; // Rate after markup
  fee: number;
  markupPercentage: number;
}

export class CurrencyExchange {
  // Standard markup on exchange rate is 3%
  private static STANDARD_MARKUP = 0.03;
  // Premium users get a reduced markup of 1.5%
  private static PREMIUM_MARKUP = 0.015;

  /**
   * Convert an amount from one currency to another with a markup fee
   * @param request Exchange request parameters
   * @returns Exchange result with fee details
   */
  static convertCurrency(request: CurrencyExchangeRequest): CurrencyExchangeResult {
    const { fromCurrency, toCurrency, amount, isPremiumUser } = request;
    
    // Get the base exchange rates
    const fromRate = exchangeRates[fromCurrency.toUpperCase()] || 1;
    const toRate = exchangeRates[toCurrency.toUpperCase()] || 1;
    
    // Calculate the standard exchange rate (without markup)
    const standardRate = toRate / fromRate;
    
    // Apply the appropriate markup based on user status
    const markup = isPremiumUser ? this.PREMIUM_MARKUP : this.STANDARD_MARKUP;
    const markupMultiplier = 1 - markup; // Reduce the rate by the markup percentage
    
    // Calculate the applied rate after markup
    const appliedRate = standardRate * markupMultiplier;
    
    // Calculate converted amount and fee
    const convertedAmount = amount * appliedRate;
    const standardAmount = amount * standardRate;
    const fee = standardAmount - convertedAmount;
    
    return {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      exchangeRate: standardRate,
      appliedRate: appliedRate,
      fee: parseFloat(fee.toFixed(2)),
      markupPercentage: markup * 100
    };
  }

  /**
   * Get available currencies and their exchange rates to USD
   * @returns Object with currency codes and their rates
   */
  static getAvailableCurrencies(): Record<string, number> {
    return { ...exchangeRates };
  }
}
