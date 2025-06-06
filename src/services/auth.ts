import { ApiClient } from './api';
import { User, LoginResponse } from '../types';
import { VerificationService } from './verification';

export class AuthService {
  private api: ApiClient;
  
  constructor() {
    this.api = new ApiClient();
  }

  async register(
    name: string, 
    email: string, 
    password: string, 
    twoFactorEnabled: boolean,
    twoFactorMethod: '2fa_email' | '2fa_totp'
  ): Promise<{ totpQRCode?: string }> {
    try {
      let totpSecret: string | undefined;
      let totpQRCode: string | undefined;

      if (twoFactorEnabled && twoFactorMethod === '2fa_totp') {
        totpSecret = VerificationService.generateTOTPSecret();
        totpQRCode = await VerificationService.generateTOTPQRCode(email, totpSecret);
      }

      await this.api.request('/auth/register', 'POST', {
        name,
        email,
        password,
        twoFactorEnabled,
        twoFactorMethod,
        totpSecret
      });

      return { totpQRCode };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.api.request<LoginResponse>('/auth/login', 'POST', {
        email,
        password
      });
      
      if (!response.requireTwoFactor && response.token) {
        this.api.setAuthToken(response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyTwoFactor(email: string, code: string): Promise<LoginResponse> {
    try {
      const response = await this.api.request<LoginResponse>('/auth/verify-2fa', 'POST', {
        email,
        code
      });
      
      if (response.token) {
        this.api.setAuthToken(response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.request('/auth/logout', 'POST');
      this.api.clearAuthToken();
      localStorage.removeItem('currentUser');
    } catch (error) {
      this.api.clearAuthToken();
      localStorage.removeItem('currentUser');
      throw error;
    }
  }

  initializeDefaultUser(): void {
    const usersString = localStorage.getItem('legalChatUsers');
    let users = usersString ? JSON.parse(usersString) : {};
    
    if (!users['user@example.com']) {
      users['user@example.com'] = {
        name: 'Demo User',
        email: 'user@example.com',
        password: 'password123',
        twoFactorEnabled: false,
        twoFactorMethod: null,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('legalChatUsers', JSON.stringify(users));
      console.log('Default user created: user@example.com / password123');
    }
  }
}
