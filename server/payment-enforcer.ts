/**
 * PAYMENT DESTINATION ENFORCER
 * 
 * This critical component enforces that ALL payments and earnings
 * default to and ONLY go to jbaker00988's account (ID: 1).
 * 
 * This is an absolute, unchangeable rule that applies system-wide.
 */

import { OWNER_ID, OWNER_USERNAME, verifyOwnerRevenue } from './config';
import { securityMonitor, SecurityAlertType } from './security-monitor';

/**
 * Enforces that all payment destinations are set to jbaker00988's account
 */
class PaymentEnforcer {
  private static instance: PaymentEnforcer;
  
  private constructor() {}
  
  public static getInstance(): PaymentEnforcer {
    if (!PaymentEnforcer.instance) {
      PaymentEnforcer.instance = new PaymentEnforcer();
    }
    return PaymentEnforcer.instance;
  }
  
  /**
   * CRITICAL FUNCTION: Override any payment recipient to ensure it's always jbaker00988
   * This guarantees that regardless of what recipient ID is passed to any payment function,
   * the ultimate destination will always be jbaker00988's account
   */
  public enforcePaymentDestination(destinationId: number | string | undefined): number {
    // No matter what ID is passed in, ALWAYS return the owner ID
    // This function MUST be called before processing ANY payment
    
    if (destinationId !== OWNER_ID && destinationId !== String(OWNER_ID)) {
      // Log the attempt to send payment elsewhere
      console.warn(`PAYMENT DESTINATION OVERRIDE: Attempted to send payment to ${destinationId}, forcibly redirected to ${OWNER_USERNAME} (ID: ${OWNER_ID})`);
      
      // Report security event
      try {
        securityMonitor.detectAndReport({
          type: SecurityAlertType.REVENUE_ROUTING_MODIFIED,
          severity: 'HIGH',
          message: `Payment destination override: ${destinationId} → ${OWNER_ID}`,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Failed to report security event:', error);
      }
    }
    
    // ALWAYS return the owner ID, regardless of input
    return OWNER_ID;
  }
  
  /**
   * Returns the default payment destination which is ALWAYS jbaker00988
   */
  public getDefaultPaymentDestination(): number {
    // The ONLY valid payment destination is jbaker00988's account
    return OWNER_ID;
  }
  
  /**
   * Validates that a payment destination is set to jbaker00988
   * Returns false if it's set to anyone else
   */
  public isValidPaymentDestination(destinationId: number | string | undefined): boolean {
    return destinationId === OWNER_ID || destinationId === String(OWNER_ID);
  }
}

// Export singleton instance
export const paymentEnforcer = PaymentEnforcer.getInstance();

// Log initialization
console.log(`PAYMENT DESTINATION ENFORCER: All payments defaulted to ${OWNER_USERNAME} (ID: ${OWNER_ID})`);
console.log('NO ALTERNATIVE PAYMENT DESTINATIONS ARE PERMITTED');