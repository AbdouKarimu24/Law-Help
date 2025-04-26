import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthScreen from '../auth/AuthScreen';
import Navbar from './Navbar';
import ChatScreen from '../chat/ChatScreen';
import HistoryScreen from '../history/HistoryScreen';
import ProfileScreen from '../profile/ProfileScreen';
import LawyerList from '../lawyers/LawyerList';
import LawyerApplication from '../lawyers/LawyerApplication';
import ChangePasswordModal from '../profile/ChangePasswordModal';

type Screen = 'chat' | 'history' | 'profile' | 'lawyers';

const MainApp: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [activeScreen, setActiveScreen] = useState<Screen>('chat');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLawyerApplication, setShowLawyerApplication] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      document.title = 'LawHelp - Cameroon Legal Assistant';
    }
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div id="main-app" className="flex flex-col min-h-screen">
      <Navbar 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen} 
      />

      <div className="flex-grow">
        {activeScreen === 'chat' && <ChatScreen />}
        {activeScreen === 'lawyers' && (
          <div>
            <LawyerList />
            <div className="fixed bottom-8 right-8">
              <button
                onClick={() => setShowLawyerApplication(true)}
                className="bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg transition-colors"
              >
                Apply as Lawyer
              </button>
            </div>
          </div>
        )}
        {activeScreen === 'history' && (
          <HistoryScreen 
            onSelectChat={(query, response) => {
              setActiveScreen('chat');
            }} 
          />
        )}
        {activeScreen === 'profile' && (
          <ProfileScreen 
            onChangePasswordClick={() => setShowPasswordModal(true)} 
          />
        )}
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showLawyerApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="relative w-full max-w-4xl m-4">
            <button
              onClick={() => setShowLawyerApplication(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <LawyerApplication onSubmit={() => setShowLawyerApplication(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;