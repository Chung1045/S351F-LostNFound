import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Search, AlertCircle, User as UserIcon, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

interface SignUpProps {
  onClose: () => void;
  onSignUp: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onClose, onSignUp, onSwitchToLogin }) => {
  const { t } = useApp();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 2) newErrors.name = t.signup.errors.nameTooShort;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = t.signup.errors.invalidEmail;
    if (formData.password.length < 6) newErrors.password = t.signup.errors.passwordTooShort;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t.signup.errors.passwordMismatch;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const user = await api.auth.register({
        username: formData.name,
        email: formData.email,
        password: formData.password
      });
      onSignUp(user);
    } catch (err) {
      setErrors({ email: 'Registration failed. Email might be taken.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const inputClass = (field: string) => `w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white ${
    errors[field] ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
  }`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
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
            <h1 className="text-2xl sm:text-3xl font-black">{t.signup.title}</h1>
          </div>
          <p className="text-sm sm:text-base text-blue-100 font-medium">{t.signup.subtitle}</p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{t.signup.fullName}</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="John Doe" className={inputClass('name')} required />
              </div>
              {errors.name && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</motion.p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{t.signup.email}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="your@email.com" className={inputClass('email')} required />
              </div>
              {errors.email && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</motion.p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{t.signup.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="••••••••" className={`${inputClass('password')} pr-12`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</motion.p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">{t.signup.confirmPassword}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} placeholder="••••••••" className={`${inputClass('confirmPassword')} pr-12`} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPassword}</motion.p>}
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />{t.signup.passwordsMatch}</motion.p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {isLoading ? t.signup.creatingAccount : t.signup.createAccount}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            {t.signup.termsPrefix}{' '}
            <button className="text-blue-600 font-bold hover:underline cursor-pointer">{t.signup.terms}</button>{' '}
            {t.signup.and}{' '}
            <button className="text-blue-600 font-bold hover:underline cursor-pointer">{t.signup.privacy}</button>
          </p>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.signup.haveAccount}{' '}
            <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline cursor-pointer">{t.signup.logIn}</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
