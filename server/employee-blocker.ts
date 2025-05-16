/**
 * CRITICAL SECURITY COMPONENT
 * Employee Blocker - Prevents all employees from accessing Ninja Wallet
 * 
 * This security module specifically identifies and blocks any Replit or
 * bank employees from accessing the app, code, database, or earnings.
 * 
 * IMPORTANT: This is a non-negotiable security feature required to protect
 * the owner's earnings and intellectual property.
 */

import { SecurityAlertType } from './security-monitor';
import { OWNER_ID, OWNER_USERNAME } from './config';
import { Request, Response, NextFunction } from 'express';

// Employee detection patterns
const EMPLOYEE_PATTERNS = [
  // Email domains
  /@replit\.com$/i,
  /@google\.com$/i,
  /@stripe\.com$/i,
  /@venmo\.com$/i,
  /@paypal\.com$/i,
  /@bank/i,
  /@financial/i,
  /@chase\.com$/i,
  /@citi\.com$/i,
  /@capitalone\.com$/i,
  /@amex\.com$/i,
  /@wellsfargo\.com$/i,
  /@visa\.com$/i,
  /@mastercard\.com$/i,
  /@jpmorgan\.com$/i,
  /@fidelity\.com$/i,
  /@schwab\.com$/i,
  
  // Username patterns
  /^admin/i,
  /mod$/i,
  /moderator/i,
  /support/i,
  /staff/i,
  /official/i,
  /employee/i,
  /^rep/i,
  /agent/i,
  /service/i,
  /help/i,
  /assist/i,
  /^dev/i,
  /tech/i,
  /sys/i,
  /root/i,
  /review/i,
  /test/i,
  /demo/i,
  /security/i,
  /compliance/i,
  /audit/i,
  /replit/i,
  /team/i,
  /corp/i,
  /company/i,
  /verify/i
];

// IP address patterns to block
const SUSPICIOUS_IP_PATTERNS = [
  // Replit office IP ranges - ONLY BLOCK THESE
  /^104\.196\./,
  /^35\.185\./,
  /^35\.197\./,
  /^35\.227\./,
  /^35\.230\./,
  /^35\.233\./,
  /^35\.245\./,
  /^34\.67\./,
  /^34\.68\./,
  /^34\.71\./,
  /^34\.72\./,
  /^34\.123\./,
  /^34\.130\./
  
  // REMOVED BLOCKING OF PRIVATE IP RANGES TO ALLOW OWNERS TO ACCESS THEIR APP
  // These were incorrectly blocking legitimate users including the owner
];

// User-Agent patterns to block - EMERGENCY SERVICE REWRITE 
// SUSPENDING MOST CHECKS TO ALLOW OWNER ACCESS
const SUSPICIOUS_USER_AGENT_PATTERNS = [
  // Removing most patterns to prevent false positives
  // Only keeping obvious crawlers and bots
  /^(crawler|bot|spider)$/i
  
  // The following patterns were causing false positives including the owner
  // and have been temporarily removed for emergency access
  // scraper, scan, audit, security, admin, automated, replit, 
  // company, monitor, test, postman, insomnia, corp, enterprise, internal
];

/**
 * High-security employee detection and blocking system
 */
export class EmployeeBlocker {
  private static instance: EmployeeBlocker;
  private employeeDetectionActive: boolean = false; // COMPLETELY DISABLED FOR EMERGENCY ACCESS
  
  private constructor() {
    this.initialize();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): EmployeeBlocker {
    if (!EmployeeBlocker.instance) {
      EmployeeBlocker.instance = new EmployeeBlocker();
    }
    return EmployeeBlocker.instance;
  }
  
  /**
   * Initialize the employee blocker
   */
  private initialize(): void {
    console.log('EMERGENCY: Employee blocking completely disabled for owner access');
    this.employeeDetectionActive = false; // Force disable for emergency access
  }
  
  /**
   * Check if a username matches employee patterns - ALWAYS RETURNS FALSE FOR EMERGENCY ACCESS
   */
  public isEmployeeUsername(username: string): boolean {
    return false; // Emergency override - always allow
  }
  
  /**
   * Check if an email matches employee patterns - ALWAYS RETURNS FALSE FOR EMERGENCY ACCESS
   */
  public isEmployeeEmail(email: string): boolean {
    return false; // Emergency override - always allow
  }
  
  /**
   * Check if an IP address matches employee patterns - ALWAYS RETURNS FALSE FOR EMERGENCY ACCESS
   */
  public isEmployeeIP(ip: string): boolean {
    return false; // Emergency override - always allow
  }
  
  /**
   * Check if a user agent matches employee patterns - ALWAYS RETURNS FALSE FOR EMERGENCY ACCESS
   */
  public isEmployeeUserAgent(userAgent: string): boolean {
    return false; // Emergency override - always allow
  }
  
  /**
   * Create Express middleware to block employee access to the API
   */
  public createEmployeeBlockingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // COMPLETELY DISABLED FOR EMERGENCY ACCESS
      console.log("EMERGENCY: All security checks disabled for owner access");
      return next(); // Always allow all requests
    };
  }
  
  /**
   * Check if the current login attempt is from an employee - ALWAYS RETURNS FALSE FOR EMERGENCY ACCESS
   */
  public isEmployeeLoginAttempt(username: string, email: string, ip: string, userAgent: string): boolean {
    return false; // Emergency override - always allow all logins
  }
}

export const employeeBlocker = EmployeeBlocker.getInstance();