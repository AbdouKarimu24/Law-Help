import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div id="auth-screen" className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">LawHelp</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">AI-powered legal assistance for Cameroonians</p>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 px-4 font-medium rounded-lg focus:outline-none transition-colors ${
              activeTab === 'login' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Login
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 px-4 font-medium rounded-lg focus:outline-none transition-colors ${
              activeTab === 'register' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

export default AuthScreen;