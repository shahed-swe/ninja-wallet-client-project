import { Transaction, CardTransaction, User } from "@shared/schema";
import { db } from "./db";
import { storage } from "./storage";

export interface RevenueStats {
  totalRevenue: number;
  transactionCount: number;
  averageFeePerTransaction: number;
  premiumRevenue: number;
  standardRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  potentialRevenue: number; // Revenue if all users were premium
  revenueLostToNonPremium: number; // Revenue lost due to non-premium users
  
  // Detailed breakdown by transaction type
  revenueByType: {
    send: number;
    receive: number;
    trade: number;
    exchange: number;
    cardTransaction: number;
    investment: number;
  };
  
  // Detailed breakdown by fee type
  revenueByFeeType: {
    baseFees: number;
    instantTransferFees: number;
    exchangeMarkupFees: number;
    premiumSubscriptions: number;
  };
  
  // Transaction volume statistics
  transactionVolume: {
    total: number;
    instant: number;
    international: number;
    premium: number;
    standard: number;
  };
  
  // Average metrics
  averages: {
    feePercentage: number;
    transactionSize: number;
    instantFeePercentage: number;
    revenuePerUser: number;
    revenuePerPremiumUser: number;
    revenuePerStandardUser: number;
  };
  
  subscriptionRevenue: number;
  premiumUserCount: number;
  totalUsers: number;
  premiumConversionRate: number;
  projectedAnnualRevenue: number;
  
  // Top revenue sources
  topRevenueUsers: {
    userId: number;
    username: string;
    totalFeesPaid: number;
    transactionCount: number;
  }[];
  
  // Time-based data for charts
  timeBasedData: {
    daily: { date: string; revenue: number }[];
    weekly: { week: string; revenue: number }[];
    monthly: { month: string; revenue: number }[];
  };
}

