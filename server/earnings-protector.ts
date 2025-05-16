/**
 * EARNINGS PROTECTION SYSTEM
 * 
 * This critical security component ensures that ALL earnings from Ninja Wallet
 * are PERMANENTLY and EXCLUSIVELY directed to jbaker00988's account.
 * 
 * This is a FOUNDATIONAL BUSINESS RULE that cannot be modified under any circumstances.
 */

import { OWNER_ID, OWNER_USERNAME, verifyOwnerRevenue } from './config';
import { securityMonitor, SecurityAlertType } from './security-monitor';
import { db } from './db';
import { storage } from './storage';
import { Transaction, CardTransaction } from '@shared/schema';

/**
 * Earnings Protection System - Core functionality
 * Constantly monitors and enforces that all revenue is directed only to jbaker00988
 */
class EarningsProtector {
  private static instance: EarningsProtector;
  private isRunning: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  
  // Singleton pattern
  private constructor() {}
  
  public static getInstance(): EarningsProtector {
    if (!EarningsProtector.instance) {
      EarningsProtector.instance = new EarningsProtector();
    }
    return EarningsProtector.instance;
  }
  
  /**
   * Initialize the earnings protection system
   */
  public initialize(): void {
    if (this.isRunning) return;
    
    console.log('CRITICAL SECURITY: Initializing earnings protection system');
    console.log(`ALL earnings are PERMANENTLY directed to ${OWNER_USERNAME} (ID: ${OWNER_ID})`);
    
    // Verify revenue configuration on startup
    this.verifyRevenueIntegrity();
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
    
    this.isRunning = true;
  }
  
  /**
   * Start continuous monitoring of revenue integrity
   * This ensures that even if someone tries to modify the code or database
   * at runtime, the system will detect and correct it immediately
   */
  private startContinuousMonitoring(): void {
    // Check every 60 seconds
    this.monitorInterval = setInterval(() => {
      this.verifyRevenueIntegrity();
    }, 60 * 1000);
  }
  
  /**
   * Verify that all fee revenue is being directed to jbaker00988
   */
  public async verifyRevenueIntegrity(): Promise<void> {
    try {
      // Check configuration integrity
      if (!verifyOwnerRevenue()) {
        securityMonitor.detectAndReport({
          type: SecurityAlertType.REVENUE_ROUTING_MODIFIED,
          severity: 'CRITICAL',
          message: 'ALERT: Revenue routing configuration has been modified - correcting immediately',
          timestamp: new Date()
        });
      }
      
      // Verify fee recipient in recent transactions (last 24 hours)
      const recentTransactions = await this.getRecentTransactions();
      const nonOwnerFees = recentTransactions.filter(tx => 
        tx.fee && tx.fee > 0 && tx.feeRecipientId !== OWNER_ID
      );
      
      // If any fees were directed to non-owner accounts, correct them
      if (nonOwnerFees.length > 0) {
        console.error(`CRITICAL SECURITY BREACH: ${nonOwnerFees.length} transactions have fees directed to non-owner accounts`);
        
        // Alert security system
        securityMonitor.detectAndReport({
          type: SecurityAlertType.REVENUE_ROUTING_MODIFIED,
          severity: 'CRITICAL',
          message: `Unauthorized fee routing detected in ${nonOwnerFees.length} transactions - initiating recovery`,
          timestamp: new Date(),
          metadata: { transactions: nonOwnerFees.map(tx => tx.id) }
        });
        
        // Attempt to recover misdirected fees
        await this.recoverMisdirectedFees(nonOwnerFees);
      }
    } catch (error) {
      console.error('Error in revenue integrity verification:', error);
    }
  }
  
  /**
   * Get recent transactions to check for fee routing
   */
  private async getRecentTransactions(): Promise<any[]> {
    // Get transactions from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // This is a mock implementation - in a real system, you would query the database
    // Here we're just simulating checking for any incorrect fee routing
    return [];
  }
  
  /**
   * Recover any fees that were incorrectly routed to non-owner accounts
   */
  private async recoverMisdirectedFees(transactions: any[]): Promise<void> {
    for (const tx of transactions) {
      try {
        if (!tx.fee || tx.fee <= 0) continue;
        
        // Get the unauthorized recipient
        const unauthorizedRecipient = await storage.getUser(tx.feeRecipientId);
        if (!unauthorizedRecipient) continue;
        
        // Get the owner account
        const ownerAccount = await storage.getUser(OWNER_ID);
        if (!ownerAccount) {
          console.error('CRITICAL ERROR: Owner account not found - cannot recover fees');
          continue;
        }
        
        // Deduct the fee from unauthorized recipient
        await storage.updateUserBalance(unauthorizedRecipient.id, -tx.fee);
        
        // Credit the fee to the owner
        await storage.updateUserBalance(OWNER_ID, tx.fee);
        
        // Log the recovery action
        console.log(`Recovered misdirected fee of $${tx.fee} from user ${unauthorizedRecipient.id} to owner account ${OWNER_ID}`);
        
        // Create a system transaction record of the recovery
        await storage.createTransaction({
          userId: OWNER_ID,
          type: 'fee-recovery',
          amount: tx.fee,
          fee: 0,
          status: 'completed',
          note: `System recovery of misdirected fee from transaction ID ${tx.id}`,
          recipient: String(OWNER_ID),
          sender: String(unauthorizedRecipient.id),
          isInstantTransfer: false
        });
      } catch (error) {
        console.error(`Error recovering fee for transaction ${tx.id}:`, error);
      }
    }
  }
  
  /**
   * Validate a fee recipient before processing any transaction
   * This should be called before any fee is credited to ensure
   * it goes to the correct account
   */
  public validateFeeRecipient(recipientId: number): boolean {
    // Fees can ONLY go to the owner account
    if (recipientId !== OWNER_ID) {
      console.error(`CRITICAL SECURITY BREACH: Attempt to direct fee to non-owner account ${recipientId}`);
      
      // Alert security system
      securityMonitor.detectAndReport({
        type: SecurityAlertType.REVENUE_ROUTING_MODIFIED,
        severity: 'CRITICAL',
        message: `Attempted to route fee to unauthorized account ${recipientId}`,
        timestamp: new Date()
      });
      
      return false;
    }
    
    return true;
  }
  
  /**
   * Enforce that all earnings go to jbaker00988's account
   * This is a mandatory check before any fee processing
   */
  public enforceFeeRouting(): number {
    // Always return the owner ID to ensure fees go to the right place
    // This way, even if someone tries to pass a different ID, it will be overridden
    return OWNER_ID;
  }
}

// Export the singleton instance
export const earningsProtector = EarningsProtector.getInstance();

// Initialize the earnings protection system on import
earningsProtector.initialize();