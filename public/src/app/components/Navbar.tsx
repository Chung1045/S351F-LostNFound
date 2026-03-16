import React, { useState, useRef, useEffect } from 'react';
import { Search, PlusCircle, User, LogOut, ShieldCheck, Settings, UserCircle, Moon, Sun, Languages, Bell } from 'lucide-react';
import { User as UserType, Notification } from '../types';
import { ConfirmDialog } from './ConfirmDialog';
import { NotificationList } from './NotificationList';
import { useApp } from '../contexts/AppContext';

interface NavbarProps {
  user: UserType | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onAuth: () => void;
  onCreatePost: () => void;
  onShowProfile: () => void;
  onShowSettings: () => void;
  currentPage: string;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, onNavigate, onLogout, onAuth, onCreatePost, onShowProfile, onShowSettings, currentPage,
  notifications = [], onMarkAsRead = () => {}, onMarkAllAsRead = () => {}, onNotificationClick = () => {}
}) => {
  const { t, theme, toggleTheme, language, setLanguage } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const desktopNotificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopMenuRef.current?.contains(target);
      const insideMobile = mobileMenuRef.current?.contains(target);
      const insideDesktopNotifications = desktopNotificationRef.current?.contains(target);
      const insideMobileNotifications = mobileNotificationRef.current?.contains(target);
      
      if (!insideDesktop && !insideMobile) {
        setShowUserMenu(false);
      }
      if (!insideDesktopNotifications && !insideMobileNotifications) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-3 py-2 sm:px-4 sm:py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
        >
          <div className="bg-blue-600 p-1 sm:p-1.5 rounded-lg text-white">
            <Search size={16} className="sm:hidden" />
            <Search size={20} className="hidden sm:block" />
          </div>
          <span className="hidden xs:inline">FoundIt</span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`text-sm font-medium transition-colors cursor-pointer ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}`}
          >
            {t.nav.explore}
          </button>
          <button
            onClick={onCreatePost}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <PlusCircle size={16} />
            {t.nav.postItem}
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? t.ui.lightMode : t.ui.darkMode}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh-TW' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
          >
            <Languages size={14} />
            {language === 'en' ? '中文' : 'EN'}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={desktopNotificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative"
                  title={t.notifications?.title || 'Notifications'}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationList
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onNotificationClick={(n) => {
                      onNotificationClick(n);
                      setShowNotifications(false);
                    }}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${currentPage === 'admin' ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300 hover:text-purple-600'}`}
                >
                  <ShieldCheck size={18} />
                  {t.nav.admin}
                </button>
              )}

              {/* User Menu Dropdown */}
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-2 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{user.email}</span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t.nav.account}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{user.name}</p>
                    </div>

                    <button
                      onClick={() => { onShowProfile(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors text-left cursor-pointer"
                    >
                      <UserCircle size={18} />
                      {t.nav.viewProfile}
                    </button>

                    <button
                      onClick={() => { onShowSettings(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors text-left cursor-pointer"
                    >
                      <Settings size={18} />
                      {t.nav.settings}
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={() => { setShowLogoutConfirm(true); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={18} />
                        {t.nav.signOut}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onAuth}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer"
            >
              {t.nav.logIn}
            </button>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme Toggle Mobile */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Toggle Mobile */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'zh-TW' : 'en')}
            className="px-2 py-1 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {language === 'en' ? '中' : 'EN'}
          </button>

          <button
            onClick={onCreatePost}
            className="p-2 bg-blue-600 text-white rounded-full cursor-pointer"
          >
            <PlusCircle size={20} />
          </button>

          {!user && (
            <button onClick={onAuth} className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer">
              <User size={20} />
            </button>
          )}

          {user && (
            <div className="flex items-center gap-2">
              {/* Notification Bell Mobile */}
              <div className="relative" ref={mobileNotificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 dark:text-gray-300 cursor-pointer relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationList
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onNotificationClick={(n) => {
                      onNotificationClick(n);
                      setShowNotifications(false);
                    }}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white cursor-pointer"
              >
                <User size={18} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{t.nav.account}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                  </div>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => { onNavigate('admin'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck size={18} />
                      {t.nav.admin}
                    </button>
                  )}

                  <button
                    onClick={() => { onShowProfile(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    <UserCircle size={18} />
                    {t.nav.viewProfile}
                  </button>

                  <button
                    onClick={() => { onShowSettings(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    <Settings size={18} />
                    {t.nav.settings}
                  </button>

                  <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                    <button
                      onClick={() => { setShowLogoutConfirm(true); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={18} />
                      {t.nav.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <ConfirmDialog
          title={t.nav.signOutTitle}
          message={t.nav.signOutMessage}
          confirmText={t.nav.signOut}
          cancelText={t.nav.stayLoggedIn}
          variant="warning"
          onConfirm={() => { onLogout(); setShowLogoutConfirm(false); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </nav>
  );
};
