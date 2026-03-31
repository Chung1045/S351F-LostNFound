import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ItemGrid } from './components/ItemGrid';
import { PostForm } from './components/PostForm';
import { ItemDetails } from './components/ItemDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { UserProfile } from './components/UserProfile';
import { UserSettings } from './components/UserSettings';
import { Post, Comment, User, Report, Notification } from './types';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Plus, ArrowRight } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import { api } from './services/api';

function AppContent() {
  const { t } = useApp();
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const initApp = async () => {
      try {
        // Try to restore session
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userProfile = await api.auth.getProfile();
            setUser(userProfile);
          } catch (e) {
            console.error('Session restore failed', e);
            localStorage.removeItem('token');
          }
        }

        // Fetch posts
        const fetchedPosts = await api.posts.getAll();
        setPosts(fetchedPosts);

        // Fetch notifications if logged in
        if (token) {
          const fetchedNotifications = await api.notifications.getAll();
          setNotifications(fetchedNotifications);
        }
      } catch (error) {
        console.error('Failed to initialize app', error);
        toast.error('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    // Listen for unauthorized events (e.g. token expired/invalid)
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('token');
      setShowLogin(true);
      toast.error('Session expired. Please log in again.');
    };

    const handleLogoutEvent = () => {
        setUser(null);
        setCurrentPage('home');
        toast.info('Signed out successfully');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  // Fetch comments when a post is selected
  useEffect(() => {
    if (selectedPost) {
      const fetchComments = async () => {
        try {
          const fetchedComments = await api.comments.getByPostId(selectedPost.id);
          setComments(fetchedComments);
        } catch (error) {
          console.error('Failed to fetch comments', error);
        }
      };
      fetchComments();
    }
  }, [selectedPost]);

  // Fetch reports and users if admin
  useEffect(() => {
    if (user?.role === 'admin' && currentPage === 'admin') {
      const fetchData = async () => {
        try {
          const [fetchedReports, fetchedUsers, fetchedPosts] = await Promise.all([
            api.admin.getReports(),
            api.auth.getUsers(),
            api.posts.getAll()
          ]);
          setReports(fetchedReports);
          setAllUsers(fetchedUsers);
          setPosts(fetchedPosts);
        } catch (error) {
          console.error('Failed to fetch admin data', error);
        }
      };
      fetchData();
    }
  }, [user, currentPage]);

  // Auth with role-based redirect
  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowLogin(false);
    
    // Fetch notifications
    try {
      const fetchedNotifications = await api.notifications.getAll();
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }

    // Redirect based on role
    if (loggedInUser.role === 'admin') {
      setCurrentPage('admin');
      toast.success(`Welcome back, ${loggedInUser.name}! Admin access granted.`);
    } else {
      setCurrentPage('home');
      toast.success(`Welcome back, ${loggedInUser.name}!`);
    }
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  const handleShowSignUp = () => {
    setShowSignUp(true);
  };

  const handleSignUp = (newUser: User) => {
    setUser(newUser);
    setShowSignUp(false);
    setCurrentPage('home');
    toast.success(`Welcome to FoundIt, ${newUser.name}! 🎉`);
  };

  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  const handleSwitchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setNotifications([]);
    // Event listener will handle state update and toast
  };

  // Notification Actions
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to post if link_id exists
    if (notification.link_id) {
      const post = posts.find(p => p.id === notification.link_id);
      if (post) {
        setSelectedPost(post);
        setCurrentPage('home');
      } else {
        // If post not in current list, maybe it was deleted or we need to fetch it
        // For now, just show a message if not found
        toast.info('Post not found or has been removed');
      }
    }
  };

  // Post Actions
  const handleCreatePost = async (data: Partial<Post>) => {
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    try {
      const result = await api.posts.create(data);
      // Refresh posts
      const updatedPosts = await api.posts.getAll();
      setPosts(updatedPosts);
      setShowPostForm(false);
      toast.success('Your post has been published!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleUpdatePostStatus = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      // Map to correct status based on item type
      // Found items -> collected
      // Lost items -> found
      const newStatus = post.type === 'found' ? 'collected' : 'found';
      
      await api.posts.updateStatus(postId, newStatus);
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus } : p));
      setSelectedPost(prev => prev && prev.id === postId ? { ...prev, status: newStatus } : prev);
      toast.success('Status updated successfully!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.posts.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setComments(prev => prev.filter(c => c.postId !== postId));
      
      // Also resolve any reports related to this post
      setReports(prev => prev.map(r => 
        (r.targetType === 'post' && r.targetId === postId) 
          ? { ...r, status: 'resolved' } 
          : r
      ));

      setSelectedPost(null);
      toast.success('Post removed');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  // Comment Actions
  const handleAddComment = async (postId: string, content: string) => {
    if (!user) return;
    try {
      const result = await api.comments.add(postId, content);
      // Refresh comments
      const updatedComments = await api.comments.getByPostId(postId);
      setComments(updatedComments);
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  // Moderation Actions
  const handleReport = async (postId: string, reason: string) => {
    if (!user) return;
    try {
      await api.reports.create({
        targetType: 'post',
        targetId: postId,
        reason,
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isReported: true } : p));
      toast.error('Report submitted for review');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await api.admin.updateReportStatus(reportId, 'resolved');
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      toast.success('Report resolved');
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.admin.deleteUser(userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setPosts(prev => prev.filter(p => p.userId !== userId));
      toast.success('User account deleted');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleReportComment = async (commentId: string, reason: string) => {
    if (!user) return;
    try {
      await api.reports.create({
        targetType: 'comment',
        targetId: commentId,
        reason,
      });
      toast.error('Report submitted for review');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.admin.deleteComment(commentId);
      // Use String() for robust comparison as DB IDs might be numbers while state IDs are strings
      setComments(prev => prev.filter(c => String(c.id) !== String(commentId)));
      setReports(prev => prev.map(r => 
        (r.targetType === 'comment' && String(r.targetId) === String(commentId)) 
          ? { ...r, status: 'resolved' } 
          : r
      ));
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  // User Profile & Settings Actions
  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await api.auth.updateProfile({ name: updates.name || user.name, email: updates.email || user.email });
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.auth.updatePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await api.auth.deleteAccount();
      setUser(null);
      setShowSettings(false);
      setCurrentPage('home');
      toast.error('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] dark:bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 text-gray-900 dark:text-white selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        user={user} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
        onAuth={handleShowLogin}
        onCreatePost={() => setShowPostForm(true)}
        onShowProfile={() => setShowProfile(true)}
        onShowSettings={() => setShowSettings(true)}
        currentPage={currentPage}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
      />

      <main className="max-w-7xl mx-auto px-3 py-6 sm:px-4 sm:py-8 md:px-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 sm:space-y-12"
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden rounded-3xl sm:rounded-[40px] bg-linear-to-br from-blue-700 to-indigo-900 text-white p-6 sm:p-8 md:p-16">
                <div className="relative z-10 max-w-2xl space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold border border-white/20">
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    {t.hero.badge}
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                    {t.hero.title1} <span className="text-blue-300">{t.hero.title2}</span>
                  </h1>
                  <p className="text-base sm:text-xl text-blue-100/80 leading-relaxed font-medium">
                    {t.hero.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <button 
                      onClick={() => setShowPostForm(true)}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-900 rounded-xl sm:rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
                    >
                      {t.hero.reportBtn} <Plus size={18} className="sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                    <button 
                      onClick={() => { const el = document.getElementById('browse'); el?.scrollIntoView({ behavior: 'smooth' }); }}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600/30 backdrop-blur-md text-white border border-white/20 rounded-xl sm:rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base"
                    >
                      {t.hero.browseBtn} <ArrowRight size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] bg-blue-500/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[80%] bg-indigo-500/20 blur-[100px] rounded-full" />
                <div className="hidden lg:block absolute right-12 bottom-12 w-64 h-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl rotate-12 shadow-2xl animate-bounce-slow">
                   <div className="p-6 space-y-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl" />
                      <div className="w-full h-4 bg-white/20 rounded-full" />
                      <div className="w-3/4 h-4 bg-white/20 rounded-full" />
                   </div>
                </div>
              </section>

              {/* Browse Section */}
              <section id="browse">
                <ItemGrid posts={posts} onSelectPost={setSelectedPost} />
              </section>
            </motion.div>
          )}

          {currentPage === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Command Center</h1>
                  <p className="text-gray-500 dark:text-gray-400">Monitor reports and moderate community content.</p>
                </div>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Exit Admin
                </button>
              </div>
              <AdminDashboard 
                posts={posts}
                reports={reports}
                users={allUsers}
                onReviewPost={setSelectedPost}
                onDeletePost={handleDeletePost}
                onResolveReport={handleResolveReport}
                onDeleteUser={handleDeleteUser}
                onDeleteComment={handleDeleteComment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {selectedPost && (
          <ItemDetails 
            key="item-details"
            post={selectedPost}
            comments={comments}
            currentUser={user}
            onClose={() => setSelectedPost(null)}
            onAddComment={(content) => handleAddComment(selectedPost.id, content)}
            onUpdateStatus={() => handleUpdatePostStatus(selectedPost.id)}
            onReport={(reason) => handleReport(selectedPost.id, reason)}
            onDelete={() => handleDeletePost(selectedPost.id)}
            onReportComment={(commentId, reason) => handleReportComment(commentId, reason)}
            onLogin={() => setShowLogin(true)}
          />
        )}

        {showPostForm && (
          <PostForm 
            key="post-form"
            onSubmit={handleCreatePost}
            onClose={() => setShowPostForm(false)}
          />
        )}

        {showLogin && (
          <Login 
            key="login"
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        )}

        {showSignUp && (
          <SignUp 
            key="signup"
            onClose={() => setShowSignUp(false)}
            onSignUp={handleSignUp}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}

        {showProfile && user && (
          <UserProfile 
            key="user-profile"
            user={user}
            posts={posts}
            comments={comments} // This might need to be filtered for user's comments if API doesn't return all comments for user profile
            onClose={() => setShowProfile(false)}
            onNavigateToSettings={() => {
              setShowProfile(false);
              setShowSettings(true);
            }}
            onSelectPost={setSelectedPost}
            isOwnProfile={true}
          />
        )}

        {showSettings && user && (
          <UserSettings 
            key="user-settings"
            user={user}
            onClose={() => setShowSettings(false)}
            onUpdateUser={handleUpdateUser}
            onChangePassword={handleChangePassword}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </AnimatePresence>

      <Toaster position="bottom-right" richColors />

      {/* Quick Add Button (Mobile) */}
      <button 
        onClick={() => setShowPostForm(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 animate-in fade-in zoom-in cursor-pointer"
      >
        <Plus size={28} />
      </button>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <div className="bg-blue-600 p-1 rounded text-white"><Search size={16} /></div>
            FoundIt
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">{t.footer.tagline}</p>
          <div className="flex gap-6 text-sm font-bold text-gray-500 dark:text-gray-400">
            <button className="hover:text-blue-600 cursor-pointer">{t.footer.privacy}</button>
            <button className="hover:text-blue-600 cursor-pointer">{t.footer.terms}</button>
            <button className="hover:text-blue-600 cursor-pointer">{t.footer.help}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}