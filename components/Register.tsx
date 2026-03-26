
import React, { useState } from 'react';
import { Icons } from './Icons';

interface RegisterProps {
  onRegister: (name: string, email: string, referralCode?: string) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 4 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length !== 4) {
      setError('Password must be exactly 4 digits');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onRegister(name, email, referralCode);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
           <div className="mx-auto h-16 w-16 bg-gold rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-black font-bold text-2xl italic">Ex</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Join Earnix9ja and get <span className="text-gold font-bold">₦10,000</span> bonus instantly!
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            
            {error && (
              <div className="bg-red-900/20 text-red-400 text-sm p-3 rounded-lg text-center border border-red-800">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-800 placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm transition-all"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-800 placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm transition-all"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" title="4-digit PIN" className="sr-only">4-digit PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-800 placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm transition-all tracking-widest"
                  placeholder="Create 4-digit PIN"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="referralCode" className="sr-only">Referral Code (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Users className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-800 placeholder-gray-500 text-white bg-gray-900 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm transition-all"
                  placeholder="Referral Code (Optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="flex items-center">
                <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-gold focus:ring-gold border-gray-800 rounded bg-gray-900"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                    I agree to the <a href="#" className="text-gold hover:text-gold-light font-bold">Terms</a> and <a href="#" className="text-gold hover:text-gold-light font-bold">Privacy Policy</a>
                </label>
            </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-black bg-gold hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold shadow-lg transition-all disabled:opacity-70"
            >
              {isLoading ? 'Creating Account...' : 'Get Started'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-bold text-gold hover:text-gold-light">
                    Login here
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
