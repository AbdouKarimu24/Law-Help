import { ApiClient } from './api';
import { Rating, RatingInput } from '../types';

export class RatingService {
  private api: ApiClient;
  
  constructor() {
    this.api = new ApiClient();
  }

  async getLawyerRatings(lawyerId: number): Promise<Rating[]> {
    try {
      const response = await this.api.request<{ success: boolean; ratings: Rating[] }>(`/lawyers/${lawyerId}/ratings`, 'GET');
      return response.ratings;
    } catch (error) {
      throw error;
    }
  }

  async rateLawyer(lawyerId: number, rating: RatingInput): Promise<void> {
    try {
      await this.api.request(`/lawyers/${lawyerId}/rate`, 'POST', rating);
    } catch (error) {
      throw error;
    }
  }
}