/**
 * Venmo QR Code Generator
 * 
 * This module creates QR codes for users to link their own Venmo accounts.
 * Each user can only link to their personal Venmo account, not to others'.
 */

import QRCode from 'qrcode';

export interface QROptions {
  amount?: number;
  note?: string;
  venmoUsername: string; // User's own Venmo username (required)
  colorDark?: string;
  colorLight?: string;
  width?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Service for generating QR codes that link to a user's own Venmo account
 */
export class VenmoQRGenerator {
  /**
   * Generate a Venmo QR code URL for a user's own account
   * @param options QR code options
   * @returns Promise resolving to a data URL containing the QR code
   */
  static async generateQRCodeDataURL(options: QROptions): Promise<string> {
    const {
      amount,
      note = 'Ninja Wallet Link',
      venmoUsername, // This must be the user's own Venmo username
      colorDark = '#000000',
      colorLight = '#ffffff',
      width = 300,
      errorCorrectionLevel = 'H'
    } = options;
    
    if (!venmoUsername) {
      throw new Error('Venmo username is required to generate a QR code');
    }
    
    // Format amount with 2 decimal places if provided
    const amountStr = amount ? amount.toFixed(2) : '';
    
    // Create venmo URL with deep linking
    let venmoURL: string;
    
    // Clean the username (remove @ if present)
    const cleanUsername = venmoUsername.startsWith('@') 
      ? venmoUsername.substring(1) 
      : venmoUsername;
    
    // Generate QR code for the user to view their own Venmo profile
    venmoURL = `venmo://users/username/${cleanUsername}`;
    
    // QR code options
    const qrOptions = {
      errorCorrectionLevel,
      width,
      margin: 4,
      color: {
        dark: colorDark,
        light: colorLight
      }
    };
    
    try {
      // Generate QR code as data URL
      const dataURL = await QRCode.toDataURL(venmoURL, qrOptions);
      return dataURL;
    } catch (error) {
      console.error('Failed to generate Venmo QR code:', error);
      throw new Error('QR code generation failed');
    }
  }
  
  /**
   * Generate a QR code for a user to link their own Venmo profile
   * @param venmoUsername The user's Venmo username (required)
   * @returns Promise resolving to a data URL containing the QR code
   */
  static async generateUserProfileQRCode(venmoUsername: string): Promise<string> {
    if (!venmoUsername) {
      throw new Error('Venmo username is required to generate a QR code');
    }
    
    return this.generateQRCodeDataURL({
      venmoUsername,
      note: 'Connect your Venmo account with Ninja Wallet',
      colorDark: '#3D95CE', // Venmo blue
      width: 400
    });
  }
  
  /**
   * Generate a QR code for a user to verify their Venmo account
   * @param venmoUsername The user's Venmo username to verify
   * @param userId The user's Ninja Wallet ID
   * @returns Promise resolving to a data URL containing the QR code
   */
  static async generateAccountVerificationQRCode(venmoUsername: string, userId: number): Promise<string> {
    if (!venmoUsername || !userId) {
      throw new Error('Venmo username and user ID are required for verification');
    }
    
    return this.generateQRCodeDataURL({
      venmoUsername,
      note: `Verify Ninja Wallet account #${userId}`,
      colorDark: '#000000',
      colorLight: '#ffffff',
      width: 500,
      errorCorrectionLevel: 'H'
    });
  }
}