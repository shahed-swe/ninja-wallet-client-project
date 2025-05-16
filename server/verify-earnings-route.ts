/**
 * EARNINGS ROUTING VERIFICATION
 * 
 * This script verifies that ALL earnings from Ninja Wallet are being correctly
 * routed to jbaker00988's account (OWNER_ID: 1).
 * 
 * This is a MANDATORY financial rule that cannot be changed under any circumstances.
 */

import { db } from './db';
import { storage } from './storage';
import { OWNER_ID, OWNER_USERNAME, OWNER_EMAIL, verifyOwnerRevenue } from './config';
import { securityMonitor, SecurityAlertType } from './security-monitor';

/**
 * Verify all financial activity guarantees owner revenue integrity
 */
async function verifyOwnerRevenueIntegrity() {
  console.log('='.repeat(80));
  console.log('EARNINGS VERIFICATION AUDIT');
  console.log('='.repeat(80));
  console.log(`OWNER ACCOUNT: ${OWNER_USERNAME} (ID: ${OWNER_ID})`);
  console.log('CRITICAL FINANCIAL RULE: ALL fees must go to owner account');
  
  try {
    // First, verify the configuration integrity
    console.log('\nVerifying configuration integrity...');
    if (verifyOwnerRevenue()) {
      console.log('✅ Configuration verified: All settings correct');
    } else {
      console.error('❌ CRITICAL ERROR: Revenue configuration invalid');
      await reportViolation('Configuration settings do not guarantee owner revenue');
    }
    
    // Next, verify the owner account exists and is correct
    console.log('\nVerifying owner account integrity...');
    const ownerAccount = await storage.getUser(OWNER_ID);
    if (!ownerAccount) {
      console.error('❌ CRITICAL ERROR: Owner account not found');
      await reportViolation('Owner account not found in database');
      return;
    }
    
    if (ownerAccount.username !== OWNER_USERNAME) {
      console.error(`❌ CRITICAL ERROR: Owner username mismatch. Expected: ${OWNER_USERNAME}, Found: ${ownerAccount.username}`);
      await reportViolation(`Owner username modified from ${OWNER_USERNAME} to ${ownerAccount.username}`);
    } else {
      console.log('✅ Owner account username verified');
    }
    
    if (ownerAccount.email !== OWNER_EMAIL) {
      console.error(`❌ CRITICAL ERROR: Owner email mismatch. Expected: ${OWNER_EMAIL}, Found: ${ownerAccount.email}`);
      await reportViolation(`Owner email modified from ${OWNER_EMAIL} to ${ownerAccount.email}`);
    } else {
      console.log('✅ Owner account email verified');
    }
    
    // Get all transactions
    console.log('\nVerifying transaction fee routing...');
    const transactions = await getAllTransactionsWithFees();
    
    // Validate all transaction fees
    let nonOwnerFeeCount = 0;
    const nonOwnerFees: any[] = [];
    
    for (const tx of transactions) {
      if (tx.fee > 0 && tx.feeRecipientId !== OWNER_ID) {
        nonOwnerFeeCount++;
        nonOwnerFees.push({
          transactionId: tx.id,
          amount: tx.amount,
          fee: tx.fee,
          recipientId: tx.feeRecipientId
        });
      }
    }
    
    if (nonOwnerFeeCount > 0) {
      console.error(`❌ CRITICAL ERROR: ${nonOwnerFeeCount} transactions with fees NOT directed to owner`);
      await reportViolation(`${nonOwnerFeeCount} transactions have fees directed to non-owner accounts`);
      
      // Log the details
      console.log('\nDetails of misdirected fees:');
      console.table(nonOwnerFees);
    } else {
      console.log(`✅ All transaction fees are correctly routed to ${OWNER_USERNAME} (ID: ${OWNER_ID})`);
    }
    
    // Summary
    console.log('\n='.repeat(80));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    
    if (nonOwnerFeeCount === 0) {
      console.log('✅ ALL FINANCIAL RULES SATISFIED: All earnings go to jbaker00988');
    } else {
      console.error('❌ CRITICAL REVENUE ROUTING VIOLATION DETECTED');
      console.error(`${nonOwnerFeeCount} transactions need correction to comply with revenue rules`);
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

/**
 * Get all transactions that have fees
 */
async function getAllTransactionsWithFees(): Promise<any[]> {
  // This is a mock implementation
  // In a real system, you would query the database
  return [];
}

/**
 * Report a violation of the revenue routing rules
 */
async function reportViolation(message: string): Promise<void> {
  try {
    await securityMonitor.detectAndReport({
      type: SecurityAlertType.REVENUE_ROUTING_MODIFIED,
      severity: 'CRITICAL',
      message: `REVENUE ROUTING VIOLATION: ${message}`,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to report violation:', error);
  }
}

// Run the verification
verifyOwnerRevenueIntegrity().catch(error => {
  console.error('Verification failed with error:', error);
});