import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Search, AlertCircle, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  onSwitchToSignUp: () => void;
  users: User[];
}

export const Login: React.FC<LoginProps> = ({ onClose, onLogin, onSwitchToSignUp, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Find user by email
      const user = users.find(u => u.email === email);

      if (!user) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // In a real app, you'd verify password hash here
      // For demo purposes, we'll accept any password for existing emails
      onLogin(user);
      setIsLoading(false);
    }, 800);
  };

  const handleDemoLogin = (role: 'user' | 'admin') => {
    const demoUser = users.find(u => u.role === role);
    if (demoUser) {
      onLogin(demoUser);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
              <Search size={28} />
            </div>
            <h1 className="text-3xl font-black">FoundIt</h1>
          </div>
          <p className="text-blue-100 font-medium">
            Welcome back! Sign in to continue helping your community.
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
              >
                <AlertCircle size={16} />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or try a demo account</span>
            </div>
          </div>

          {/* Demo Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin('user')}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <UserIcon size={18} className="text-blue-600" />
              Demo User Account
              <span className="text-xs text-gray-500 ml-auto">(john@example.com)</span>
            </button>
            
            <button
              onClick={() => handleDemoLogin('admin')}
              className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl font-bold text-purple-700 transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <ShieldCheck size={18} className="text-purple-600" />
              Demo Admin Account
              <span className="text-xs text-purple-500 ml-auto">(admin@foundit.com)</span>
            </button>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <button className="text-blue-600 font-bold hover:underline cursor-pointer" onClick={onSwitchToSignUp}>
              Sign up for free
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};