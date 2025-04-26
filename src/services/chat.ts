import { ApiClient } from './api';
import { ChatMessage } from '../types';

export class ChatService {
  private api: ApiClient;
  private modelEndpoint: string;
  
  constructor() {
    this.api = new ApiClient();
    // In production, this would be configured via environment variables
    this.modelEndpoint = import.meta.env.VITE_AI_MODEL_ENDPOINT || 'http://localhost:5000/predict';
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    try {
      // First, log the message to our backend
      const response = await this.api.request<{ success: boolean; messageId: string }>('/chat/send', 'POST', { message });
      
      // Then, get response from the AI model
      const aiResponse = await fetch(this.modelEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get response from AI model');
      }

      const { response: aiText } = await aiResponse.json();

      return {
        id: response.messageId,
        text: aiText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  }
}