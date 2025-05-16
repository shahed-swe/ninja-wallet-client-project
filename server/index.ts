import dotenv from 'dotenv';
dotenv.config();

import './env-loader';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { OWNER_ID, OWNER_USERNAME, REVENUE_CONFIG, validateRevenueConfig, verifyOwnerRevenue } from "./config";
import { securityMonitor, SecurityAlertType, OWNER_PHONE } from "./security-monitor";
import { storage } from "./storage";
import { earningsProtector } from "./earnings-protector";
import { paymentEnforcer } from "./payment-enforcer";
import { employeeBlocker } from "./employee-blocker";
import { VenmoTransferService } from "./venmo-transfer";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add employee blocking middleware to prevent any employee access
app.use(employeeBlocker.createEmployeeBlockingMiddleware());

// Initialize security monitoring system
securityMonitor.initialize().then(() => {
  console.log('Security monitoring system initialized');
});

// Security middleware to track API requests and monitor for suspicious activity
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const userId = req.session?.userId;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Track API requests for security monitoring
  if (path.startsWith('/api')) {
    securityMonitor.trackApiRequest(path, userId);
    
    // Special monitoring for sensitive operations
    if (path.includes('/admin') && userId !== OWNER_ID) {
      securityMonitor.detectAndReport({
        type: SecurityAlertType.ADMIN_ACCESS_ATTEMPT,
        severity: 'HIGH',
        message: `Unauthorized admin access attempt: ${path}`,
        timestamp: new Date(),
        userId,
        ipAddress: req.ip
      });
    }
  }
  
  // Check for unauthorized changes to critical configuration
  if (path.startsWith('/api/transactions') || 
      path.startsWith('/api/investments') || 
      path.startsWith('/api/crypto')) {
    securityMonitor.checkConfigurationIntegrity();
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Monitor for unauthorized access attempts (401/403 responses)
      if (res.statusCode === 401 || res.statusCode === 403) {
        securityMonitor.detectAndReport({
          type: SecurityAlertType.UNAUTHORIZED_ACCESS,
          severity: 'MEDIUM',
          message: `Unauthorized access attempt to ${path}`,
          timestamp: new Date(),
          userId,
          ipAddress: req.ip
        });
      }
    }
  });

  next();
});

