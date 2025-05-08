import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const { login, verifyTwoFactor } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (showTwoFactorInput) {
        await verifyTwoFactor(email, verificationCode);
      } else {
        const response = await login(email, password);
        
        if (response.requireTwoFactor) {
          setShowTwoFactorInput(true);
          setTwoFactorMethod(response.twoFactorMethod || '2fa_email');
          
          // In a real app, the code would be sent via email/SMS
          alert('For demo purposes: The verification code is 123456');
        }
      }
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
    <form id="login-form" className="space-y-4" onSubmit={handleLogin}>
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input 
          type="email" 
          id="login-email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
          required 
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
        <input 
          type="password" 
          id="login-password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
          required 
        />
      </div>
      {showTwoFactorInput && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A verification code has been sent to your {twoFactorMethod === '2fa_email' ? 'email' : 'phone'}
          </p>
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Code</label>
            <input 
              type="text" 
              id="verification-code" 
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
              required 
              pattern="\d{6}"
              title="Please enter the 6-digit verification code"
              maxLength={6}
            />
          </div>
        </div>
      )}
      <div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition duration-200 focus:outline-none disabled:opacity-70"
        >
          {isSubmitting ? 'Processing...' : showTwoFactorInput ? 'Verify' : 'Login'}
        </button>
      </div>
      {error && <div className="text-red text-sm text-center">{error}</div>}
    </form>
  );
};

export default LoginForm;
