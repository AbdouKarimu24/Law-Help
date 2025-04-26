import { ApiClient } from './api';
import { Lawyer, LawyerApplication } from '../types';

export class LawyerService {
  private api: ApiClient;
  
  constructor() {
    this.api = new ApiClient();
  }

  async getLawyers(): Promise<Lawyer[]> {
    try {
      const response = await this.api.request<{ success: boolean; lawyers: Lawyer[] }>('/lawyers', 'GET');
      return response.lawyers;
    } catch (error) {
      throw error;
    }
  }

  async getLawyer(id: number): Promise<Lawyer> {
    try {
      const response = await this.api.request<{ success: boolean; lawyer: Lawyer }>(`/lawyers/${id}`, 'GET');
      return response.lawyer;
    } catch (error) {
      throw error;
    }
  }

  async applyAsLawyer(application: LawyerApplication): Promise<void> {
    try {
      const formData = new FormData();
      
      // Add all application fields to formData
      Object.entries(application).forEach(([key, value]) => {
        if (key === 'practiceAreas' || key === 'languages') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'profileImage' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      await this.api.request('/lawyers/apply', 'POST', formData);
    } catch (error) {
      throw error;
    }
  }

  async updateLawyerProfile(id: number, updates: Partial<LawyerApplication>): Promise<void> {
    try {
      await this.api.request(`/lawyers/${id}`, 'PUT', updates);
    } catch (error) {
      throw error;
    }
  }
}