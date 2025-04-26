import { ApiClient } from './api';
import { User } from '../types';

export class UserService {
  private api: ApiClient;
  
  constructor() {
    this.api = new ApiClient();
  }

  async getProfile(): Promise<User> {
    try {
      const response = await this.api.request<{ success: boolean; user: User }>('/user/profile', 'GET');
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.api.request('/user/update-password', 'POST', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  }

  async updateTwoFactorAuth(enabled: boolean): Promise<void> {
    try {
      await this.api.request('/user/update-2fa', 'POST', { enabled });
    } catch (error) {
      throw error;
    }
  }
}