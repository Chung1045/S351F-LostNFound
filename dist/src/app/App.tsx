import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ItemGrid } from './components/ItemGrid';
import { PostForm } from './components/PostForm';
import { ItemDetails } from './components/ItemDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { UserProfile } from './components/UserProfile';
import { UserSettings } from './components/UserSettings';
import { Post, Comment, User, Report } from './types';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Plus, ArrowRight } from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: '2', name: 'Admin Jane', email: 'admin@foundit.com', role: 'admin' },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    type: 'lost',
    title: 'Blue Leather Wallet',
    category: 'Wallets',
    description: 'Lost my wallet near the central park entrance. It contains a drivers license and some cash. Small scratch on the front.',
    location: 'Central Park Entrance',
    date: '2026-02-10',
    time: '14:30',
    contactInfo: '555-0123',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    userId: '1',
    userName: 'John Doe',
    createdAt: '2026-02-10T15:00:00Z',
  },
  {
    id: 'p2',
    type: 'found',
    title: 'iPhone 15 Pro - Titanium',
    category: 'Electronics',
    description: 'Found a phone on a bench at the library. It has a transparent case and a sticker of a cat on the back.',
    location: 'City Public Library',
    date: '2026-02-12',
    time: '09:15',
    contactInfo: 'admin@library.org',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    userId: '2',
    userName: 'Library Admin',
    createdAt: '2026-02-12T10:00:00Z',
    isReported: true,
  },
  {
    id: 'p3',
    type: 'lost',
    title: 'Golden Retriever Pup',
    category: 'Pets',
    description: 'Our puppy "Cooper" ran out of the gate this morning. He is wearing a blue collar with his name. Very friendly!',
    location: 'Maplewood Neighborhood',
    date: '2026-02-13',
    time: '08:00',
    contactInfo: '555-9876',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    userId: '1',
    userName: 'John Doe',
    createdAt: '2026-02-13T09:00:00Z',
  },
  {
    id: 'p4',
    type: 'found',
    title: 'Red Bicycle',
    category: 'Other',
    description: 'Found a red mountain bike locked to the fence. Has been here for over a week.',
    location: 'Downtown Station',
    date: '2026-02-15',
    time: '12:00',
    contactInfo: '555-4567',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    userId: '2',
    userName: 'Station Manager',
    createdAt: '2026-02-15T13:00:00Z',
  },
  {
    id: 'p5',
    type: 'lost',
    title: 'Black Backpack with Laptop',
    category: 'Other',
    description: 'Lost my backpack containing a laptop and important documents. The bag is a black JanSport with a NASA patch.',
    location: 'Coffee House on Main St',
    date: '2026-02-20',
    time: '16:45',
    contactInfo: '555-7890',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    status: 'active',
    userId: '1',
    userName: 'Sarah Mitchell',
    createdAt: '2026-02-20T17:00:00Z',
    isReported: true,
  },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', postId: 'p1', userId: '2', userName: 'Jane Smith', content: 'I saw someone picking up a wallet near the fountain around 3 PM!', createdAt: '2026-02-10T16:00:00Z' },
  { id: 'c2', postId: 'p2', userId: '1', userName: 'John Doe', content: 'I lost my phone there! Does it have a cracked screen?', createdAt: '2026-02-12T11:00:00Z' },
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'r1',
    targetType: 'post',
    targetId: 'p2',
    reporterId: '1',
    reason: 'Suspicious content - phone details seem fake',
    status: 'pending',
  },
  {
    id: 'r2',
    targetType: 'post',
    targetId: 'p5',
    reporterId: '2',
    reason: 'Possible scam attempt',
    status: 'pending',
  },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auth with role-based redirect
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowLogin(false);
    
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

  const handleSignUp = (userData: Omit<User, 'id' | 'role'> & { password: string }) => {
    // Create new user (in real app, this would be an API call)
    const newUser: User = {
      id: `u${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: 'user', // New users are regular users by default
    };

    // Add to users list (in real app, this would be handled by backend)
    INITIAL_USERS.push(newUser);

    // Auto-login the new user
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
    setUser(null);
    setCurrentPage('home');
    toast.info('Signed out successfully');
  };

  // Post Actions
  const handleCreatePost = (data: Partial<Post>) => {
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    const newPost: Post = {
      ...data as Post,
      id: `p${posts.length + 1}`,
      userId: user.id,
      userName: user.name,
      status: 'active',
      createdAt: new Date().toISOString(),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1621735320171-a682f45d7172?auto=format&fit=crop&q=80&w=800', // Default if none
    };

    setPosts([newPost, ...posts]);
    setShowPostForm(false);
    toast.success('Your post has been published!');
  };

  const handleUpdatePostStatus = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'resolved' } : p));
    toast.success('Status updated successfully!');
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setComments(prev => prev.filter(c => c.postId !== postId));
    setSelectedPost(null);
    toast.success('Post removed');
  };

  // Comment Actions
  const handleAddComment = (postId: string, content: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: `c${comments.length + 1}`,
      postId,
      userId: user.id,
      userName: user.name,
      content,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    toast.success('Comment added');
  };

  // Moderation Actions
  const handleReport = (postId: string, reason: string) => {
    if (!user) return;
    const newReport: Report = {
      id: `r${reports.length + 1}`,
      targetType: 'post',
      targetId: postId,
      reporterId: user.id,
      reason,
      status: 'pending',
    };
    setReports([...reports, newReport]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isReported: true } : p));
    toast.error('Report submitted for review');
  };

  const handleResolveReport = (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    toast.success('Report resolved');
  };

  // User Profile & Settings Actions
  const handleUpdateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // Update user in the users list
    const userIndex = INITIAL_USERS.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      INITIAL_USERS[userIndex] = updatedUser;
    }
    
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = (currentPassword: string, newPassword: string) => {
    // In a real app, you'd verify the current password and update it
    toast.success('Password changed successfully!');
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    
    // Remove user's posts and comments
    setPosts(prev => prev.filter(p => p.userId !== user.id));
    setComments(prev => prev.filter(c => c.userId !== user.id));
    
    // Remove user from users list
    const userIndex = INITIAL_USERS.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      INITIAL_USERS.splice(userIndex, 1);
    }
    
    // Logout
    setUser(null);
    setShowSettings(false);
    setCurrentPage('home');
    toast.error('Account deleted successfully');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        user={user} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
        onAuth={handleShowLogin}
        onCreatePost={() => setShowPostForm(true)}
        onShowProfile={() => setShowProfile(true)}
        onShowSettings={() => setShowSettings(true)}
        currentPage={currentPage}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden rounded-[40px] bg-linear-to-br from-blue-700 to-indigo-900 text-white p-8 md:p-16">
                <div className="relative z-10 max-w-2xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold border border-white/20">
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Connecting communities worldwide
                  </div>
                  <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                    Lost it? <span className="text-blue-300">Found it.</span>
                  </h1>
                  <p className="text-xl text-blue-100/80 leading-relaxed font-medium">
                    The centralized platform to report missing items and help others recover what they've lost. Simple, fast, and community-driven.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => setShowPostForm(true)}
                      className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl shadow-black/20 flex items-center gap-2 group cursor-pointer"
                    >
                      Report Item <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <button 
                      onClick={() => {
                        const el = document.getElementById('browse');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-4 bg-blue-600/30 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      Start Browsing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] bg-blue-500/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[80%] bg-indigo-500/20 blur-[100px] rounded-full" />
                <div className="hidden md:block absolute right-12 bottom-12 w-64 h-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl rotate-12 shadow-2xl animate-bounce-slow">
                   <div className="p-6 space-y-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl" />
                      <div className="w-full h-4 bg-white/20 rounded-full" />
                      <div className="w-3/4 h-4 bg-white/20 rounded-full" />
                   </div>
                </div>
              </section>

              {/* Browse Section */}
              <section id="browse">
                <ItemGrid 
                  posts={posts} 
                  onSelectPost={setSelectedPost} 
                />
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
                  <h1 className="text-3xl font-black text-gray-900">Admin Command Center</h1>
                  <p className="text-gray-500">Monitor reports and moderate community content.</p>
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
                users={INITIAL_USERS}
                onReviewPost={setSelectedPost}
                onDeletePost={handleDeletePost}
                onResolveReport={handleResolveReport}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {selectedPost && (
          <ItemDetails 
            post={selectedPost}
            comments={comments.filter(c => c.postId === selectedPost.id)}
            currentUser={user}
            onClose={() => setSelectedPost(null)}
            onAddComment={(content) => handleAddComment(selectedPost.id, content)}
            onUpdateStatus={() => handleUpdatePostStatus(selectedPost.id)}
            onReport={(reason) => handleReport(selectedPost.id, reason)}
            onDelete={() => handleDeletePost(selectedPost.id)}
          />
        )}

        {showPostForm && (
          <PostForm 
            onSubmit={handleCreatePost}
            onClose={() => setShowPostForm(false)}
          />
        )}

        {showLogin && (
          <Login 
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
            users={INITIAL_USERS}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        )}

        {showSignUp && (
          <SignUp 
            onClose={() => setShowSignUp(false)}
            onSignUp={handleSignUp}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}

        {showProfile && user && (
          <UserProfile 
            user={user}
            posts={posts}
            comments={comments}
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
      <footer className="border-t border-gray-100 bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="bg-blue-600 p-1 rounded text-white"><Search size={16} /></div>
            FoundIt
          </div>
          <p className="text-gray-400 text-sm font-medium">© 2026 FoundIt Lost & Found Platform. Helping communities stay connected.</p>
          <div className="flex gap-6 text-sm font-bold text-gray-500">
            <button className="hover:text-blue-600 cursor-pointer">Privacy</button>
            <button className="hover:text-blue-600 cursor-pointer">Terms</button>
            <button className="hover:text-blue-600 cursor-pointer">Help</button>
          </div>
        </div>
      </footer>
    </div>
  );
}