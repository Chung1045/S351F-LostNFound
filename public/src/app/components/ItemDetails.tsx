import React, { useState } from 'react';
import { Post, Comment, User as UserType } from '../types';
import { X, MapPin, Calendar, Clock, Phone, User, MessageCircle, Send, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItemDetailsProps {
  post: Post;
  comments: Comment[];
  currentUser: UserType | null;
  onClose: () => void;
  onAddComment: (content: string) => void;
  onUpdateStatus: () => void;
  onReport: (reason: string) => void;
  onDelete: () => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ 
  post, 
  comments, 
  currentUser, 
  onClose, 
  onAddComment, 
  onUpdateStatus, 
  onReport,
  onDelete
}) => {
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  
  const isOwner = currentUser?.id === post.userId;
  const isAdmin = currentUser?.role === 'admin';
  const isLost = post.type === 'lost';

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row min-h-screen md:min-h-0 md:max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
        
        {/* Left Side: Media & Info */}
        <div className="flex-1 overflow-y-auto border-r border-gray-100 no-scrollbar">
          <div className="relative aspect-square md:aspect-video w-full">
            <ImageWithFallback 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <button 
              onClick={onClose}
              className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 md:hidden"
            >
              <X size={24} />
            </button>
            <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
              isLost ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {post.type}
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-tight">
                  {post.category}
                </div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>Posted {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                  <span>•</span>
                  <span className={`font-semibold ${post.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                    {post.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {post.status === 'active' && (isOwner || isAdmin) && (
                <button 
                  onClick={onUpdateStatus}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 cursor-pointer"
                >
                  <CheckCircle size={18} />
                  Mark as {isLost ? 'Found' : 'Collected'}
                </button>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-lg italic">
              "{post.description}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-gray-900">{post.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                  <p className="font-semibold text-gray-900">{post.date} at {post.time}</p>
                </div>
              </div>
            </div>

            {currentUser ? (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Contact Info</p>
                    <p className="font-bold text-blue-900 text-lg">{post.contactInfo}</p>
                  </div>
                </div>
                <button className="text-blue-600 font-bold hover:underline cursor-pointer">Call Now</button>
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-2xl text-center">
                <p className="text-gray-500 font-medium mb-3">Login to view contact information</p>
                <button className="px-6 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-900 hover:bg-gray-50 transition-all cursor-pointer">Log In</button>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {post.userName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{post.userName}</p>
                  <p className="text-xs text-gray-500">Post Creator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isOwner && (
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 font-medium transition-colors cursor-pointer"
                  >
                    <AlertTriangle size={16} />
                    Report
                  </button>
                )}
                {(isOwner || isAdmin) && (
                  <button 
                    onClick={onDelete}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-medium transition-colors cursor-pointer ml-4"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Comments */}
        <div className="w-full md:w-[400px] flex flex-col bg-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white hidden md:flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              Information Exchange
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-400 cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                    {comment.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                      <p className="text-xs font-bold text-gray-900 mb-1">{comment.userName}</p>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                      {format(new Date(comment.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-6">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No comments yet</p>
                <p className="text-xs mt-1">Have information about this item? Leave a comment below.</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-100">
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="relative">
                <input 
                  type="text"
                  placeholder="Ask a question or provide info..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <p className="text-xs text-center text-gray-500 italic">Please log in to participate in the discussion.</p>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Report Post</h3>
            <p className="text-sm text-gray-500 mb-6">Why are you reporting this post? Our admins will review it.</p>
            
            <textarea 
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm resize-none mb-6"
              rows={3}
              placeholder="Spam, inappropriate content, fake info..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onReport(reportReason);
                  setShowReportModal(false);
                }}
                disabled={!reportReason.trim()}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
