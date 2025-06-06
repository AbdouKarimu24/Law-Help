import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type RegisterResponse = {
  totpQRCode?: string; // Added expected response field for the QR code
};

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2fa, setEnable2fa] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'2fa_email' | '2fa_sms' | '2fa_totp'>('2fa_totp');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totpQRCode, setTotpQRCode] = useState<string | null>(null);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calling the register function from AuthContext with relevant params
      const response: RegisterResponse = await register(name, email, password, enable2fa, twoFactorMethod);
      
      if (response.totpQRCode) {
        setTotpQRCode(response.totpQRCode); // Set the QR code from the response
      } else {
        alert('Account created successfully! Please check your email for a verification code.');
      }
      
      // Reset form fields after successful registration
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setEnable2fa(false);
      setTwoFactorMethod('2fa_totp');
    } catch (error) {
      // Handle errors by setting the error message in state
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
            onChange={() => setEnable2fa(prev => !prev)}
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
                    onChange={() => setTwoFactorMethod('2fa_email')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="2fa-email" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Email Verification
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="2fa-totp"
                    name="2fa-method"
                    value="2fa_totp"
                    checked={twoFactorMethod === '2fa_totp'}
                    onChange={() => setTwoFactorMethod('2fa_totp')}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="2fa-totp" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Authenticator App (Google Authenticator, Authy, etc.)
                  </label>
                </div>
              </div>
            </div>
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
      
      {totpQRCode && (
        <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Set up Authenticator App</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            1. Open your authenticator app<br />
            2. Scan the QR code below<br />
            3. Enter the code shown in your app when logging in
          </p>
          <div className="flex justify-center mb-4">
            <img src={totpQRCode} alt="TOTP QR Code" className="w-48 h-48" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Please save or scan the QR code now. You won't be able to see it again!
          </p>
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
