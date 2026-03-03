import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Bell, Shield, Trash2 } from 'lucide-react';
import { User as UserType } from '../types';

interface UserSettingsProps {
  user: UserType;
  onClose: () => void;
  onUpdateUser: (updates: Partial<UserType>) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => void;
  onDeleteAccount: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ 
  user, 
  onClose, 
  onUpdateUser,
  onChangePassword,
  onDeleteAccount
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'notifications' | 'privacy'>('profile');
  
  // Profile Form
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    commentReplies: true,
    postMatches: true,
    weeklyDigest: false,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showActivity: true,
  });

  const handleSaveProfile = () => {
    const errors: Record<string, string> = {};

    if (profileData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setProfileErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSavingProfile(true);
      setTimeout(() => {
        onUpdateUser(profileData);
        setIsSavingProfile(false);
      }, 500);
    }
  };

  const handleChangePassword = () => {
    const errors: Record<string, string> = {};

    if (passwordData.current.length < 6) {
      errors.current = 'Please enter your current password';
    }

    if (passwordData.new.length < 6) {
      errors.new = 'Password must be at least 6 characters';
    }

    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = 'Passwords do not match';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsChangingPassword(true);
      setTimeout(() => {
        onChangePassword(passwordData.current, passwordData.new);
        setPasswordData({ current: '', new: '', confirm: '' });
        setIsChangingPassword(false);
      }, 500);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('FINAL WARNING: All your posts, comments, and data will be permanently deleted. Are you absolutely sure?')) {
        onDeleteAccount();
      }
    }
  };

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-none sm:rounded-3xl shadow-2xl max-w-4xl w-full h-full sm:h-auto overflow-hidden sm:max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black">Settings</h1>
          <p className="text-sm sm:text-base text-blue-100 font-medium mt-1">Manage your account preferences</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* Sidebar - Horizontal on mobile, vertical on desktop */}
          <div className="sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-x-auto sm:overflow-y-auto">
            <nav className="flex sm:flex-col gap-1 p-2 sm:p-4 min-w-max sm:min-w-0">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-sm sm:text-base ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <section.icon size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Profile Information</h2>
                  <p className="text-gray-600">Update your personal details</p>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          profileErrors.name 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {profileErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          profileErrors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {profileErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Role Badge */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Account Type
                    </label>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                      user.role === 'admin' 
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      <Shield size={16} />
                      {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Password Section */}
            {activeSection === 'password' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600">Ensure your account is secure</p>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          passwordErrors.current 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.current && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {passwordErrors.current}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          passwordErrors.new 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.new && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {passwordErrors.new}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          passwordErrors.confirm 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-200 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordErrors.confirm && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {passwordErrors.confirm}
                      </p>
                    )}
                    {!passwordErrors.confirm && passwordData.confirm && passwordData.new === passwordData.confirm && (
                      <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Passwords match
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Notification Preferences</h2>
                  <p className="text-gray-600">Choose what updates you want to receive</p>
                </div>

                <div className="space-y-4">
                  {Object.entries({
                    emailUpdates: 'Email me about new posts matching my searches',
                    commentReplies: 'Notify me when someone comments on my posts',
                    postMatches: 'Alert me about potential matches for my lost items',
                    weeklyDigest: 'Send me a weekly summary of activity',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-all cursor-pointer">
                      <span className="font-bold text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Changes to notification settings are saved automatically
                  </p>
                </div>
              </motion.div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Privacy & Security</h2>
                  <p className="text-gray-600">Control who can see your information</p>
                </div>

                <div className="space-y-4">
                  {Object.entries({
                    showEmail: 'Show my email address on posts',
                    showActivity: 'Make my activity visible to other users',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-all cursor-pointer">
                      <span className="font-bold text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={privacy[key as keyof typeof privacy]}
                        onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-black text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};