import React from 'react';
import { Moon, Sun, MessageSquare, History, User, LogOut, Scale } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

type NavbarProps = {
  activeScreen: 'chat' | 'history' | 'profile' | 'lawyers';
  onScreenChange: (screen: 'chat' | 'history' | 'profile' | 'lawyers') => void;
};

const Navbar: React.FC<NavbarProps> = ({ activeScreen, onScreenChange }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">LawHelp</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onScreenChange('chat')}
              className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none flex items-center ${
                activeScreen === 'chat' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </button>
            <button 
              onClick={() => onScreenChange('lawyers')}
              className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none flex items-center ${
                activeScreen === 'lawyers' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <Scale className="w-4 h-4 mr-1" />
              Lawyers
            </button>
            <button 
              onClick={() => onScreenChange('history')}
              className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none flex items-center ${
                activeScreen === 'history' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <History className="w-4 h-4 mr-1" />
              History
            </button>
            <button 
              onClick={() => onScreenChange('profile')}
              className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none flex items-center ${
                activeScreen === 'profile' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <User className="w-4 h-4 mr-1" />
              Profile
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-red rounded-md focus:outline-none flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;