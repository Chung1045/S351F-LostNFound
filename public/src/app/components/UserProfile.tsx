import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, MapPin, Calendar, Mail, MessageCircle, Package, X, Edit } from 'lucide-react';
import { User as UserType, Post, Comment } from '../types';

interface UserProfileProps {
  user: UserType;
  posts: Post[];
  comments: Comment[];
  onClose: () => void;
  onNavigateToSettings: () => void;
  onSelectPost: (post: Post) => void;
  isOwnProfile: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  posts, 
  comments, 
  onClose, 
  onNavigateToSettings,
  onSelectPost,
  isOwnProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  const userPosts = posts.filter(p => p.userId === user.id);
  const userComments = comments.filter(c => c.userId === user.id);

  const stats = [
    { label: 'Posts', value: userPosts.length, icon: Package },
    { label: 'Comments', value: userComments.length, icon: MessageCircle },
    { label: 'Resolved', value: userPosts.filter(p => p.status === 'resolved').length, icon: Calendar },
  ];

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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30">
                <User size={48} />
              </div>
              {user.role === 'admin' && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-black">
                  ADMIN
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">{user.name}</h1>
              <div className="flex items-center gap-2 text-blue-100 mb-3">
                <Mail size={16} />
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar size={16} />
                <span className="text-sm font-medium">Member since Feb 2026</span>
              </div>
            </div>

            {/* Settings Button */}
            {isOwnProfile && (
              <button
                onClick={onNavigateToSettings}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <stat.icon size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-4 font-bold transition-all cursor-pointer relative ${
                activeTab === 'posts'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts ({userPosts.length})
              {activeTab === 'posts' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-4 font-bold transition-all cursor-pointer relative ${
                activeTab === 'comments'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comments ({userComments.length})
              {activeTab === 'comments' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold">No posts yet</p>
                  <p className="text-sm text-gray-400">
                    {isOwnProfile ? "Start by reporting a lost or found item" : "This user hasn't posted anything yet"}
                  </p>
                </div>
              ) : (
                userPosts.map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      onSelectPost(post);
                      onClose();
                    }}
                  >
                    {/* Post Image */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Post Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-black text-gray-900 truncate">{post.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap ${
                          post.type === 'lost' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {post.type === 'lost' ? 'LOST' : 'FOUND'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {post.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        {post.status === 'resolved' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                            Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {userComments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bold">No comments yet</p>
                  <p className="text-sm text-gray-400">
                    {isOwnProfile ? "Start helping others by commenting on posts" : "This user hasn't commented yet"}
                  </p>
                </div>
              ) : (
                userComments.map(comment => {
                  const relatedPost = posts.find(p => p.id === comment.postId);
                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-2xl hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <MessageCircle size={16} className="text-gray-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-gray-900">{comment.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                            {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {relatedPost && (
                        <div 
                          className="ml-7 pl-4 border-l-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => {
                            onSelectPost(relatedPost);
                            onClose();
                          }}
                        >
                          <p className="text-sm text-gray-500">
                            On post: <span className="font-bold text-gray-700">{relatedPost.title}</span>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
