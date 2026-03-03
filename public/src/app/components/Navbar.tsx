import React, { useState, useRef, useEffect } from 'react';
import { Search, PlusCircle, User, LogOut, ShieldCheck, MapPin, Settings, UserCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { ConfirmDialog } from './ConfirmDialog';

interface NavbarProps {
  user: UserType | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onAuth: () => void;
  onCreatePost: () => void;
  onShowProfile: () => void;
  onShowSettings: () => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, onAuth, onCreatePost, onShowProfile, onShowSettings, currentPage }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopMenuRef.current?.contains(target);
      const insideMobile = mobileMenuRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-3 py-2 sm:px-4 sm:py-3 md:px-8">
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
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm font-medium transition-colors cursor-pointer ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Explore
          </button>
          <button 
            onClick={onCreatePost}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <PlusCircle size={16} />
            Post Item
          </button>
          
          <div className="h-6 w-px bg-gray-200" />

          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${currentPage === 'admin' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
                >
                  <ShieldCheck size={18} />
                  Admin
                </button>
              )}
              
              {/* User Menu Dropdown */}
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-2 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <User size={18} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-gray-500">{user.email}</span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase">Account</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{user.name}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        onShowProfile();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                    >
                      <UserCircle size={18} />
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        onShowSettings();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                    >
                      <Settings size={18} />
                      Settings
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuth}
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
           <button 
            onClick={onCreatePost}
            className="p-2 bg-blue-600 text-white rounded-full cursor-pointer"
          >
            <PlusCircle size={20} />
          </button>
          
          {!user && (
            <button onClick={onAuth} className="p-2 text-gray-600 cursor-pointer">
              <User size={20} />
            </button>
          )}
          
          {user && (
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white cursor-pointer"
              >
                <User size={18} />
              </button>

              {/* Mobile Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Account</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-purple-700 hover:bg-purple-50 transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck size={18} />
                      Admin Dashboard
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      onShowProfile();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    <UserCircle size={18} />
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      onShowSettings();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                  >
                    <Settings size={18} />
                    Settings
                  </button>
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <ConfirmDialog
          title="Sign Out"
          message="Are you sure you want to sign out of your account?"
          confirmText="Sign Out"
          cancelText="Stay Logged In"
          variant="warning"
          onConfirm={() => {
            onLogout();
            setShowLogoutConfirm(false);
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </nav>
  );
};