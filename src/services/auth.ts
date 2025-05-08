import { ApiClient } from './api';
import { User, LoginResponse } from '../types';

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
    twoFactorMethod: '2fa_email' | '2fa_sms',
    phone?: string
  ): Promise<void> {
    try {
      await this.api.request('/auth/register', 'POST', {
        name,
        email,
        password,
        twoFactorEnabled,
        twoFactorMethod,
        phone
      });
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
      // Still clear auth data even if API call fails
      this.api.clearAuthToken();
      localStorage.removeItem('currentUser');
      throw error;
    }
  }

  // Initialize default user for demo purposes
  initializeDefaultUser(): void {
    const usersString = localStorage.getItem('legalChatUsers');
    let users = usersString ? JSON.parse(usersString) : {};
    
    // Check if default user exists
    if (!users['user@example.com']) {
      // Create default user
      users['user@example.com'] = {
        name: 'Demo User',
        email: 'user@example.com',
        password: 'password123',
        twoFactorEnabled: false,
        twoFactorMethod: null,
        phone: null,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('legalChatUsers', JSON.stringify(users));
      console.log('Default user created: user@example.com / password123');
    }
  }
}
