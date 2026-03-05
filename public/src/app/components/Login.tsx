import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Search, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

interface LoginProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  onSwitchToSignUp: () => void;
}

export const Login: React.FC<LoginProps> = ({ onClose, onLogin, onSwitchToSignUp }) => {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await api.auth.login({ email, password });
      onLogin(user);
    } catch (err) {
      setError(t.login.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[95vh] overflow-y-auto"
      >
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-8">
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="bg-white/20 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl">
              <Search size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{t.login.welcomeBack}</h1>
          </div>
          <p className="text-sm sm:text-base text-blue-100 font-medium">{t.login.subtitle}</p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{t.login.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{t.login.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2">
              {isLoading ? t.login.signingIn : t.login.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            {t.login.noAccount}{' '}
            <button className="text-blue-600 font-bold hover:underline cursor-pointer" onClick={onSwitchToSignUp}>
              {t.login.signUpFree}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
