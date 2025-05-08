import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
  private static generateCode(): string {
    return Math.random().toString().slice(2, 8);
  }

  private static async storeCode(userId: string, code: string): Promise<void> {
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

  private static async isCodeValid(userId: string, code: string): Promise<boolean> {
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

  private static async deleteCode(userId: string): Promise<void> {
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

  static async sendEmailCode(userId: string, email: string): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Too many verification attempts. Please try again later.');
    }

    const code = this.generateCode();
    await this.storeCode(userId, code);

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

  static async sendSMSCode(userId: string, phone: string): Promise<void> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Too many verification attempts. Please try again later.');
    }

    const code = this.generateCode();
    await this.storeCode(userId, code);

    try {
      await twilioClient.messages.create({
        body: `Your LawHelp verification code is: ${code}. This code will expire in 10 minutes.`,
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send verification code');
    }
  }

  static async verifyCode(userId: string, code: string): Promise<boolean> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Too many verification attempts. Please try again later.');
    }

    const isValid = await this.isCodeValid(userId, code);
    if (isValid) {
      await this.deleteCode(userId);
      attempts.delete(userId); // Reset attempts on successful verification
    }

    return isValid;
  }
}
