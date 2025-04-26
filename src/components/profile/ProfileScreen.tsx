import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/user';
import { User } from '../../types';

type ProfileScreenProps = {
  onChangePasswordClick: () => void;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onChangePasswordClick }) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const userService = new UserService();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getProfile();
      setProfile(userData);
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2fa = async () => {
    if (!profile) return;
    
    const newValue = !profile.twoFactorEnabled;
    
    try {
      await userService.updateTwoFactorAuth(newValue);
      setProfile(prev => prev ? { ...prev, twoFactorEnabled: newValue } : null);
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      alert('Failed to update two-factor authentication settings');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-center py-8">
            <div className="animate-pulse flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
              <div className="h-3 w-3 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-screen" className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Profile Settings</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p id="profile-name" className="text-gray-800 dark:text-white font-medium">
                {profile?.name || currentUser?.name || ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p id="profile-email" className="text-gray-800 dark:text-white font-medium">
                {profile?.email || currentUser?.email || ''}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center">
                <span 
                  id="2fa-status" 
                  className={`text-sm mr-2 ${profile?.twoFactorEnabled ? 'text-green' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="toggle-2fa" 
                    checked={profile?.twoFactorEnabled || false}
                    onChange={handleToggle2fa}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div>
              <button 
                id="change-password-btn" 
                onClick={onChangePasswordClick}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition duration-200 focus:outline-none"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 dark:text-white font-medium">Notification Settings</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates and important notifications</p>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="toggle-notifications" 
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(prev => !prev)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;