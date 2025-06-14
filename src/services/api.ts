import { User, LoginResponse } from '../types';
import { VerificationService } from './verification';

export class ApiClient {
  private apiBaseUrl: string;
  private authToken: string | null;

  constructor() {
    // In a real app, this would be configured from environment variables
    this.apiBaseUrl = 'http://api.lawhelp.com';
    this.authToken = localStorage.getItem('authToken');
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  async request<T>(endpoint: string, method: string = 'GET', data: any = null): Promise<T> {
    // For demo purposes, we'll simulate API responses
    console.log(`API ${method} request to ${endpoint}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, this would make actual HTTP requests
    if (endpoint.startsWith('/auth')) {
      return this.mockAuthService(endpoint, method, data) as Promise<T>;
    } else if (endpoint.startsWith('/chat')) {
      return this.mockChatService(endpoint, method, data) as Promise<T>;
    } else if (endpoint.startsWith('/history')) {
      return this.mockHistoryService(endpoint, method, data) as Promise<T>;
    } else if (endpoint.startsWith('/user')) {
      return this.mockUserService(endpoint, method, data) as Promise<T>;
    }
    
    throw new Error('Unknown endpoint');
  }

  private async mockAuthService(endpoint: string, method: string, data: any): Promise<any> {
    // Simulate auth microservice
    const usersString = localStorage.getItem('legalChatUsers') || '{}';
    const users = JSON.parse(usersString);
    
    if (endpoint === '/auth/register' && method === 'POST') {
      const { name, email, password, twoFactorEnabled, twoFactorMethod, phone } = data;
      
      if (users[email]) {
        throw new Error('Email already registered');
      }
      
      if (twoFactorEnabled && twoFactorMethod === '2fa_sms' && !phone) {
        throw new Error('Phone number is required for SMS verification');
      }
      
      const userId = crypto.randomUUID();
      
      users[email] = {
        id: userId,
        name,
        email,
        password,
        twoFactorEnabled,
        twoFactorMethod: twoFactorEnabled ? twoFactorMethod : null,
        phone: twoFactorEnabled && twoFactorMethod === '2fa_sms' ? phone : null,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('legalChatUsers', JSON.stringify(users));

      // Send verification code
      if (twoFactorEnabled) {
        try {
          if (twoFactorMethod === '2fa_email') {
            await VerificationService.sendEmailCode(userId, email);
          } else if (twoFactorMethod === '2fa_sms') {
            await VerificationService.sendSMSCode(userId, phone!);
          }
        } catch (error) {
          console.error('Error sending verification code:', error);
          throw new Error('Failed to send verification code');
        }
      }
      
      return { success: true, message: 'Registration successful' };
    }
    
    if (endpoint === '/auth/login' && method === 'POST') {
      const { email, password } = data;
      
      if (!users[email]) {
        throw new Error('Email not found');
      }
      
      if (users[email].password !== password) {
        throw new Error('Incorrect password');
      }
      
      // Check if 2FA is required
      if (users[email].twoFactorEnabled) {
        try {
          if (users[email].twoFactorMethod === '2fa_email') {
            await VerificationService.sendEmailCode(users[email].id, email);
          } else if (users[email].twoFactorMethod === '2fa_sms') {
            await VerificationService.sendSMSCode(users[email].id, users[email].phone!);
          }
        } catch (error) {
          console.error('Error sending verification code:', error);
          throw new Error('Failed to send verification code');
        }

        return { 
          success: true, 
          requireTwoFactor: true,
          twoFactorMethod: users[email].twoFactorMethod,
          message: 'Two-factor authentication required'
        };
      }
      
      // Generate token (in a real app, this would be a JWT)
      const token = btoa(`${email}:${Date.now()}`);
      
      return { 
        success: true, 
        token,
        user: {
          id: users[email].id,
          name: users[email].name,
          email: users[email].email,
          phone: users[email].phone,
          twoFactorEnabled: users[email].twoFactorEnabled,
          twoFactorMethod: users[email].twoFactorMethod
        }
      };
    }
    
    if (endpoint === '/auth/verify-2fa' && method === 'POST') {
      const { email, code } = data;
      
      const user = users[email];
      if (!user) {
        throw new Error('User not found');
      }

      const isValid = await VerificationService.verifyCode(user.id, code);
      if (!isValid) {
        throw new Error('Invalid or expired verification code');
      }

      // Generate token (in a real app, this would be a JWT)
      const token = btoa(`${email}:${Date.now()}`);
      
      return { 
        success: true, 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorMethod: user.twoFactorMethod
        }
      };
    }
    
    if (endpoint === '/auth/logout' && method === 'POST') {
      return { success: true, message: 'Logout successful' };
    }
    
    throw new Error('Unknown auth endpoint');
  }

  private async mockChatService(endpoint: string, method: string, data: any): Promise<any> {
    // In a real app, this would communicate with the chat microservice
    if (endpoint === '/chat/send' && method === 'POST') {
      const { message } = data;
      
      // The real response would come from the chat service
      return { 
        success: true, 
        messageId: Date.now().toString()
      };
    }
    
    throw new Error('Unknown chat endpoint');
  }

  private async mockHistoryService(endpoint: string, method: string, data: any): Promise<any> {
    // Simulate history microservice
    const chatHistoryString = localStorage.getItem('chatHistory') || '{}';
    let chatHistory = JSON.parse(chatHistoryString);
    const currentUserString = localStorage.getItem('currentUser');
    
    if (!currentUserString) {
      throw new Error('User not authenticated');
    }
    
    const currentUser = JSON.parse(currentUserString);
    
    if (endpoint === '/history/list' && method === 'GET') {
      return { 
        success: true, 
        history: chatHistory[currentUser.email] || []
      };
    }
    
    if (endpoint === '/history/add' && method === 'POST') {
      const { query, response } = data;
      
      if (!chatHistory[currentUser.email]) {
        chatHistory[currentUser.email] = [];
      }
      
      const historyItem = {
        id: Date.now(),
        query,
        response,
        timestamp: new Date().toISOString()
      };
      
      chatHistory[currentUser.email].unshift(historyItem);
      
      // Limit history to 20 items
      if (chatHistory[currentUser.email].length > 20) {
        chatHistory[currentUser.email] = chatHistory[currentUser.email].slice(0, 20);
      }
      
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      
      return { 
        success: true, 
        historyItem
      };
    }
    
    if (endpoint === '/history/get' && method === 'GET') {
      const { id } = data;
      
      const historyItem = chatHistory[currentUser.email]?.find((item: any) => item.id === id);
      
      if (!historyItem) {
        throw new Error('History item not found');
      }
      
      return { 
        success: true, 
        historyItem
      };
    }
    
    throw new Error('Unknown history endpoint');
  }

  private async mockUserService(endpoint: string, method: string, data: any): Promise<any> {
    // Simulate user/profile microservice
    const usersString = localStorage.getItem('legalChatUsers') || '{}';
    const users = JSON.parse(usersString);
    const currentUserString = localStorage.getItem('currentUser');
    
    if (!currentUserString) {
      throw new Error('User not authenticated');
    }
    
    const currentUser = JSON.parse(currentUserString);
    
    if (endpoint === '/user/profile' && method === 'GET') {
      return { 
        success: true, 
        user: {
          name: users[currentUser.email].name,
          email: users[currentUser.email].email,
          phone: users[currentUser.email].phone,
          twoFactorEnabled: users[currentUser.email].twoFactorEnabled,
          twoFactorMethod: users[currentUser.email].twoFactorMethod
        }
      };
    }
    
    if (endpoint === '/user/update-password' && method === 'POST') {
      const { currentPassword, newPassword } = data;
      
      if (users[currentUser.email].password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      users[currentUser.email].password = newPassword;
      localStorage.setItem('legalChatUsers', JSON.stringify(users));
      
      return { 
        success: true, 
        message: 'Password updated successfully'
      };
    }
    
    if (endpoint === '/user/update-2fa' && method === 'POST') {
      const { enabled, method, phone } = data;
      
      if (enabled && method === '2fa_sms' && !phone) {
        throw new Error('Phone number is required for SMS verification');
      }
      
      users[currentUser.email].twoFactorEnabled = enabled;
      users[currentUser.email].twoFactorMethod = enabled ? method : null;
      users[currentUser.email].phone = enabled && method === '2fa_sms' ? phone : null;
      
      localStorage.setItem('legalChatUsers', JSON.stringify(users));
      
      // Update current user
      currentUser.twoFactorEnabled = enabled;
      currentUser.twoFactorMethod = enabled ? method : null;
      currentUser.phone = enabled && method === '2fa_sms' ? phone : null;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      return { 
        success: true, 
        message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`
      };
    }
    
    throw new Error('Unknown user endpoint');
  }
}
