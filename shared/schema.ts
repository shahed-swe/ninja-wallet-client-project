import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  balance: real("balance").notNull().default(0),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumExpiry: timestamp("premium_expiry"),
  referralCode: text("referral_code"),
  referredBy: integer("referred_by"),
  stripeCustomerId: text("payment_customer_id"),
  stripeSubscriptionId: text("payment_subscription_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  referralCode: true,
  referredBy: true,
});

// Linked accounts model
export const linkedAccounts = pgTable("linked_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  provider: text("provider").notNull(),
  accountUsername: text("account_username").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLinkedAccountSchema = createInsertSchema(linkedAccounts).pick({
  userId: true,
  provider: true,
  accountUsername: true,
});

// Transactions model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "send", "receive", "trade"
  amount: real("amount").notNull(),
  fee: real("fee"),
  recipient: text("recipient"),
  sender: text("sender"),
  note: text("note"),
  isInstantTransfer: boolean("is_instant_transfer").default(false),
  status: text("status").notNull(), // "pending", "completed", "failed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  fee: true,
  recipient: true,
  sender: true,
  note: true,
  status: true,
  isInstantTransfer: true,
});

// Investments model
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assetType: text("asset_type").notNull(), // "crypto", "stock"
  assetName: text("asset_name").notNull(),
  assetSymbol: text("asset_symbol").notNull(),
  quantity: real("quantity").notNull(),
  purchasePrice: real("purchase_price").notNull(),
  currentPrice: real("current_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvestmentSchema = createInsertSchema(investments).pick({
  userId: true,
  assetType: true,
  assetName: true,
  assetSymbol: true,
  quantity: true,
  purchasePrice: true,
  currentPrice: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LinkedAccount = typeof linkedAccounts.$inferSelect;
export type InsertLinkedAccount = z.infer<typeof insertLinkedAccountSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

// Courses model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  difficulty: text("difficulty").notNull(), // "beginner", "intermediate", "advanced"
  isPremium: boolean("is_premium").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  imageUrl: true,
  difficulty: true,
  isPremium: true,
  isPublished: true,
});

// Lessons model
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(), // "text", "video", "quiz"
  videoUrl: text("video_url"),
  quizData: jsonb("quiz_data"), // For quiz type, contains questions and answers
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLessonSchema = createInsertSchema(lessons).pick({
  courseId: true,
  title: true,
  content: true,
  order: true,
  type: true,
  videoUrl: true,
  quizData: true,
});

// User Course Progress model
export const userCourseProgress = pgTable("user_course_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  lastCompletedLessonId: integer("last_completed_lesson_id"),
  progress: real("progress").default(0).notNull(), // Percentage of completion
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedLessons: jsonb("completed_lessons").default([]), // Array of completed lesson IDs
  quizScores: jsonb("quiz_scores").default({}), // Map of lessonId to quiz score
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
});

export const insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).pick({
  userId: true,
  courseId: true,
  lastCompletedLessonId: true,
  progress: true,
  isCompleted: true,
  completedLessons: true,
  quizScores: true,
});

// User Achievement model
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "course_completion", "quiz_perfect", "streak"
  name: text("name").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default({}), // Additional data related to the achievement
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  type: true,
  name: true,
  description: true,
  metadata: true,
});

// Virtual Debit Card model
export const virtualCards = pgTable("virtual_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardNumber: text("card_number").notNull().unique(),
  cardholderName: text("cardholder_name").notNull(),
  expiryMonth: text("expiry_month").notNull(),
  expiryYear: text("expiry_year").notNull(),
  cvv: text("cvv").notNull(),
  balance: real("balance").default(5000).notNull(), // Card balance with default starting amount
  isActive: boolean("is_active").default(true).notNull(),
  dailyLimit: real("daily_limit").default(500).notNull(),
  monthlyLimit: real("monthly_limit").default(10000).notNull(),
  isVirtual: boolean("is_virtual").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVirtualCardSchema = createInsertSchema(virtualCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Card Transactions model to track card usage
export const cardTransactions = pgTable("card_transactions", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  amount: real("amount").notNull(),
  merchantName: text("merchant_name").notNull(),
  merchantCategory: text("merchant_category"),
  status: text("status").notNull(), // "pending", "completed", "declined", "refunded"
  transactionType: text("transaction_type").notNull(), // "purchase", "refund", "fee"
  transactionId: text("transaction_id").unique().notNull(),
  isInstantTransfer: boolean("is_instant_transfer").default(false),
  previousBalance: real("previous_balance"), // Card balance before transaction
  newBalance: real("new_balance"), // Card balance after transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCardTransactionSchema = createInsertSchema(cardTransactions).omit({
  id: true,
  createdAt: true,
});

// Types for the new models
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type InsertUserCourseProgress = z.infer<typeof insertUserCourseProgressSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Cryptocurrency Wallet model
export const cryptoWallets = pgTable("crypto_wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cryptoType: text("crypto_type").notNull(), // "BTC", "ETH", "USDT", etc.
  walletAddress: text("wallet_address").notNull(),
  balance: real("balance").notNull().default(0),
  privateKey: text("private_key"), // Encrypted in a real implementation
  publicKey: text("public_key"),
  isExternal: boolean("is_external").default(false).notNull(), // If true, wallet is on another platform
  platformName: text("platform_name"), // Name of external platform if isExternal=true
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Cryptocurrency Transaction model
export const cryptoTransactions = pgTable("crypto_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  walletId: integer("wallet_id").notNull(), // Sender's wallet ID
  recipientWalletId: integer("recipient_wallet_id"), // For internal transfers
  recipientAddress: text("recipient_address"), // For external transfers
  cryptoType: text("crypto_type").notNull(), // "BTC", "ETH", "USDT", etc.
  amount: real("amount").notNull(),
  usdAmount: real("usd_amount").notNull(), // USD equivalent at transaction time
  fee: real("fee").notNull(), // Transaction fee in USD
  networkFee: real("network_fee"), // Blockchain network fee in crypto
  txHash: text("tx_hash"), // Blockchain transaction hash
  status: text("status").notNull(), // "pending", "completed", "failed"
  type: text("type").notNull(), // "purchase", "send", "receive", "convert"
  platformName: text("platform_name"), // External platform name if any
  isInstantTransfer: boolean("is_instant_transfer").default(false),
  isCardPurchase: boolean("is_card_purchase").default(false), // If purchased using Ninja Card
  cardId: integer("card_id"), // ID of the card used for purchase, if any
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
  id: true,
  createdAt: true,
});

// Types for crypto models
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;

// Types for card models
export type VirtualCard = typeof virtualCards.$inferSelect;
export type InsertVirtualCard = z.infer<typeof insertVirtualCardSchema>;

export type CardTransaction = typeof cardTransactions.$inferSelect;
export type InsertCardTransaction = z.infer<typeof insertCardTransactionSchema>;
