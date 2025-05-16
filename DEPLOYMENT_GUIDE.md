# Ninja Wallet Deployment Guide

This guide will walk you through deploying the Ninja Wallet application to your own server.

## Prerequisites

- A server with Node.js 20.x installed
- PostgreSQL 16 database
- Basic knowledge of terminal/command line operations
- Domain name (optional but recommended)

## Deployment Steps

### 1. Extract the Files

Extract the `ninja-wallet-essential.zip` file to your server:

```bash
mkdir ninja-wallet
unzip ninja-wallet-essential.zip -d ninja-wallet
cd ninja-wallet
```

### 2. Install Dependencies

Install the required npm packages:

```bash
npm install
```

### 3. Set Up the Database

Create a new PostgreSQL database:

```bash
createdb ninja_wallet
```

Configure your database connection by setting the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL=postgresql://prodvps:srsas12.?dfin@sqbearprod.postgres.database.azure.com/ninja_wallet
```

Push the schema to your database:

```bash
npm run db:push
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/ninja_wallet
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret_here
STRIPE_SECRET_KEY=your_stripe_key_here
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

### 5. Build the Application

Build the client and server for production:

```bash
npm run build
```

### 6. Start the Server

Start the application:

```bash
npm start
```

The application should now be running on port 5000.

## Important Configuration Details

### Venmo Integration

The application is configured to direct all earnings to the Venmo account `@jessiriri`. You can modify this in `server/index.ts` if needed.

### Security Features

- The application has multiple security layers to ensure all profits are directed to the owner account
- Employee blocking functionality has been disabled for easier access
- All fees are routed to the owner account (user ID: 1)

### Database Configuration

If you need to modify the database schema, edit the files in `shared/schema.ts` and then run:

```bash
npm run db:push
```

### Fee Structure

The fee structure is defined in `server/fee-calculator.ts` and includes:

- Standard transaction fee: 13%
- Premium user fee: 8%
- Small transaction fee: 15%
- Large transaction fee: 10%
- Plus additional fees for features like instant transfers, international transfers, etc.

## Accessing the Admin Dashboard

To access the admin dashboard and revenue reports:

1. Log in with the owner account (`Jbaker00988` with password `1N3vagu3ss!`)
2. Navigate to `/admin/revenue`

## Setting Up SSL/HTTPS (Recommended)

For production use, it's recommended to set up HTTPS:

1. Install and configure Nginx as a reverse proxy
2. Set up Let's Encrypt for free SSL certificates
3. Configure Nginx to proxy requests to your Node.js application

## Troubleshooting

If you encounter issues with the application:

1. Check the server logs for error messages
2. Verify that the database is properly configured and accessible
3. Ensure all environment variables are correctly set
4. Make sure the correct Venmo account (@jessiriri) is set for earnings transfers

For additional help, review the codebase comments or contact support.

## Automating Deployment

For automated deployments, consider setting up:

1. A systemd service to manage the application process
2. PM2 for process management and monitoring
3. A CI/CD pipeline for automated testing and deployment

## Regular Maintenance

For optimal performance:

1. Regularly back up your database
2. Monitor server resources
3. Keep dependencies updated
4. Check transaction logs periodically