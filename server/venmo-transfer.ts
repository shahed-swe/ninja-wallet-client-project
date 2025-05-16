/**
 * Venmo Transfer Service
 * Handles direct transfers to Venmo accounts from Ninja Wallet
 * 
 * IMPORTANT: This service facilitates REAL money transfers to external Venmo accounts
 * and is NOT a simulation. It uses Venmo's deep linking capabilities to initiate actual
 * transfers from the user's Venmo account.
 */

export interface VenmoTransferRequest {
  accountId: string; // Venmo username/email/phone
  amount: number;    // Amount to transfer (in USD)
  note?: string;     // Optional transfer note
  fromUser?: string; // Sender username
}

/**
 * Payment options interface for external payment services
 */
export interface PaymentOptions {
  webUrl: string;            // URL for web access to the payment service
  webDirectUrl?: string;     // Direct payment URL
  mobileDeepLink: string;    // Deep link for mobile app
  alternateMobileLinks?: Record<string, string>; // Additional deep link formats
  venmoUsername: string;     // Username or account ID
  formattedAmount: string;   // Amount with currency symbol
  formattedNote: string;     // Formatted note
  paymentInstructions: string; // Human-readable instructions
  phoneLink?: string;        // Direct phone number link if applicable
}

export interface VenmoTransferResult {
  success: boolean;
  message: string;
  transactionId?: string;
  transferUrl?: string;
  paymentOptions?: PaymentOptions;
}

/**
 * Simplified Venmo transfer service for handling transfers
 * without requiring Venmo API authentication
 */
export class VenmoTransferService {
  
  /**
   * Create a Venmo transfer URL that will open the Venmo app
   * with pre-filled information to complete the transfer
   */
  static generateTransferUrl(request: VenmoTransferRequest): string {
    const { accountId, amount, note, fromUser } = request;
    
    // Format amount as string with 2 decimal places
    const amountStr = amount.toFixed(2);
    
    // Create a detailed note that includes the sender if available
    const fullNote = note || (fromUser ? `Transfer from ${fromUser} via Ninja Wallet` : 'Transfer from Ninja Wallet');
    const encodedNote = encodeURIComponent(fullNote);
    
    // Clean the accountId - could be username, email, or phone number
    let cleanedId = accountId;
    
    // Remove @ from username if present
    if (cleanedId.startsWith('@')) {
      cleanedId = cleanedId.substring(1);
    }
    
    // Generate Venmo app deeplink based on platform detection
    // This format works for most modern devices
    return `venmo://paycharge?txn=pay&recipients=${cleanedId}&amount=${amountStr}&note=${encodedNote}`;
  }
  
  /**
   * Generate alternative payment methods
   */
  static generateAlternativePaymentOptions(request: VenmoTransferRequest) {
    const { accountId, amount, note, fromUser } = request;
    const amountStr = amount.toFixed(2);
    const fullNote = note || (fromUser ? `Transfer from ${fromUser} via Ninja Wallet` : 'Transfer from Ninja Wallet');
    const encodedNote = encodeURIComponent(fullNote);
    
    // Clean the recipient ID
    let cleanedId = accountId;
    if (cleanedId.startsWith('@')) {
      cleanedId = cleanedId.substring(1);
    }
    
    // Handle different types of IDs (username, email, phone)
    const isPhoneNumber = /^\d{10,}$/.test(cleanedId.replace(/\D/g, ''));
    const isEmail = cleanedId.includes('@') && cleanedId.includes('.');
    
    // Create multiple deep link formats to ensure at least one works
    const mobileDeepLinks: Record<string, string> = {
      primary: `venmo://paycharge?txn=pay&recipients=${cleanedId}&amount=${amountStr}&note=${encodedNote}`,
      alternative: `venmo://payments?txn=pay&recipients=${cleanedId}&amount=${amountStr}&note=${encodedNote}`,
      legacy: `venmo://transfer?target=${cleanedId}&amount=${amountStr}&note=${encodedNote}`
    };
    
    // Add phone-specific links if it appears to be a phone number
    if (isPhoneNumber) {
      const digits = cleanedId.replace(/\D/g, '');
      // Format for standard US number (assumes US for this app)
      const formattedPhone = digits.length === 10 ? 
          `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}` : 
          cleanedId;
          
      mobileDeepLinks.phone = `venmo://users/phone/${digits}`;
      mobileDeepLinks.phoneAlt = `venmo://paycharge?txn=pay&recipients=${digits}&amount=${amountStr}&note=${encodedNote}`;
    }
    
    // Create multiple web access methods
    const webUrls: Record<string, string> = {
      profile: `https://venmo.com/${encodeURIComponent(cleanedId)}`,
      directSend: `https://account.venmo.com/u/${encodeURIComponent(cleanedId)}`
    };
    
    // Create email or phone specific web URLs if detected
    if (isEmail) {
      webUrls.email = `https://account.venmo.com/pay?email=${encodeURIComponent(cleanedId)}`;
    } else if (isPhoneNumber) {
      const digits = cleanedId.replace(/\D/g, '');
      webUrls.phone = `https://account.venmo.com/pay?phone=${digits}`;
    }
    
    // Determine the right type of link for the payment instructions
    let paymentTarget = cleanedId;
    if (accountId.startsWith('@')) {
      paymentTarget = accountId; // Keep the @ for instruction display
    } else if (isPhoneNumber) {
      const digits = cleanedId.replace(/\D/g, '');
      if (digits.length === 10) {
        paymentTarget = `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
      }
    }
    
    const result: PaymentOptions = {
      webUrl: webUrls.profile,
      webDirectUrl: webUrls.directSend,
      mobileDeepLink: mobileDeepLinks.primary,
      alternateMobileLinks: mobileDeepLinks,
      venmoUsername: cleanedId,
      formattedAmount: `$${amountStr}`,
      formattedNote: fullNote,
      paymentInstructions: `Send $${amountStr} to ${paymentTarget} with note: "${fullNote}"`
    };
    
    // Add phone link if relevant
    if (isPhoneNumber) {
      const digits = cleanedId.replace(/\D/g, '');
      result.phoneLink = `tel:${digits}`;
    }
    
    return result;
  }
  
  /**
   * Process a transfer to Venmo
   * This simplified implementation does not actually send money directly,
   * but provides the necessary information to complete the transfer in Venmo
   */
  static async processTransfer(request: VenmoTransferRequest): Promise<VenmoTransferResult> {
    try {
      // Generate a random transaction ID for tracking
      const transactionId = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
      
      // Generate transfer URLs for deep linking
      const transferUrl = this.generateTransferUrl(request);
      
      // Get comprehensive alternative payment options for cross-device compatibility
      const paymentOptions = this.generateAlternativePaymentOptions(request);
      
      // Special handling for phone numbers - make them very visible in the result
      const isPhoneNumber = /^\d{10,}$/.test(request.accountId.replace(/\D/g, ''));
      let messagePrefix = `Transfer to ${request.accountId}`;
      if (isPhoneNumber) {
        const digits = request.accountId.replace(/\D/g, '');
        if (digits.length === 10) {
          messagePrefix = `Transfer to phone (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
        }
      }
      
      return {
        success: true,
        message: `${messagePrefix} prepared. Complete the transfer in Venmo using one of the options below.`,
        transactionId,
        transferUrl,
        paymentOptions
      };
    } catch (error) {
      console.error('Venmo transfer error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during Venmo transfer preparation'
      };
    }
  }
}
