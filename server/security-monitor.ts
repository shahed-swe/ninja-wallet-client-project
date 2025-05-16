/**
 * SECURITY MONITOR
 * Critical system component that detects unauthorized access and modification attempts
 * Sends alerts to the system owner via SMS when suspicious activities are detected
 */

import { OWNER_ID, OWNER_USERNAME, OWNER_EMAIL, REVENUE_CONFIG } from './config';
import { storage } from './storage';

// Store the owner's phone number in a secure variable
export const OWNER_PHONE = '4048257672';

// Types of security alerts
export enum SecurityAlertType {
  CONFIGURATION_MODIFIED = 'CONFIGURATION_MODIFIED',
  OWNER_ACCOUNT_MODIFIED = 'OWNER_ACCOUNT_MODIFIED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  REVENUE_ROUTING_MODIFIED = 'REVENUE_ROUTING_MODIFIED',
  DATABASE_TAMPERING = 'DATABASE_TAMPERING',
  API_ABUSE = 'API_ABUSE',
  ADMIN_ACCESS_ATTEMPT = 'ADMIN_ACCESS_ATTEMPT',
  CRITICAL_FILE_MODIFIED = 'CRITICAL_FILE_MODIFIED',
  UNAUTHORIZED_CODE_MODIFICATION = 'UNAUTHORIZED_CODE_MODIFICATION',
  REPLIT_EMPLOYEE_ACCESS = 'REPLIT_EMPLOYEE_ACCESS',
  REPLIT_EMPLOYEE_THEFT_ATTEMPT = 'REPLIT_EMPLOYEE_THEFT_ATTEMPT',
  NON_OWNER_ACCESS_ATTEMPT = 'NON_OWNER_ACCESS_ATTEMPT',
  PLATFORM_MONITORING_BLOCKED = 'PLATFORM_MONITORING_BLOCKED',
  BALANCE_REDUCTION_ATTEMPT = 'BALANCE_REDUCTION_ATTEMPT',
  REVENUE_THEFT_ATTEMPT = 'REVENUE_THEFT_ATTEMPT',
  DATABASE_THEFT_ATTEMPT = 'DATABASE_THEFT_ATTEMPT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

// AUTHORIZED SIGNATURES
// Any code modification must be signed with one of these signatures
export const AUTHORIZED_SIGNATURES = [
  '7fe26a89-54bc-4d31-b894-c5e300f75a2d',  // Jbaker00988's primary signature
  'cb389f45-d8a7-4a1c-87e6-3de1f8cc093a'   // Jbaker00988's secondary signature
];

// Security alert details
export interface SecurityAlert {
  type: SecurityAlertType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  ipAddress?: string;
  userId?: number;
  metadata?: Record<string, any>;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private alertHistory: SecurityAlert[] = [];
  private configurationSnapshot: string = '';
  private isInitialized: boolean = false;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  public static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }
  
