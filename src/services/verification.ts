import sgMail from '@sendgrid/mail';
import { authenticator } from 'otplib';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface VerificationAttempt {
  userId: string;
  attempts: number;
  lastAttempt: number;
}

const attempts = new Map<string, VerificationAttempt>();

export class VerificationService {
  private static generateEmailCode(): string {
    return Math.random().toString().slice(2, 8);
  }

  private static async storeEmailCode(userId: string, code: string): Promise<void> {
    const { error } = await supabase
      .from('verification_codes')
      .insert([
        {
          user_id: userId,
          code: code,
          expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiration
        }
      ]);

    if (error) throw new Error('Failed to store verification code');
  }

  private static async isEmailCodeValid(userId: string, code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return false;
    return !!data;
  }

  private static async deleteEmailCode(userId: string): Promise<void> {
    await supabase
      .from('verification_codes')
      .delete()
      .eq('user_id', userId);
  }

  private static checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const attempt = attempts.get(userId);

    if (!attempt) {
      attempts.set(userId, { userId, attempts: 1, lastAttempt: now });
      return true;
    }

    if (now - attempt.lastAttempt > RATE_LIMIT_WINDOW) {
      attempts.set(userId, { userId, attempts: 1, lastAttempt: now });
      return true;
    }

    if (attempt.attempts >= MAX_ATTEMPTS) {
      return false;
    }

    attempt.attempts += 1;
    attempt.lastAttempt = now;
    attempts.set(userId, attempt);
    return true;
  }

  static generateTOTPSecret(): string {
    return authenticator.generateSecret();
  }

  static async generateTOTPQRCode(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'LawHelp', secret);
    try {
      return await QRCode.toDataURL(otpauth);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static verifyTOTP(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return false;
    }
  }

  static async sendEmailCode(userId: string, email: string): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Too many verification attempts. Please try again later.');
    }

    const code = this.generateEmailCode();
    await this.storeEmailCode(userId, code);

    const msg = {
      to: email,
      from: 'noreply@lawhelp.com',
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p style="font-size: 24px; font-weight: bold; color: #43C59E;">${code}</p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification code');
    }
  }

  static async verifyEmailCode(userId: string, code: string): Promise<boolean> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Too many verification attempts. Please try again later.');
    }

    const isValid = await this.isEmailCodeValid(userId, code);
    if (isValid) {
      await this.deleteEmailCode(userId);
      attempts.delete(userId); // Reset attempts on successful verification
    }

    return isValid;
  }
}
