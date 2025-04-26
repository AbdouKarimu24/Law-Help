// User types
export interface User {
  id: number;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  requireTwoFactor?: boolean;
  message?: string;
  email?: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

// History types
export interface HistoryItem {
  id: number;
  query: string;
  response: string;
  timestamp: string;
}

// Lawyer types
export interface Lawyer {
  id: number;
  userId: number;
  licenseNumber: string;
  specialization: string;
  experienceYears: number;
  education: string;
  bio: string | null;
  profileImage: string | null;
  practiceAreas: string[];
  languages: string[];
  officeAddress: string;
  phone: string;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  totalRatings?: number;
}

export interface LawyerApplication {
  licenseNumber: string;
  specialization: string;
  experienceYears: number;
  education: string;
  bio?: string;
  profileImage?: File;
  practiceAreas: string[];
  languages: string[];
  officeAddress: string;
  phone: string;
  website?: string;
}

// Rating types
export interface Rating {
  id: number;
  lawyerId: number;
  userId: number;
  rating: number;
  review?: string;
  createdAt: string;
  userName?: string;
}

export interface RatingInput {
  rating: number;
  review?: string;
}