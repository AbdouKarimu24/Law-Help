import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';

type AuthContextType = {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requireTwoFactor?: boolean; twoFactorMethod?: string; email?: string }>;
  verifyTwoFactor: (email: string, code: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    twoFactorEnabled: boolean,
    twoFactorMethod: '2fa_email' | '2fa_sms',
    phone?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authService = new AuthService();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.requireTwoFactor) {
        return { 
          requireTwoFactor: true, 
          email,
          twoFactorMethod: response.twoFactorMethod 
        };
      }
      
      if (response.user) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyTwoFactor = async (email: string, code: string) => {
    try {
      const response = await authService.verifyTwoFactor(email, code);
      
      if (response.user) {
        setCurrentUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    twoFactorEnabled: boolean,
    twoFactorMethod: '2fa_email' | '2fa_sms',
    phone?: string
  ) => {
    try {
      await authService.register(name, email, password, twoFactorEnabled, twoFactorMethod, phone);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the user even if the API fails
      setCurrentUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    verifyTwoFactor,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
