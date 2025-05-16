# Ninja Wallet Server Cheat Sheet

## Database Structure

The Ninja Wallet app uses PostgreSQL with the following core tables:

### Users
- `id`: Primary key
- `username`: Unique username
- `password`: Password (in plaintext for prototype)
- `email`: User email address
- `firstName`, `lastName`: Optional user details
- `balance`: User's account balance
- `isPremium`: Whether user has premium status
- `premiumExpiry`: When premium status expires
- `referralCode`: Unique referral code for the user
- `referredBy`: ID of user who referred them
- `payment_customer_id`: Stripe customer ID
- `payment_subscription_id`: Stripe subscription ID

### Transactions
- `id`: Primary key
- `userId`: References user making transaction
- `type`: Type of transaction (send, receive, trade)
- `amount`: Transaction amount
- `fee`: Fee charged for transaction
- `recipient`, `sender`: Transaction parties
- `note`: Optional transaction note
- `isInstantTransfer`: Whether it was an instant transfer
- `status`: Transaction status (pending, completed, failed)
- `createdAt`: Timestamp of transaction

### Virtual Cards
- `id`: Primary key
- `userId`: References card owner
- `cardNumber`, `cardholderName`, `expiryMonth`, `expiryYear`, `cvv`: Card details
- `balance`: Card balance
- `isActive`: Whether card is active
- `dailyLimit`, `monthlyLimit`: Usage limits
- `isVirtual`: Whether it's a virtual card
- `createdAt`, `updatedAt`: Timestamps

### Linked Accounts
- `id`: Primary key
- `userId`: References user who linked account
- `provider`: Service provider (Venmo, Zelle, etc.)
- `accountUsername`: Username on the provider
- `createdAt`: When account was linked

### Investments
- `id`: Primary key
- `userId`: References investor
- `assetType`: Type of investment (crypto, stock)
- `assetName`, `assetSymbol`: Investment details
- `quantity`: Amount owned
- `purchasePrice`, `currentPrice`: Value information
- `createdAt`: When investment was made

### Crypto Wallets
- `id`: Primary key
- `userId`: References wallet owner
- `cryptoType`: Type of cryptocurrency
- `walletAddress`: Public wallet address
- `balance`: Wallet balance
- `privateKey`, `publicKey`: Key pair (encrypted)
- `isExternal`: Whether it's on external platform
- `platformName`: Name of external platform
- `createdAt`, `updatedAt`: Timestamps

## Key Security Features

### Owner Account Protection
- Owner account ID is hardcoded as `1`
- Username must be `Jbaker00988` (with capital J) 
- Password: `1N3vagu3ss!`
- All fee revenue is directed to this account
- Owner has elevated privileges throughout the app

### Revenue Protection
- `fee-calculator.ts`: Calculates appropriate fees for all transactions
- `revenue-tracker.ts`: Monitors and tracks all revenue
- `earnings-protector.ts`: Ensures all earnings go to owner
- `payment-enforcer.ts`: Forces payment routing to owner account

### Security Monitoring
- `security-monitor.ts`: Monitors for suspicious activity
- Alerts for unauthorized access attempts
- SMS alerts sent to owner's phone
- Automated protection against unauthorized modifications

### Access Control
- `employee-blocker.ts`: Previously blocked many IP ranges and user patterns
- Now disabled for easier owner access
- Session-based authentication with cookie security

## Automatic Income Generation
- Located in `server/index.ts` 
- Runs every 3 minutes
- Adds $750 base + 0.5% of current balance to owner account
- Transfers earnings to @jessiriri on Venmo

## API Routes

Key API endpoints:

### Authentication
- `POST /api/auth/register`: Create new user account
- `POST /api/auth/login`: Log in user (special handling for owner)
- `POST /api/auth/logout`: Log out current user
- `GET /api/auth/session`: Get current session info

### Transactions
- `POST /api/transactions`: Create a new transaction
- `GET /api/transactions`: Get user's transactions
- `GET /api/transactions/recent`: Get recent transactions

### Admin
- `GET /api/admin/revenue`: Get revenue overview (owner only)
- `GET /api/admin/users`: Get all users (owner only)
- `GET /api/admin/transactions`: Get all transactions (owner only)

### Virtual Cards
- `POST /api/cards`: Create a new virtual card
- `GET /api/cards`: Get user's virtual cards
- `GET /api/cards/:id`: Get specific card details
- `POST /api/cards/:id/deactivate`: Deactivate a card

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `STRIPE_SECRET_KEY`: For payment processing
- `VITE_STRIPE_PUBLIC_KEY`: Public Stripe key (client-side)

## Critical Directories

- `server/`: Backend Node.js/Express code
- `client/`: Frontend React/TypeScript code
- `shared/`: Shared types and schemas
- `server/db.ts`: Database connection
- `server/storage.ts`: Data access layer
- `server/routes.ts`: API route definitions