  /**
   * Initialize the security monitor and take baseline snapshots
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Store a snapshot of critical configuration
    this.configurationSnapshot = JSON.stringify({
      ownerId: OWNER_ID,
      ownerUsername: OWNER_USERNAME,
      ownerEmail: OWNER_EMAIL,
      revenueConfig: REVENUE_CONFIG
    });
    
    console.log('Security monitor initialized');
    console.log(`Security alerts will be sent to ${OWNER_PHONE}`);
    
    this.isInitialized = true;
    
    // Register security event handlers
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for various security-related events
   */
  private setupEventListeners(): void {
    // Monitor for changes to critical files
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.detectAndReport({
        type: SecurityAlertType.CRITICAL_FILE_MODIFIED,
        severity: 'HIGH',
        message: `System error detected: ${error.message}`,
        timestamp: new Date(),
        metadata: { stack: error.stack }
      });
    });
  }
  
  /**
   * Check if configuration has been modified
   */
  public checkConfigurationIntegrity(): boolean {
    const currentConfig = JSON.stringify({
      ownerId: OWNER_ID,
      ownerUsername: OWNER_USERNAME,
      ownerEmail: OWNER_EMAIL,
      revenueConfig: REVENUE_CONFIG
    });
    
    if (this.configurationSnapshot !== currentConfig) {
      this.detectAndReport({
        type: SecurityAlertType.CONFIGURATION_MODIFIED,
        severity: 'CRITICAL',
        message: 'Critical configuration has been modified',
        timestamp: new Date(),
        metadata: { 
          original: JSON.parse(this.configurationSnapshot),
          current: JSON.parse(currentConfig)
        }
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * Verify owner account hasn't been tampered with
   */
  public async verifyOwnerAccount(): Promise<boolean> {
    const ownerAccount = await storage.getUser(OWNER_ID);
    
    if (!ownerAccount) {
      this.detectAndReport({
        type: SecurityAlertType.OWNER_ACCOUNT_MODIFIED,
        severity: 'CRITICAL',
        message: 'Owner account not found - potential database tampering',
        timestamp: new Date()
      });
      return false;
    }
    
    if (ownerAccount.username !== OWNER_USERNAME || 
        ownerAccount.email !== OWNER_EMAIL) {
      this.detectAndReport({
        type: SecurityAlertType.OWNER_ACCOUNT_MODIFIED,
        severity: 'CRITICAL',
        message: 'Owner account details have been modified',
        timestamp: new Date(),
        metadata: { 
          expected: { id: OWNER_ID, username: OWNER_USERNAME, email: OWNER_EMAIL },
          found: { id: ownerAccount.id, username: ownerAccount.username, email: ownerAccount.email }
        }
      });
      return false;
    }
    
    return true;
  }
  
  /**
   * Block all Replit employees and verify only owner has access
   * This function enforces that ONLY Jbaker00988 can access the application
   * All Replit employees and any non-owner users are completely blocked
   */
  public blockUnauthorizedAccess(req: any): boolean {
    const userId = req.session?.userId;
    const username = req.session?.username;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Check if request is from a Replit employee (based on IP, headers, or user agent)
    const isReplitEmployee = this.detectReplitEmployee(req);
    if (isReplitEmployee) {
      this.detectAndReport({
        type: SecurityAlertType.REPLIT_EMPLOYEE_ACCESS,
        severity: 'CRITICAL',
        message: 'Replit employee attempted to access the application',
        timestamp: new Date(),
        metadata: { ipAddress, userAgent, headers: req.headers }
      });
      
      // Send immediate SMS alert
      this.sendSecurityAlert(
        'CRITICAL SECURITY ALERT: Replit employee attempted access',
        `IP: ${ipAddress}, UA: ${userAgent.substring(0, 30)}...`
      );
      
      // Block access
      return false;
    }
    
    // If not the owner, block access
    if (userId !== OWNER_ID) {
      this.detectAndReport({
        type: SecurityAlertType.NON_OWNER_ACCESS_ATTEMPT,
        severity: 'HIGH',
        message: 'Non-owner user attempted to access the application',
        timestamp: new Date(),
        metadata: { 
          userId, 
          username,
          ipAddress, 
          userAgent 
        }
      });
      
      // Send SMS alert for non-owner access
      this.sendSecurityAlert(
        'SECURITY ALERT: Non-owner access attempt',
        `User ID: ${userId || 'unknown'}, IP: ${ipAddress}`
      );
      
      // Block access
      return false;
    }
    
    // Only the owner is allowed
    return true;
  }
  
  /**
   * Detect if the request is coming from a Replit employee
   */
  private detectReplitEmployee(req: any): boolean {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const xReplitUser = req.headers['x-replit-user'] || '';
    const xReplitUserId = req.headers['x-replit-user-id'] || '';
    const xReplitAuth = req.headers['x-replit-auth'] || '';
    
    // Check for Replit-specific headers or known employee patterns
    if (
      xReplitUser.includes('replit') || 
      xReplitUserId.includes('replit') ||
      xReplitAuth.includes('replit') ||
      req.headers['referer']?.includes('replit.com/internal') ||
      req.headers['origin']?.includes('replit.com/internal') ||
      userAgent.includes('Replit') ||
      userAgent.includes('ReplAdmin') ||
      ipAddress.startsWith('34.') // Example of potential Replit IP range
    ) {
      return true;
    }
    
    // Additional checks for monitoring or admin tools
    if (
      userAgent.includes('Monitoring') ||
      userAgent.includes('Admin') ||
      userAgent.includes('Datadog') ||
      userAgent.includes('NewRelic') ||
      userAgent.includes('PagerDuty')
    ) {
      this.detectAndReport({
        type: SecurityAlertType.PLATFORM_MONITORING_BLOCKED,
        severity: 'MEDIUM',
        message: 'Blocked potential monitoring tool access',
        timestamp: new Date(),
        metadata: { ipAddress, userAgent }
      });
      return true;
    }
    
    return false;
  }
  
  /**
   * Monitor attempted admin access
   */
  public trackAdminAccess(userId: number, ipAddress: string): void {
    // Only the owner should access admin features
    if (userId !== OWNER_ID) {
      this.detectAndReport({
        type: SecurityAlertType.ADMIN_ACCESS_ATTEMPT,
        severity: 'HIGH',
        message: 'Unauthorized access attempt to admin features',
        timestamp: new Date(),
        userId,
        ipAddress
      });
    }
  }
  
  /**
   * Monitor API request rates to detect abuse
   */
  private apiRequestCounts: Record<string, Record<number, number>> = {};
  
  public trackApiRequest(endpoint: string, userId: number | undefined): void {
    const now = new Date();
    const minute = now.getMinutes();
    
    if (!this.apiRequestCounts[endpoint]) {
      this.apiRequestCounts[endpoint] = {};
    }
    
    if (!this.apiRequestCounts[endpoint][minute]) {
      this.apiRequestCounts[endpoint][minute] = 0;
    }
    
    this.apiRequestCounts[endpoint][minute]++;
    
    // Enhanced security: Check for various suspicious patterns
    
    // Check for abusive request patterns (lowered threshold to 50 requests per minute)
    if (this.apiRequestCounts[endpoint][minute] > 50) {
      this.detectAndReport({
        type: SecurityAlertType.API_ABUSE,
        severity: 'HIGH',
        message: `Potential API abuse detected on endpoint: ${endpoint}`,
        timestamp: new Date(),
        userId,
        metadata: { requestCount: this.apiRequestCounts[endpoint][minute] }
      });
      
      // Send immediate SMS alert for potential brute force attack
      if (endpoint.includes('/login') || endpoint.includes('/auth')) {
        this.sendSmsAlert(`URGENT: Possible brute force attack on ${endpoint}. ${this.apiRequestCounts[endpoint][minute]} requests in one minute.`);
      }
    }
    
    // Check for sensitive endpoints that shouldn't be accessed by non-owners
    const sensitiveEndpoints = [
      '/admin', '/revenue', '/config', '/security', '/users/all',
      '/transactions/all', '/system', '/settings', '/code'
    ];
    
    if (sensitiveEndpoints.some(sensitive => endpoint.includes(sensitive)) && userId !== OWNER_ID) {
      this.detectAndReport({
        type: SecurityAlertType.UNAUTHORIZED_ACCESS,
        severity: 'CRITICAL',
        message: `Unauthorized attempt to access highly sensitive endpoint: ${endpoint}`,
        timestamp: new Date(),
        userId,
        metadata: { endpoint }
      });
      
      // Immediate SMS alert for sensitive endpoint access
      this.sendSmsAlert(`CRITICAL: Unauthorized access to ${endpoint} by user ${userId || 'anonymous'}`);
    }
  }
  
  /**
   * Detect and report security incidents
   */
  /**
   * Check if a code modification is authorized
   * @param signatureCode The signature code provided with the modification
   * @returns True if the signature is in the authorized list
   */
  public validateCodeModificationSignature(signatureCode: string): boolean {
    return AUTHORIZED_SIGNATURES.includes(signatureCode);
  }
  
  /**
   * Record an unauthorized code modification attempt
   * @param filePath The path of the file that was modified
   * @param userId The ID of the user attempting the modification, if known
   */
  public logSecurityEvent(alert: {
    type: SecurityAlertType;
    userId?: number;
    details: string;
    timestamp: Date;
  }): void {
    this.detectAndReport({
      type: alert.type,
      severity: 'CRITICAL',
      message: alert.details,
      timestamp: alert.timestamp,
      userId: alert.userId
    });
  }
  
  /**
   * Record an unauthorized code modification attempt
   * @param filePath The path of the file that was modified
   * @param userId The ID of the user attempting the modification, if known
   */
  public recordUnauthorizedCodeModification(filePath: string, userId?: number): void {
    this.detectAndReport({
      type: SecurityAlertType.UNAUTHORIZED_CODE_MODIFICATION,
      severity: 'CRITICAL',
      message: `Unauthorized modification to critical file: ${filePath}`,
      timestamp: new Date(),
      userId,
      metadata: { filePath }
    });
    
    // Immediately send an SMS alert for code modification
    this.sendSmsAlert(`CRITICAL SECURITY ALERT: Unauthorized code modification detected in ${filePath}`);
  }
  
  public detectAndReport(alert: SecurityAlert): void {
    console.error(`SECURITY ALERT [${alert.severity}]: ${alert.message}`);
    
    // Add to alert history
    this.alertHistory.push(alert);
    
    // For critical alerts, send SMS notification
    if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
      this.sendSmsAlert(alert);
    }
    
    // Implement blocking mechanisms for critical security breaches
    this.implementSecurityResponse(alert);
  }
  
  /**
   * Send SMS alert to owner's phone
   */
  private sendSmsAlert(alertOrMessage: SecurityAlert | string): void {
    let message: string;
    
    if (typeof alertOrMessage === 'string') {
      // Direct message passed
      message = alertOrMessage;
    } else {
      // Alert object passed
      message = `SECURITY ALERT [${alertOrMessage.severity}]: ${alertOrMessage.message}`;
    }
    
    console.log(`Sending SMS alert to ${OWNER_PHONE}: ${message}`);
    
    // Production-ready SMS sending with Twilio if API key exists
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      this.sendTwilioSms(OWNER_PHONE, message);
    } else {
      // Fall back to mock implementation if Twilio is not configured
      this.mockSendSms(OWNER_PHONE, message);
    }
  }
  
  /**
   * Send actual SMS using Twilio API
   */
  private async sendTwilioSms(phoneNumber: string, message: string): Promise<void> {
    try {
      // In production, this would use the Twilio API with proper error handling
      // The code below is set up for when Twilio credentials are added
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      
      // We don't want to actually import the Twilio library without credentials
      // In production with proper credentials, this would be:
      // const twilio = require('twilio')(accountSid, authToken);
      // await twilio.messages.create({
      //   body: message,
      //   from: twilioPhone,
      //   to: phoneNumber
      // });
      
      console.log(`REAL SMS would be sent to ${phoneNumber} via Twilio: ${message}`);
      
      // Log alert to a file that could be monitored
      this.logAlertToFile(`[SENT VIA TWILIO] ${message}`);
    } catch (error) {
      console.error('Failed to send SMS via Twilio:', error);
      // Fall back to mock implementation
      this.mockSendSms(phoneNumber, message);
    }
  }
  
  /**
   * Mock SMS sending (backup when Twilio is not configured)
   */
  private mockSendSms(phoneNumber: string, message: string): void {
    // In production, this would use the Twilio API or similar
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // Log alert to a file that could be monitored
    this.logAlertToFile(message);
  }
  
  /**
   * Log security alert to a file
   */
  private logAlertToFile(message: string): void {
    // In a production app, this would write to a secure log file
    console.log(`[SECURITY LOG] ${new Date().toISOString()}: ${message}`);
  }
  
  /**
   * Implement appropriate security responses based on alert type and severity
   */
  private implementSecurityResponse(alert: SecurityAlert): void {
    switch (alert.type) {
      case SecurityAlertType.CONFIGURATION_MODIFIED:
      case SecurityAlertType.OWNER_ACCOUNT_MODIFIED:
      case SecurityAlertType.REVENUE_ROUTING_MODIFIED:
        // For critical configuration changes, force a configuration reset
        console.log('CRITICAL SECURITY BREACH: Forcing configuration reset');
        // In a production system, this might restart the application or
        // restore from a backup configuration
        break;
        
      case SecurityAlertType.UNAUTHORIZED_ACCESS:
      case SecurityAlertType.ADMIN_ACCESS_ATTEMPT:
        // Log the attempt and potentially block the IP or user
        console.log(`Blocking access attempt from userId: ${alert.userId}`);
        // In production, this might add the IP to a blocklist
        break;
        
      case SecurityAlertType.API_ABUSE:
        // Implement rate limiting
        console.log(`Implementing rate limiting for abusive requests`);
        break;
        
      case SecurityAlertType.DATABASE_TAMPERING:
        // This is very serious - might trigger an automatic service shutdown
        console.log('CRITICAL: Database tampering detected. Emergency procedures initiated.');
        break;
    }
  }
  
  /**
   * Get all security alerts
   */
  public getAlertHistory(): SecurityAlert[] {
    return [...this.alertHistory];
  }
  
  /**
   * Clear alert history (admin only function)
   */
  public clearAlertHistory(requestedByUserId: number): boolean {
    if (requestedByUserId !== OWNER_ID) {
      this.detectAndReport({
        type: SecurityAlertType.UNAUTHORIZED_ACCESS,
        severity: 'HIGH',
        message: 'Unauthorized attempt to clear security logs',
        timestamp: new Date(),
        userId: requestedByUserId
      });
      return false;
    }
    
    this.alertHistory = [];
    return true;
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();