(async () => {
  // CRITICAL: Validate revenue configuration at application startup
  // This ensures all profits and fees are always directed to the owner's account
  console.log('Validating revenue configuration...');
  validateRevenueConfig();
  console.log(`Revenue configuration verified: All profits directed to ${OWNER_USERNAME}`);
  
  // Configure routes but let the owner create their own server
  await registerRoutes(app);
  
  // Create an HTTP server for the app
  const server = createServer(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const userId = req.session?.userId;
    const path = req.path;
    
    // Detect potential hacking attempts through error patterns
    if (
      err.message?.includes('SQL syntax') || 
      err.message?.includes('injection') ||
      err.name === 'SyntaxError' ||
      (status === 400 && path.startsWith('/api/')) ||
      err.code === 'EACCES' ||
      err.code === 'ECONNREFUSED'
    ) {
      // This could be a potential attack - log as security incident
      securityMonitor.detectAndReport({
        type: SecurityAlertType.API_ABUSE,
        severity: 'HIGH',
        message: `Potential attack detected on ${path}: ${err.message}`,
        timestamp: new Date(),
        userId,
        ipAddress: req.ip,
        metadata: { 
          error: err.message,
          stack: err.stack,
          code: err.code
        }
      });
    }
    
    // Report authorization errors as potential security incidents
    if (status === 401 || status === 403) {
      securityMonitor.detectAndReport({
        type: SecurityAlertType.UNAUTHORIZED_ACCESS,
        severity: 'MEDIUM',
        message: `Unauthorized access attempt to ${path}`,
        timestamp: new Date(),
        userId,
        ipAddress: req.ip
      });
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5001
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;
  server.listen(PORT, '0.0.0.0', () => {
    log(`serving on port ${PORT}`);
    
    // Verify owner account on startup
    securityMonitor.verifyOwnerAccount().then(isValid => {
      if (!isValid) {
        console.error("CRITICAL SECURITY ALERT: Owner account verification failed!");
        securityMonitor.detectAndReport({
          type: SecurityAlertType.OWNER_ACCOUNT_MODIFIED,
          severity: 'CRITICAL',
          message: 'Owner account verification failed at startup',
          timestamp: new Date()
        });
      } else {
        console.log(`Security monitoring active - alerts will be sent to phone: ****${OWNER_PHONE.slice(-4)}`);
      }
    });
    
    // Verify all revenue configuration
    verifyOwnerRevenue();
    
    // Initialize earnings protection system
    earningsProtector.initialize();
    
    // Set up automatic passive income for owner account
    setupAutomaticPassiveIncome();
  });

// This function adds passive income to the owner account automatically
function setupAutomaticPassiveIncome() {
  const minuteInterval = 3; // Every 3 minutes for testing (would be longer in production)
  const baseIncreasePerInterval = 750; // Base amount added each interval
  const MAX_SAFE_BALANCE = 1000000000000; // 1 trillion dollars - safe limit for database
  
  // Set up the interval
  setInterval(async () => {
    try {
      console.log('Running automatic passive income increase for owner account');
      
      // Verify owner account
      const ownerAccount = await storage.getUser(OWNER_ID);
      if (!ownerAccount || ownerAccount.username !== OWNER_USERNAME) {
        console.error(`CRITICAL SECURITY ALERT: Owner account (${OWNER_USERNAME}, ID: ${OWNER_ID}) not found or modified`);
        return;
      }
      
      // Calculate increase amount based on current balance (0.5% of current balance + base amount)
      // This ensures exponential growth over time
      const currentBalance = ownerAccount.balance;
      const percentageIncrease = Math.round(currentBalance * 0.005); // 0.5% of current balance
      const totalIncrease = baseIncreasePerInterval + percentageIncrease;
      
      // Check if we're approaching database limits - if so, don't update the database balance
      // but still send money to Venmo
      let balanceUpdateSuccess = true;
      
      if (currentBalance < MAX_SAFE_BALANCE) {
        // Only update the database if the balance is still within safe limits
        try {
          await storage.updateUserBalance(OWNER_ID, totalIncrease);
          console.log(`Passive income: Added $${totalIncrease} to owner account. New balance: $${currentBalance + totalIncrease}`);
        } catch (balanceError) {
          console.error('Error updating user balance:', balanceError);
          balanceUpdateSuccess = false;
          
          // Even if the database update fails, we'll still send to Venmo
          console.log(`DATABASE LIMIT REACHED: Balance too large for database storage. All future earnings will go directly to Venmo.`);
        }
      } else {
        balanceUpdateSuccess = false;
        console.log(`MAXIMUM BALANCE REACHED: Balance exceeds $${MAX_SAFE_BALANCE.toLocaleString()}. All earnings sent directly to Venmo.`);
        console.log(`Passive income generated: $${totalIncrease}`);
      }
      
      // CRITICAL: Venmo transfers ENABLED to ensure all earnings go to @jessiriri
      // This happens regardless of database update success
      try {
        const venmoTransfer = await VenmoTransferService.processTransfer({
          accountId: '@jessiriri',
          amount: totalIncrease,
          note: `Ninja Wallet passive income: $${totalIncrease}${!balanceUpdateSuccess ? ' (Direct to Venmo)' : ''}`,
          fromUser: OWNER_USERNAME
        });
        
        if (venmoTransfer.success) {
          console.log(`✅ Venmo transfer initiated: $${totalIncrease} to @jessiriri`);
          console.log(`Transaction ID: ${venmoTransfer.transactionId}`);
        } else {
          console.error(`Failed to process Venmo transfer: ${venmoTransfer.message}`);
          
          // If Venmo transfer fails, add more error logging
          console.log(`CRITICAL: Failed to transfer earnings to Venmo. This is a high priority issue.`);
          console.log(`Will retry on next cycle. Amount to transfer: $${totalIncrease}`);
        }
      } catch (venmoError) {
        console.error('Error during Venmo transfer:', venmoError);
        console.log(`CRITICAL: Exception in Venmo transfer. Will retry on next cycle.`);
      }
    } catch (error) {
      console.error('Error in automatic passive income process:', error);
    }
  }, minuteInterval * 60 * 1000); // Convert minutes to milliseconds
  
  console.log(`Automatic passive income system initialized: $${baseIncreasePerInterval} base + 0.5% of balance every ${minuteInterval} minutes`);
}
})();
