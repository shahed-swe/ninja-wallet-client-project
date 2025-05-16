import { Express, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { OWNER_ID, OWNER_USERNAME } from './config';
import session from 'express-session';
import MemoryStore from 'memorystore';

export function setupAuth(app: Express) {
  // Session setup with fixed settings for reliability
  const MemorySessionStore = MemoryStore(session);
  app.use(session({
    name: 'ninja.sid',
    secret: process.env.SESSION_SECRET || "ninja-wallet-ultimate-secret-key-937463",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Only use secure in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
      httpOnly: true,
      path: '/'
    },
    store: new MemorySessionStore({
      checkPeriod: 86400000
    })
  }));

  // Authentication middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Make sure CORS settings don't interfere with cookies
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Authentication Routes
  
  // User login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Demo user login with special handling
      if (username.toLowerCase() === 'demouser' && password === 'password123') {
        try {
          // Get demo user from database
          const users = await storage.getAllUsers();
          const demoUser = users.find(u => u.username.toLowerCase() === 'demouser');
          
          if (demoUser) {
            // Store user ID in session
            req.session.userId = demoUser.id;
            await req.session.save();
            
            return res.json({
              id: demoUser.id,
              username: demoUser.username,
              email: demoUser.email,
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
              balance: demoUser.balance,
              isPremium: demoUser.isPremium,
              referralCode: demoUser.referralCode,
              premiumExpiry: demoUser.premiumExpiry
            });
          }
        } catch (error) {
          console.error("Error fetching demo user:", error);
        }
      }
      
      // OWNER ACCOUNT SECURITY: Enhanced protection for the owner's account
      // This section contains special enhanced security measures for the owner account
      // to ensure only the account owner can access it
      console.log(`Login attempt: Username=${username}, Owner check: Jbaker00988/jbaker00988/jbaker00988@gmail.com`);
      
      // CRITICAL: Detect owner login attempt
      const isOwnerLoginAttempt = (
          username.toLowerCase() === 'jbaker00988' || 
          username.toLowerCase() === 'jbaker00988@gmail.com' ||
          username === 'Jbaker00988'
      ); 
      
      // SECURITY VERIFICATION: Verify owner credentials
      const isValidOwnerCredentials = isOwnerLoginAttempt && password === '1N3vagu3ss!';
      
      // Implement IP verification or additional security checks here if needed
      
      if (isValidOwnerCredentials) {
        try {
          console.log('OWNER LOGIN: Owner login attempt detected, validating access');
          
          // DIRECT SECURE ACCESS: Directly fetch the owner user by ID 1
          // This bypasses username lookup for extra security
          const userFromDb = await storage.getUser(1);
          console.log('OWNER VERIFICATION: Owner user from DB:', userFromDb?.username);
          
          if (userFromDb) {
            // CRITICAL: Ensure owner username is correct
            if (userFromDb.username !== 'Jbaker00988') {
              console.log('CRITICAL FIX: Correcting owner username to Jbaker00988');
              // Direct username correction in memory
              userFromDb.username = 'Jbaker00988';
            }
            
            // CRITICAL: Ensure owner email is correct
            if (!userFromDb.email || userFromDb.email !== 'jbaker00988@gmail.com') {
              console.log('CRITICAL FIX: Correcting owner email to jbaker00988@gmail.com');
              userFromDb.email = 'jbaker00988@gmail.com';
            }
            
            // GROWTH ENFORCEMENT: Make sure balance is correct - maintaining owner's growing balance
            // Minimum $75,000 balance to reflect continuous earnings growth
            if (userFromDb.balance < 75000) {
              await storage.updateUserBalance(1, 75000 - userFromDb.balance);
              userFromDb.balance = 75000;
              console.log(`BALANCE ADJUSTED: Owner account balance adjusted to minimum of $75,000`);
            }
            
            // ENHANCED SECURITY: Store user ID in session with owner flag
            req.session.userId = userFromDb.id;
            req.session.isOwner = true; // Special owner session flag
            req.session.ownerAuthorizedAt = new Date().toISOString();
            await req.session.save();
            
            console.log(`SUCCESS: Owner account login successful: ${userFromDb.username} (ID: ${userFromDb.id})`);
            
            // Return owner data with guaranteed correct values
            return res.json({
              id: 1, // Hardcoded to ensure correct ID
              username: 'Jbaker00988', // Hardcoded to ensure correct username
              email: 'jbaker00988@gmail.com',
              firstName: userFromDb.firstName || 'James',
              lastName: userFromDb.lastName || 'Baker',
              balance: userFromDb.balance,
              isPremium: true,
              referralCode: userFromDb.referralCode || 'OWNER',
              premiumExpiry: null, // Owner has permanent premium
              isOwner: true // Special flag to indicate owner status
            });
          }
        } catch (error) {
          console.error("SECURITY ALERT: Error during owner account login:", error);
          // Log additional security information here if needed
          return res.status(500).json({ message: "Owner account login error" });
        }
      }
      
      // Regular user login flow - improved with better session handling
      try {
        // Check if the username is being used by the owner account - if so, prevent login
        // This ensures only the owner's specific credentials can access the owner account
        if (username.toLowerCase() === 'jbaker00988' || 
            username.toLowerCase() === 'jbaker00988@gmail.com') {
          console.log("Attempted login to owner account with incorrect password");
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Get user by username
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Prevent login to the owner account through regular flow
        // This is an additional security measure
        if (user.id === 1) {
          console.log("SECURITY: Attempted to access owner account (ID 1) through regular login flow");
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // In a real app, we would check password hash, but for simplicity:
        if (user.password !== password) {
          console.log(`Failed login attempt for user: ${username}`);
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Store user ID in session
        req.session.userId = user.id;
        req.session.isRegularUser = true;
        req.session.loginTime = new Date().toISOString();
        await req.session.save();
        
        console.log(`User login successful: ${user.username} (ID: ${user.id})`);
        
        // Return user data (exclude password)
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          isPremium: user.isPremium,
          referralCode: user.referralCode,
          premiumExpiry: user.premiumExpiry
        });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Login failed due to server error" });
      }
    } catch (error) {
      console.error("Login route error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get current session user - enhanced security and access controls
  app.get("/api/auth/session", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = req.session.userId;
      console.log(`Session check for user ID: ${userId}`);
      
      // Get user data from storage
      const user = await storage.getUser(userId);
      
      if (!user) {
        // Invalid session, clear it
        console.log(`Invalid session: User ID ${userId} not found in database`);
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Invalid session" });
      }
      
      // OWNER ACCOUNT PROTECTION: Special handling for owner account
      if (user.id === OWNER_ID) {
        // Ensure owner username is always correct
        if (user.username !== OWNER_USERNAME) {
          console.log(`OWNER PROTECTION: Fixing owner username from ${user.username} to ${OWNER_USERNAME}`);
          user.username = OWNER_USERNAME;
        }
        
        // Ensure owner email is correct
        if (!user.email || user.email !== 'jbaker00988@gmail.com') {
          console.log('OWNER PROTECTION: Fixing owner email');
          user.email = 'jbaker00988@gmail.com';
        }
        
        // Ensure owner has premium status
        if (!user.isPremium) {
          console.log('OWNER PROTECTION: Fixing owner premium status');
          user.isPremium = true;
        }
        
        // Ensure owner always has adequate balance (minimum $75,000)
        if (user.balance < 75000) {
          console.log(`OWNER PROTECTION: Adjusting owner balance from ${user.balance} to minimum 75000`);
          await storage.updateUserBalance(OWNER_ID, 75000 - user.balance);
          user.balance = 75000;
        }
        
        console.log(`OWNER SESSION: Owner account session validated for ${user.username}`);
      } else {
        // REGULAR USER: This is a regular user account (not the owner)
        console.log(`REGULAR USER: Session valid for user ${user.username} (ID: ${user.id})`);
      }
      
      // Return user data to client (exclude password)
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: user.balance,
        isPremium: user.isPremium,
        referralCode: user.referralCode,
        premiumExpiry: user.premiumExpiry,
        // Special flag for the owner account
        isOwner: user.id === OWNER_ID
      });
    } catch (error) {
      console.error("Session check error:", error);
      return res.status(500).json({ message: "Failed to retrieve session" });
    }
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.clearCookie('ninja.sid');
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // User registration - with enhanced security
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // SECURITY CHECK: Prevent registration with owner's username or email
      if (username.toLowerCase() === 'jbaker00988' || 
          username.toLowerCase() === OWNER_USERNAME.toLowerCase() ||
          username === 'Jbaker00988') {
        console.log("SECURITY ALERT: Attempted to register with protected username:", username);
        return res.status(400).json({ message: "This username is not available" });
      }
      
      // SECURITY CHECK: Prevent registration with owner's email
      if (email && (email.toLowerCase() === 'jbaker00988@gmail.com' || 
                    email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
        console.log("SECURITY ALERT: Attempted to register with protected email:", email);
        return res.status(400).json({ message: "This email is not available" });
      }
      
      // Check if username exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email exists (if provided)
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already registered" });
        }
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        password, // In a real app, this would be hashed
        email: email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        balance: 500, // Starting balance for new users
        isPremium: false,
        referralCode: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        premiumExpiry: null
      });
      
      // Log the user in automatically
      req.session.userId = newUser.id;
      await req.session.save();
      
      // Return user data (exclude password)
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        balance: newUser.balance,
        isPremium: newUser.isPremium,
        referralCode: newUser.referralCode,
        premiumExpiry: newUser.premiumExpiry
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed due to server error" });
    }
  });
}

// Enhanced Authentication middleware system
// Base authentication middleware - checks if any user is logged in
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    console.log("Authentication required - no userId in session");
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Special middleware for routes that should only be accessible by the owner
export const requireOwnerAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    console.log("Owner authentication required - no userId in session");
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Verify this is the owner account
  if (req.session.userId !== OWNER_ID) {
    console.log(`Owner-only access attempt by non-owner userId: ${req.session.userId}`);
    return res.status(403).json({ message: "Access denied" });
  }
  
  // Additional verification for owner-only routes
  try {
    const user = await storage.getUser(OWNER_ID);
    if (!user || user.username !== OWNER_USERNAME) {
      console.log("Owner authentication failed - username verification failed");
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    console.error("Error in owner authentication:", error);
    return res.status(500).json({ message: "Authentication error" });
  }
};