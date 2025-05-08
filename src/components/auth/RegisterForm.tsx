import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2fa, setEnable2fa] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'2fa_email' | '2fa_sms'>('2fa_email');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (enable2fa && twoFactorMethod === '2fa_sms' && !phone) {
      setError('Phone number is required for SMS verification');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(name, email, password, enable2fa, twoFactorMethod, phone);
      alert('Account created successfully! Please check your email/phone for verification code.');
      
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setEnable2fa(false);
      setTwoFactorMethod('2fa_email');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="register-form" className="space-y-4" onSubmit={handleRegistration}>
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
        <input 
          type="text" 
          id="register-name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
          required 
        />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input 
          type="email" 
          id="register-email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
          required 
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
        <input 
          type="password" 
          id="register-password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
          required 
        />
      </div>
      <div>
        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
        <input 
          type="password" 
          id="register-confirm-password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
          required 
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="enable-2fa" 
            checked={enable2fa}
            onChange={(e) => setEnable2fa(e.target.checked)}
            className="w-4 h-4 text-primary bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary" 
          />
          <label htmlFor="enable-2fa" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Enable Two-Factor Authentication</label>
        </div>
        
        {enable2fa && (
          <div className="pl-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Method</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="2fa-email"
                    name="2fa-method"
                    value="2fa_email"
                    checked={twoFactorMethod === '2fa_email'}
                    onChange={(e) => setTwoFactorMethod('2fa_email')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="2fa-email" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Email Verification
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="2fa-sms"
                    name="2fa-method"
                    value="2fa_sms"
                    checked={twoFactorMethod === '2fa_sms'}
                    onChange={(e) => setTwoFactorMethod('2fa_sms')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="2fa-sms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    SMS Verification
                  </label>
                </div>
              </div>
            </div>

            {twoFactorMethod === '2fa_sms' && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+237..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required={twoFactorMethod === '2fa_sms'}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition duration-200 focus:outline-none disabled:opacity-70"
        >
          {isSubmitting ? 'Processing...' : 'Register'}
        </button>
      </div>
      {error && <div className="text-red text-sm text-center">{error}</div>}
    </form>
  );
};

export default RegisterForm;