export async function calculateTotalRevenue(): Promise<RevenueStats> {
  // Get all transactions from storage
  const transactions = await getAllTransactions();
  const cardTransactions = await getCardTransactions();
  const users = await getAllUsers();
  
  // Initialize statistics
  let totalRevenue = 0;
  let sendRevenue = 0;
  let receiveRevenue = 0;
  let tradeRevenue = 0;
  let exchangeRevenue = 0;
  let cardTransactionRevenue = 0;
  let investmentRevenue = 0;
  let premiumRevenue = 0;
  let standardRevenue = 0;
  let currentMonthRevenue = 0;
  let previousMonthRevenue = 0;
  let potentialRevenue = 0;
  
  // Fee type tracking
  let baseFees = 0;
  let instantTransferFees = 0;
  let exchangeMarkupFees = 0;
  
  // Transaction volumes
  let totalVolume = 0;
  let instantVolume = 0;
  let internationalVolume = 0;
  let premiumVolume = 0;
  let standardVolume = 0;
  
  // User revenue tracking
  let userRevenueMap = new Map<number, { userId: number, username: string, totalFeesPaid: number, transactionCount: number }>();

  // Get current date and month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Create date for previous month
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousMonthYear = previousMonthDate.getFullYear();
  
  // Time-based data collections
  const dailyRevenueMap = new Map<string, number>();
  const weeklyRevenueMap = new Map<string, number>();
  const monthlyRevenueMap = new Map<string, number>();
  
  // Premium user calculation
  const premiumUsers = users.filter(user => user.isPremium);
  const premiumUserCount = premiumUsers.length;
  const totalUsers = users.length;
  
  // Estimate subscription revenue ($9.99 per premium user per month)
  const subscriptionRevenue = premiumUserCount * 9.99;
  
  // Calculate revenue from each transaction's fee
  transactions.forEach(transaction => {
    if (transaction.fee) {
      // Basic revenue tracking
      totalRevenue += transaction.fee;
      
      // Track revenue by transaction type
      switch (transaction.type) {
        case 'send':
          sendRevenue += transaction.fee;
          break;
        case 'receive':
          receiveRevenue += transaction.fee;
          break;
        case 'trade':
          tradeRevenue += transaction.fee;
          break;
        case 'exchange':
          exchangeRevenue += transaction.fee;
          break;
        case 'investment':
          investmentRevenue += transaction.fee;
          break;
      }
      
      // Track revenue by user type (premium vs standard)
      const user = users.find(u => u.id === transaction.userId);
      if (user?.isPremium) {
        premiumRevenue += transaction.fee;
      } else {
        standardRevenue += transaction.fee;
        
        // Calculate potential revenue if this user was premium
        // Premium rate is 8% instead of standard 13% (or 15% for small transactions)
        let standardRate = transaction.amount < 100 ? 0.15 : 
                          transaction.amount > 1000 ? 0.10 : 0.13;
        let premiumRate = 0.08;
        
        // Calculate what the fee would be if they were premium
        let potentialFee = transaction.amount * premiumRate;
        
        // Add to potential revenue calculation
        potentialRevenue += potentialFee;
      }
      
      // Track revenue by time period
      const transactionDate = new Date(transaction.createdAt);
      const transactionMonth = transactionDate.getMonth();
      const transactionYear = transactionDate.getFullYear();
      
      // Current month vs previous month tracking
      if (transactionMonth === currentMonth && transactionYear === currentYear) {
        currentMonthRevenue += transaction.fee;
      } else if (transactionMonth === previousMonth && transactionYear === previousMonthYear) {
        previousMonthRevenue += transaction.fee;
      }
      
      // Format for daily tracking (YYYY-MM-DD)
      const dailyKey = transactionDate.toISOString().split('T')[0];
      dailyRevenueMap.set(dailyKey, (dailyRevenueMap.get(dailyKey) || 0) + transaction.fee);
      
      // Format for weekly tracking (YYYY-WW)
      const weekNumber = getWeekNumber(transactionDate);
      const weeklyKey = `${transactionYear}-W${weekNumber}`;
      weeklyRevenueMap.set(weeklyKey, (weeklyRevenueMap.get(weeklyKey) || 0) + transaction.fee);
      
      // Format for monthly tracking (YYYY-MM)
      const monthlyKey = `${transactionYear}-${(transactionMonth + 1).toString().padStart(2, '0')}`;
      monthlyRevenueMap.set(monthlyKey, (monthlyRevenueMap.get(monthlyKey) || 0) + transaction.fee);
    }
  });
  
  // Add card transaction revenue
  cardTransactions.forEach(transaction => {
    // Assume 2% fee on card transactions
    const fee = transaction.amount * 0.02;
    cardTransactionRevenue += fee;
    totalRevenue += fee;
  });
  
  // Calculate additional metrics
  const transactionCount = transactions.length + cardTransactions.length;
  const averageFeePerTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;
  const premiumConversionRate = totalUsers > 0 ? (premiumUserCount / totalUsers) * 100 : 0;
  const projectedAnnualRevenue = (totalRevenue / getCurrentDayOfYear() * 365) + (subscriptionRevenue * 12);
  
  // Calculate revenue lost due to non-premium users
  const revenueLostToNonPremium = potentialRevenue - standardRevenue;
  
  // Format time-based data for return
  const dailyData = Array.from(dailyRevenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
    
  const weeklyData = Array.from(weeklyRevenueMap.entries())
    .map(([week, revenue]) => ({ week, revenue }))
    .sort((a, b) => a.week.localeCompare(b.week));
    
  const monthlyData = Array.from(monthlyRevenueMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  return {
    totalRevenue,
    transactionCount,
    averageFeePerTransaction,
    premiumRevenue,
    standardRevenue,
    currentMonthRevenue,
    previousMonthRevenue,
    potentialRevenue,
    revenueLostToNonPremium,
    revenueByType: {
      send: sendRevenue,
      receive: receiveRevenue,
      trade: tradeRevenue,
      exchange: exchangeRevenue,
      cardTransaction: cardTransactionRevenue,
      investment: investmentRevenue
    },
    subscriptionRevenue,
    premiumUserCount,
    totalUsers,
    premiumConversionRate,
    projectedAnnualRevenue,
    timeBasedData: {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData
    }
  };
}

// Helper function to get the week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to get current day of year
function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

async function getAllTransactions(): Promise<Transaction[]> {
  try {
    return await storage.getAllTransactions();
  } catch (error) {
    console.error("Error retrieving transactions for revenue calculation:", error);
    return [];
  }
}

async function getAllUsers(): Promise<User[]> {
  try {
    return await storage.getAllUsers();
  } catch (error) {
    console.error("Error retrieving users for revenue calculation:", error);
    return [];
  }
}

async function getCardTransactions(): Promise<CardTransaction[]> {
  try {
    // Assume we have this method, or we need to add it
    return await storage.getAllCardTransactions();
  } catch (error) {
    console.error("Error retrieving card transactions for revenue calculation:", error);
    return [];
  }
}

