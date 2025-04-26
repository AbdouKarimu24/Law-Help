import { ApiClient } from './api';
import { HistoryItem } from '../types';

export class HistoryService {
  private api: ApiClient;
  
  constructor() {
    this.api = new ApiClient();
  }

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const response = await this.api.request<{ success: boolean; history: HistoryItem[] }>('/history/list', 'GET');
      return response.history;
    } catch (error) {
      throw error;
    }
  }

  async addToHistory(query: string, response: string): Promise<void> {
    try {
      await this.api.request<{ success: boolean; historyItem: HistoryItem }>('/history/add', 'POST', { query, response });
    } catch (error) {
      console.error('Error adding to history:', error);
      // Silently fail - don't interrupt the user experience
    }
  }

  async getHistoryItem(id: number): Promise<HistoryItem> {
    try {
      const response = await this.api.request<{ success: boolean; historyItem: HistoryItem }>('/history/get', 'GET', { id });
      return response.historyItem;
    } catch (error) {
      throw error;
    }
  }
}