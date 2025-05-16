import { 
  users, User, InsertUser, 
  linkedAccounts, LinkedAccount, InsertLinkedAccount,
  transactions, Transaction, InsertTransaction,
  investments, Investment, InsertInvestment,
  courses, Course, InsertCourse,
  lessons, Lesson, InsertLesson,
  userCourseProgress, UserCourseProgress, InsertUserCourseProgress,
  userAchievements, UserAchievement, InsertUserAchievement,
  virtualCards, VirtualCard, InsertVirtualCard,
  cardTransactions, CardTransaction, InsertCardTransaction,
  cryptoWallets, CryptoWallet, InsertCryptoWallet,
  cryptoTransactions, CryptoTransaction, InsertCryptoTransaction
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  updateUserStripeInfo(id: number, info: { stripeCustomerId: string }): Promise<User | undefined>;
  updateUserSubscription(id: number, data: { 
    stripeSubscriptionId: string, 
    isPremium: boolean, 
    premiumExpiry: Date 
  }): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Card operations
  updateCardBalance(id: number, amount: number): Promise<VirtualCard | undefined>;
  
  // Linked account operations
  createLinkedAccount(linkedAccount: InsertLinkedAccount): Promise<LinkedAccount>;
  getLinkedAccountsByUserId(userId: number): Promise<LinkedAccount[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getRecentTransactionsByUserId(userId: number, limit: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Card transaction operations
  getAllCardTransactions(): Promise<CardTransaction[]>;
  
  // Investment operations
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getInvestmentsByUserId(userId: number): Promise<Investment[]>;
  updateInvestmentPrice(id: number, currentPrice: number): Promise<Investment | undefined>;
  updateInvestment(id: number, updates: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: number): Promise<boolean>;
  
  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  
  // Lesson operations
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getLessonsByCourseId(courseId: number): Promise<Lesson[]>;
  updateLesson(id: number, lesson: Partial<InsertLesson>): Promise<Lesson | undefined>;
  
  // User course progress operations
  createUserCourseProgress(progress: InsertUserCourseProgress): Promise<UserCourseProgress>;
  getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined>;
  getUserCourseProgressByUserId(userId: number): Promise<UserCourseProgress[]>;
  updateUserCourseProgress(id: number, progress: Partial<InsertUserCourseProgress>): Promise<UserCourseProgress | undefined>;
  
  // User achievement operations
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]>;
  
  // Virtual card operations
  createVirtualCard(card: InsertVirtualCard): Promise<VirtualCard>;
  getVirtualCardsByUserId(userId: number): Promise<VirtualCard[]>;
  getVirtualCardById(id: number): Promise<VirtualCard | undefined>;
  updateVirtualCard(id: number, updates: Partial<InsertVirtualCard>): Promise<VirtualCard | undefined>;
  deactivateVirtualCard(id: number): Promise<VirtualCard | undefined>;
  
  // Card transaction operations
  createCardTransaction(transaction: InsertCardTransaction): Promise<CardTransaction>;
  getCardTransactionsByCardId(cardId: number): Promise<CardTransaction[]>;
  getRecentCardTransactionsByUserId(userId: number, limit: number): Promise<CardTransaction[]>;
  
  // Crypto wallet operations
  createCryptoWallet(wallet: InsertCryptoWallet): Promise<CryptoWallet>;
  getCryptoWalletById(id: number): Promise<CryptoWallet | undefined>;
  getCryptoWalletsByUserId(userId: number): Promise<CryptoWallet[]>;
  getCryptoWalletByAddress(address: string): Promise<CryptoWallet | undefined>;
  updateCryptoWalletBalance(id: number, amount: number): Promise<CryptoWallet | undefined>;
  
  // Crypto transaction operations
  createCryptoTransaction(transaction: InsertCryptoTransaction): Promise<CryptoTransaction>;
  getCryptoTransactionsByUserId(userId: number): Promise<CryptoTransaction[]>;
  getRecentCryptoTransactionsByUserId(userId: number, limit: number): Promise<CryptoTransaction[]>;
  getCryptoTransactionsByWalletId(walletId: number): Promise<CryptoTransaction[]>;
  updateCryptoTransactionStatus(id: number, status: string, txHash?: string): Promise<CryptoTransaction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private linkedAccounts: Map<number, LinkedAccount>;
  private transactions: Map<number, Transaction>;
  private investments: Map<number, Investment>;
  private courses: Map<number, Course>;
  private lessons: Map<number, Lesson>;
  private userCourseProgresses: Map<number, UserCourseProgress>;
  private userAchievements: Map<number, UserAchievement>;
  private virtualCards: Map<number, VirtualCard>;
  private cardTransactions: Map<number, CardTransaction>;
  private cryptoWallets: Map<number, CryptoWallet>;
  private cryptoTransactions: Map<number, CryptoTransaction>;
  
  private userIdCounter: number;
  private linkedAccountIdCounter: number;
  private transactionIdCounter: number;
  private investmentIdCounter: number;
  private courseIdCounter: number;
  private lessonIdCounter: number;
  private progressIdCounter: number;
  private achievementIdCounter: number;
  private virtualCardIdCounter: number;
  private cardTransactionIdCounter: number;
  private cryptoWalletIdCounter: number;
  private cryptoTransactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.linkedAccounts = new Map();
    this.transactions = new Map();
    this.investments = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.userCourseProgresses = new Map();
    this.userAchievements = new Map();
    this.virtualCards = new Map();
    this.cardTransactions = new Map();
    this.cryptoWallets = new Map();
    this.cryptoTransactions = new Map();
    
    this.userIdCounter = 1;
    this.linkedAccountIdCounter = 1;
    this.transactionIdCounter = 1;
    this.investmentIdCounter = 1;
    this.courseIdCounter = 1;
    this.lessonIdCounter = 1;
    this.progressIdCounter = 1;
    this.achievementIdCounter = 1;
    this.virtualCardIdCounter = 1;
    this.cardTransactionIdCounter = 1;
    this.cryptoWalletIdCounter = 1;
    this.cryptoTransactionIdCounter = 1;
    
    // Seed some initial data for demo purposes
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      balance: 2458.50, // Start with some balance for demo
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isPremium: false,
      premiumExpiry: null,
      referralCode: null,
      referredBy: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      balance: user.balance + amount
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserStripeInfo(id: number, info: { stripeCustomerId: string }): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      stripeCustomerId: info.stripeCustomerId
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserSubscription(id: number, data: { 
    stripeSubscriptionId: string, 
    isPremium: boolean, 
    premiumExpiry: Date 
  }): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      stripeSubscriptionId: data.stripeSubscriptionId,
      isPremium: data.isPremium,
      premiumExpiry: data.premiumExpiry
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Linked account operations
  async createLinkedAccount(insertLinkedAccount: InsertLinkedAccount): Promise<LinkedAccount> {
    const id = this.linkedAccountIdCounter++;
    const linkedAccount: LinkedAccount = {
      ...insertLinkedAccount,
      id,
      createdAt: new Date()
    };
    this.linkedAccounts.set(id, linkedAccount);
    return linkedAccount;
  }

  async getLinkedAccountsByUserId(userId: number): Promise<LinkedAccount[]> {
    return Array.from(this.linkedAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }
  
  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    
    // Ensure all fields meet the expected types
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      fee: insertTransaction.fee ?? null,
      recipient: insertTransaction.recipient ?? null,
      sender: insertTransaction.sender ?? null,
      note: insertTransaction.note ?? null,
      isInstantTransfer: insertTransaction.isInstantTransfer ?? false,
      createdAt: new Date()
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentTransactionsByUserId(userId: number, limit: number): Promise<Transaction[]> {
    return (await this.getTransactionsByUserId(userId)).slice(0, limit);
  }
  
  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Investment operations
  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = this.investmentIdCounter++;
    const investment: Investment = {
      ...insertInvestment,
      id,
      createdAt: new Date()
    };
    this.investments.set(id, investment);
    return investment;
  }

  async getInvestmentsByUserId(userId: number): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(
      (investment) => investment.userId === userId
    );
  }

  async updateInvestmentPrice(id: number, currentPrice: number): Promise<Investment | undefined> {
    const investment = this.investments.get(id);
    if (!investment) return undefined;
    
    const updatedInvestment: Investment = {
      ...investment,
      currentPrice
    };
    
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }
  
  async updateInvestment(id: number, updates: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const investment = this.investments.get(id);
    if (!investment) return undefined;
    
    const updatedInvestment: Investment = {
      ...investment,
      ...updates
    };
    
    this.investments.set(id, updatedInvestment);
    return updatedInvestment;
  }
  
  async deleteInvestment(id: number): Promise<boolean> {
    return this.investments.delete(id);
  }
  
  // Course operations
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const course: Course = {
      ...insertCourse,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: insertCourse.imageUrl || null,
      isPublished: insertCourse.isPublished ?? false,
      isPremium: insertCourse.isPremium ?? false
    };
    this.courses.set(id, course);
    return course;
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getPublishedCourses(): Promise<Course[]> {
    return Array.from(this.courses.values())
      .filter(course => course.isPublished);
  }
  
  async updateCourse(id: number, courseUpdate: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = await this.getCourse(id);
    if (!course) return undefined;
    
    const updatedCourse: Course = {
      ...course,
      ...courseUpdate,
      updatedAt: new Date()
    };
    
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  // Lesson operations
  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.lessonIdCounter++;
    const lesson: Lesson = {
      ...insertLesson,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      videoUrl: insertLesson.videoUrl || null,
      quizData: insertLesson.quizData || null
    };
    this.lessons.set(id, lesson);
    return lesson;
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async getLessonsByCourseId(courseId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }
  
  async updateLesson(id: number, lessonUpdate: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const lesson = await this.getLesson(id);
    if (!lesson) return undefined;
    
    const updatedLesson: Lesson = {
      ...lesson,
      ...lessonUpdate,
      updatedAt: new Date()
    };
    
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }
  
  // User course progress operations
  async createUserCourseProgress(insertProgress: InsertUserCourseProgress): Promise<UserCourseProgress> {
    const id = this.progressIdCounter++;
    const progress: UserCourseProgress = {
      ...insertProgress,
      id,
      lastCompletedLessonId: insertProgress.lastCompletedLessonId || null,
      completedLessons: insertProgress.completedLessons || [],
      quizScores: insertProgress.quizScores || {},
      progress: insertProgress.progress || 0,
      isCompleted: insertProgress.isCompleted || false,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      completedAt: null
    };
    this.userCourseProgresses.set(id, progress);
    return progress;
  }
  
  async getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    return Array.from(this.userCourseProgresses.values())
      .find(progress => progress.userId === userId && progress.courseId === courseId);
  }
  
  async getUserCourseProgressByUserId(userId: number): Promise<UserCourseProgress[]> {
    return Array.from(this.userCourseProgresses.values())
      .filter(progress => progress.userId === userId);
  }
  
  async updateUserCourseProgress(id: number, progressUpdate: Partial<InsertUserCourseProgress>): Promise<UserCourseProgress | undefined> {
    const progress = this.userCourseProgresses.get(id);
    if (!progress) return undefined;
    
    const updatedProgress: UserCourseProgress = {
      ...progress,
      ...progressUpdate,
      lastAccessedAt: new Date()
    };
    
    this.userCourseProgresses.set(id, updatedProgress);
    return updatedProgress;
  }
  
  // User achievement operations
  async createUserAchievement(insertAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.achievementIdCounter++;
    const achievement: UserAchievement = {
      ...insertAchievement,
      id,
      metadata: insertAchievement.metadata || {},
      awardedAt: new Date()
    };
    this.userAchievements.set(id, achievement);
    return achievement;
  }
  
  async getUserAchievementsByUserId(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime());
  }

  // Virtual card operations
  async createVirtualCard(insertCard: InsertVirtualCard): Promise<VirtualCard> {
    const id = this.virtualCardIdCounter++;
    const card: VirtualCard = {
      ...insertCard,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      isVirtual: true,
      dailyLimit: insertCard.dailyLimit || 1000,
      monthlyLimit: insertCard.monthlyLimit || 5000
    };
    this.virtualCards.set(id, card);
    return card;
  }

  async getVirtualCardsByUserId(userId: number): Promise<VirtualCard[]> {
    return Array.from(this.virtualCards.values())
      .filter(card => card.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getVirtualCardById(id: number): Promise<VirtualCard | undefined> {
    return this.virtualCards.get(id);
  }

  async updateVirtualCard(id: number, updates: Partial<InsertVirtualCard>): Promise<VirtualCard | undefined> {
    const card = await this.getVirtualCardById(id);
    if (!card) return undefined;
    
    const updatedCard: VirtualCard = {
      ...card,
      ...updates,
      updatedAt: new Date()
    };
    
    this.virtualCards.set(id, updatedCard);
    return updatedCard;
  }

  async updateCardBalance(id: number, amount: number): Promise<VirtualCard | undefined> {
    const card = await this.getVirtualCardById(id);
    if (!card) return undefined;
    
    const updatedCard: VirtualCard = {
      ...card,
      balance: card.balance + amount,
      updatedAt: new Date()
    };
    
    this.virtualCards.set(id, updatedCard);
    return updatedCard;
  }

  async deactivateVirtualCard(id: number): Promise<VirtualCard | undefined> {
    const card = await this.getVirtualCardById(id);
    if (!card) return undefined;
    
    const updatedCard: VirtualCard = {
      ...card,
      isActive: false,
      updatedAt: new Date()
    };
    
    this.virtualCards.set(id, updatedCard);
    return updatedCard;
  }

  // Card transaction operations
  async createCardTransaction(insertTransaction: InsertCardTransaction): Promise<CardTransaction> {
    const id = this.cardTransactionIdCounter++;
    
    // Get the card to track balance changes
    const card = await this.getVirtualCardById(insertTransaction.cardId);
    if (!card) {
      throw new Error("Card not found");
    }
    
    // Get user's balance from the account - card balance should reflect user's ability to pay
    const user = await this.getUser(card.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Card balance should match user's actual balance, not a predetermined default
    // If the card balance field isn't set, initialize it with the user's balance
    const currentCardBalance = card.balance ?? user.balance;
    const previousBalance = currentCardBalance;
    
    // Calculate new balance (deduct for purchases, add for refunds)
    let amountChange = -insertTransaction.amount; // Default for purchases
    if (insertTransaction.transactionType === 'refund') {
      amountChange = insertTransaction.amount; // Positive for refunds
    }
    
    // Update card balance and user balance
    await this.updateCardBalance(card.id, amountChange);
    // Also update user balance for consistency
    await this.updateUserBalance(user.id, amountChange);
    
    const newBalance = previousBalance + amountChange;
    
    const transaction: CardTransaction = {
      ...insertTransaction,
      id,
      previousBalance: previousBalance,
      newBalance: newBalance,
      createdAt: new Date(),
      merchantCategory: insertTransaction.merchantCategory || null,
      isInstantTransfer: insertTransaction.isInstantTransfer ?? false
    };
    
    this.cardTransactions.set(id, transaction);
    return transaction;
  }

  async getCardTransactionsByCardId(cardId: number): Promise<CardTransaction[]> {
    return Array.from(this.cardTransactions.values())
      .filter(transaction => transaction.cardId === cardId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentCardTransactionsByUserId(userId: number, limit: number): Promise<CardTransaction[]> {
    // Get all user's cards
    const cards = await this.getVirtualCardsByUserId(userId);
    if (cards.length === 0) return [];
    
    // Get all transactions for all cards
    const cardIds = cards.map(card => card.id);
    const transactions = Array.from(this.cardTransactions.values())
      .filter(transaction => cardIds.includes(transaction.cardId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return transactions.slice(0, limit);
  }
  
  async getAllCardTransactions(): Promise<CardTransaction[]> {
    return Array.from(this.cardTransactions.values());
  }
  
  // Crypto wallet operations
  async createCryptoWallet(insertWallet: InsertCryptoWallet): Promise<CryptoWallet> {
    const id = this.cryptoWalletIdCounter++;
    const wallet: CryptoWallet = {
      ...insertWallet,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      balance: insertWallet.balance || 0,
      privateKey: insertWallet.privateKey || null,
      publicKey: insertWallet.publicKey || null,
      isExternal: insertWallet.isExternal || false,
      platformName: insertWallet.platformName || null
    };
    this.cryptoWallets.set(id, wallet);
    return wallet;
  }
  
  async getCryptoWalletById(id: number): Promise<CryptoWallet | undefined> {
    return this.cryptoWallets.get(id);
  }
  
  async getCryptoWalletsByUserId(userId: number): Promise<CryptoWallet[]> {
    return Array.from(this.cryptoWallets.values())
      .filter(wallet => wallet.userId === userId);
  }
  
  async getCryptoWalletByAddress(address: string): Promise<CryptoWallet | undefined> {
    return Array.from(this.cryptoWallets.values())
      .find(wallet => wallet.walletAddress === address);
  }
  
  async updateCryptoWalletBalance(id: number, amount: number): Promise<CryptoWallet | undefined> {
    const wallet = await this.getCryptoWalletById(id);
    if (!wallet) return undefined;
    
    const updatedWallet: CryptoWallet = {
      ...wallet,
      balance: wallet.balance + amount,
      updatedAt: new Date()
    };
    
    this.cryptoWallets.set(id, updatedWallet);
    return updatedWallet;
  }
  
  // Crypto transaction operations
  async createCryptoTransaction(insertTransaction: InsertCryptoTransaction): Promise<CryptoTransaction> {
    const id = this.cryptoTransactionIdCounter++;
    const transaction: CryptoTransaction = {
      ...insertTransaction,
      id,
      txHash: insertTransaction.txHash || null,
      networkFee: insertTransaction.networkFee || null,
      recipientWalletId: insertTransaction.recipientWalletId || null,
      recipientAddress: insertTransaction.recipientAddress || null,
      platformName: insertTransaction.platformName || null,
      isInstantTransfer: insertTransaction.isInstantTransfer || false,
      isCardPurchase: insertTransaction.isCardPurchase || false,
      cardId: insertTransaction.cardId || null,
      createdAt: new Date()
    };
    this.cryptoTransactions.set(id, transaction);
    return transaction;
  }
  
  async getCryptoTransactionsByUserId(userId: number): Promise<CryptoTransaction[]> {
    return Array.from(this.cryptoTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getRecentCryptoTransactionsByUserId(userId: number, limit: number): Promise<CryptoTransaction[]> {
    return (await this.getCryptoTransactionsByUserId(userId)).slice(0, limit);
  }
  
  async getCryptoTransactionsByWalletId(walletId: number): Promise<CryptoTransaction[]> {
    return Array.from(this.cryptoTransactions.values())
      .filter(transaction => 
        transaction.walletId === walletId || 
        transaction.recipientWalletId === walletId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async updateCryptoTransactionStatus(id: number, status: string, txHash?: string): Promise<CryptoTransaction | undefined> {
    const transaction = this.cryptoTransactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: CryptoTransaction = {
      ...transaction,
      status,
      txHash: txHash || transaction.txHash
    };
    
    this.cryptoTransactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  // Seed some initial data for demo
  private seedData() {
    // Create demo user
    const demoUser: User = {
      id: this.userIdCounter++,
      username: 'demouser',
      password: 'password123', // In a real app, this would be hashed
      email: 'demo@example.com',
      firstName: 'John',
      lastName: 'Doe',
      balance: 2458.50,
      isPremium: false,
      premiumExpiry: null,
      referralCode: 'DEMO123', // Demo referral code
      referredBy: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create demo virtual cards
    const demoCard: VirtualCard = {
      id: this.virtualCardIdCounter++,
      userId: demoUser.id,
      cardNumber: '4111' + Math.random().toString().substring(2, 6) + '1111' + Math.random().toString().substring(2, 6),
      cardholderName: `${demoUser.firstName} ${demoUser.lastName}`,
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: Math.floor(Math.random() * 900 + 100).toString(), // Random 3-digit CVV
      balance: 5000, // Default starting balance
      isActive: true,
      dailyLimit: 500.00,
      monthlyLimit: 10000.00,
      isVirtual: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.virtualCards.set(demoCard.id, demoCard);
    
    // Create some card transactions
    const cardTransactions: Array<Omit<CardTransaction, 'id'>> = [
      {
        cardId: demoCard.id,
        amount: 24.99,
        merchantName: 'Coffee Shop',
        merchantCategory: 'food',
        status: 'completed',
        transactionType: 'purchase',
        transactionId: 'txn_' + Math.random().toString(36).substring(2),
        isInstantTransfer: true,
        previousBalance: 5000.00,
        newBalance: 4975.01,
        createdAt: new Date(Date.now() - 2 * 86400000) // 2 days ago
      },
      {
        cardId: demoCard.id,
        amount: 75.50,
        merchantName: 'Grocery Store',
        merchantCategory: 'grocery',
        status: 'completed',
        transactionType: 'purchase',
        transactionId: 'txn_' + Math.random().toString(36).substring(2),
        isInstantTransfer: false,
        previousBalance: 4975.01,
        newBalance: 4899.51,
        createdAt: new Date(Date.now() - 5 * 86400000) // 5 days ago
      },
      {
        cardId: demoCard.id,
        amount: 9.99,
        merchantName: 'Movie Streaming',
        merchantCategory: 'entertainment',
        status: 'completed',
        transactionType: 'purchase',
        transactionId: 'txn_' + Math.random().toString(36).substring(2),
        isInstantTransfer: false,
        previousBalance: 4899.51,
        newBalance: 4889.52,
        createdAt: new Date(Date.now() - 7 * 86400000) // 7 days ago
      }
    ];
    
    cardTransactions.forEach(transaction => {
      this.cardTransactions.set(this.cardTransactionIdCounter, {
        ...transaction,
        id: this.cardTransactionIdCounter++
      });
    });
    
    // Create some transactions
    const transactions: Omit<Transaction, 'id'>[] = [
      {
        userId: demoUser.id,
        type: 'receive',
        amount: 250,
        fee: 32.50,
        recipient: demoUser.username,
        sender: 'James',
        note: 'Payment for design work',
        status: 'completed',
        isInstantTransfer: false,
        createdAt: new Date()
      },
      {
        userId: demoUser.id,
        type: 'send',
        amount: 120,
        fee: 15.60,
        recipient: 'Sarah',
        sender: demoUser.username,
        note: 'Dinner last night',
        status: 'completed',
        isInstantTransfer: true,
        createdAt: new Date(Date.now() - 86400000) // Yesterday
      },
      {
        userId: demoUser.id,
        type: 'trade',
        amount: 350,
        fee: 45.50,
        recipient: null,
        sender: null,
        note: 'Bought ETH',
        status: 'completed',
        isInstantTransfer: false,
        createdAt: new Date(Date.now() - 3 * 86400000) // 3 days ago
      }
    ];
    
    transactions.forEach(transaction => {
      this.transactions.set(this.transactionIdCounter, {
        ...transaction,
        id: this.transactionIdCounter++
      });
    });
    
    // Create some investments
    const investments: Omit<Investment, 'id'>[] = [
      {
        userId: demoUser.id,
        assetType: 'crypto',
        assetName: 'Bitcoin',
        assetSymbol: 'BTC',
        quantity: 0.05,
        purchasePrice: 36500,
        currentPrice: 37810.25,
        createdAt: new Date(Date.now() - 30 * 86400000)
      },
      {
        userId: demoUser.id,
        assetType: 'crypto',
        assetName: 'Ethereum',
        assetSymbol: 'ETH',
        quantity: 0.35,
        purchasePrice: 1900,
        currentPrice: 1859.30,
        createdAt: new Date(Date.now() - 15 * 86400000)
      },
      {
        userId: demoUser.id,
        assetType: 'stock',
        assetName: 'Tech ETF',
        assetSymbol: 'TECH',
        quantity: 5.2,
        purchasePrice: 180,
        currentPrice: 188.5,
        createdAt: new Date(Date.now() - 45 * 86400000)
      }
    ];
    
    investments.forEach(investment => {
      this.investments.set(this.investmentIdCounter, {
        ...investment,
        id: this.investmentIdCounter++
      });
    });
    
    // Create some crypto wallets
    const cryptoWallets: Omit<CryptoWallet, 'id'>[] = [
      {
        userId: demoUser.id,
        cryptoType: 'BTC',
        walletAddress: 'bc1' + Math.random().toString(36).substring(2, 34),
        balance: 0.05,
        privateKey: null, // In a real app, this would be encrypted
        publicKey: null,
        isExternal: false,
        platformName: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: demoUser.id,
        cryptoType: 'ETH',
        walletAddress: '0x' + Math.random().toString(36).substring(2, 42),
        balance: 0.35,
        privateKey: null,
        publicKey: null,
        isExternal: false,
        platformName: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: demoUser.id,
        cryptoType: 'ETH',
        walletAddress: '0x' + Math.random().toString(36).substring(2, 42),
        balance: 0,
        privateKey: null,
        publicKey: null,
        isExternal: true,
        platformName: 'Coinbase',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const walletMap = new Map<string, number>();
    
    cryptoWallets.forEach(wallet => {
      const id = this.cryptoWalletIdCounter++;
      walletMap.set(wallet.cryptoType, id);
      this.cryptoWallets.set(id, {
        ...wallet,
        id
      });
    });
    
    // Create some crypto transactions
    const cryptoTransactions: Omit<CryptoTransaction, 'id'>[] = [
      {
        userId: demoUser.id,
        walletId: walletMap.get('BTC')!,
        recipientWalletId: null,
        recipientAddress: 'bc1' + Math.random().toString(36).substring(2, 34),
        cryptoType: 'BTC',
        amount: 0.01,
        usdAmount: 378.10,
        fee: 49.15,
        networkFee: 0.0001,
        txHash: '0x' + Math.random().toString(36).substring(2, 66),
        status: 'completed',
        type: 'send',
        platformName: null,
        isInstantTransfer: false,
        isCardPurchase: false,
        cardId: null,
        createdAt: new Date(Date.now() - 10 * 86400000)
      },
      {
        userId: demoUser.id,
        walletId: walletMap.get('ETH')!,
        recipientWalletId: null,
        recipientAddress: null,
        cryptoType: 'ETH',
        amount: 0.25,
        usdAmount: 475.00,
        fee: 61.75,
        networkFee: 0.002,
        txHash: '0x' + Math.random().toString(36).substring(2, 66),
        status: 'completed',
        type: 'purchase',
        platformName: null,
        isInstantTransfer: true,
        isCardPurchase: true,
        cardId: demoCard.id,
        createdAt: new Date(Date.now() - 5 * 86400000)
      },
      {
        userId: demoUser.id,
        walletId: walletMap.get('ETH')!,
        recipientWalletId: null,
        recipientAddress: '0x' + Math.random().toString(36).substring(2, 42),
        cryptoType: 'ETH',
        amount: 0.1,
        usdAmount: 186.00,
        fee: 24.18,
        networkFee: 0.001,
        txHash: '0x' + Math.random().toString(36).substring(2, 66),
        status: 'completed',
        type: 'send',
        platformName: 'Venmo',
        isInstantTransfer: true,
        isCardPurchase: false,
        cardId: null,
        createdAt: new Date(Date.now() - 2 * 86400000)
      }
    ];
    
    cryptoTransactions.forEach(transaction => {
      this.cryptoTransactions.set(this.cryptoTransactionIdCounter, {
        ...transaction,
        id: this.cryptoTransactionIdCounter++
      });
    });
    
    // Create seed financial education courses
    this.seedFinancialCourses(demoUser.id);
  }
  
  private seedFinancialCourses(userId: number) {
    // Create beginner financial course
    const beginnerCourse: Course = {
      id: this.courseIdCounter++,
      title: "Financial Literacy 101",
      description: "Learn the basics of personal finance, budgeting, and saving strategies.",
      difficulty: "beginner",
      imageUrl: null,
      isPremium: false,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.set(beginnerCourse.id, beginnerCourse);
    
    // Create intermediate financial course
    const intermediateCourse: Course = {
      id: this.courseIdCounter++,
      title: "Investment Strategies",
      description: "Understand different investment options and build a balanced portfolio.",
      difficulty: "intermediate",
      imageUrl: null,
      isPremium: true,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.set(intermediateCourse.id, intermediateCourse);
    
    // Create advanced financial course
    const advancedCourse: Course = {
      id: this.courseIdCounter++,
      title: "Advanced Tax Strategies",
      description: "Learn advanced techniques to optimize your taxes and maximize returns.",
      difficulty: "advanced",
      imageUrl: null,
      isPremium: true,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.set(advancedCourse.id, advancedCourse);
    
    // Create lessons for the beginner course
    const beginnerLessons: Omit<Lesson, 'id'>[] = [
      {
        courseId: beginnerCourse.id,
        title: "Understanding Income and Expenses",
        content: "In this lesson, we'll explore the basics of tracking your income and expenses to build a strong financial foundation.",
        order: 1,
        type: "text",
        videoUrl: null,
        quizData: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseId: beginnerCourse.id,
        title: "Building Your First Budget",
        content: "Learn how to create a practical budget that fits your lifestyle and helps you achieve your financial goals.",
        order: 2,
        type: "text",
        videoUrl: null,
        quizData: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseId: beginnerCourse.id,
        title: "Emergency Funds: Your Financial Safety Net",
        content: "Discover why emergency funds are essential and how to build one that protects you from unexpected expenses.",
        order: 3,
        type: "text",
        videoUrl: null,
        quizData: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        courseId: beginnerCourse.id,
        title: "Understanding Financial Fees",
        content: "Learn about different types of financial fees and how they impact your bottom line.",
        order: 4,
        type: "quiz",
        videoUrl: null,
        quizData: {
          questions: [
            {
              question: "What percentage fee does Ninja Wallet charge for small transfers (under $100)?",
              options: ["5%", "10%", "15%", "20%"],
              correctAnswer: 2
            },
            {
              question: "How much can you save on fees by becoming a premium user?",
              options: ["Nothing", "1-2%", "5-7%", "Up to 47% on smaller transactions"],
              correctAnswer: 3
            },
            {
              question: "What is the standard markup on currency exchanges for regular users?",
              options: ["1%", "3%", "5%", "7%"],
              correctAnswer: 1
            }
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    beginnerLessons.forEach(lesson => {
      this.lessons.set(this.lessonIdCounter, {
        ...lesson,
        id: this.lessonIdCounter++
      });
    });
    
    // Create sample progress for demo user
    const userProgress: UserCourseProgress = {
      id: this.progressIdCounter++,
      userId: userId,
      courseId: beginnerCourse.id,
      lastCompletedLessonId: 2, // Completed the first two lessons
      progress: 50, // 50% complete
      isCompleted: false,
      completedLessons: [1, 2],
      quizScores: {},
      startedAt: new Date(Date.now() - 7 * 86400000), // Started a week ago
      completedAt: null,
      lastAccessedAt: new Date(Date.now() - 2 * 86400000) // Last accessed 2 days ago
    };
    this.userCourseProgresses.set(userProgress.id, userProgress);
  }
}

import { DatabaseStorage } from "./database-storage";

// Choose which storage implementation to use based on environment
let storageInstance: IStorage;

if (process.env.DATABASE_URL) {
  // Use database storage if DATABASE_URL is available
  console.log('Using Database Storage');
  storageInstance = new DatabaseStorage();
} else {
  // Fall back to memory storage if no database is available
  console.log('Using Memory Storage');
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
