import React, { useState } from 'react';
import { Post, Comment, User as UserType } from '../types';
import { X, MapPin, Calendar, Clock, Phone, User, MessageCircle, Send, AlertTriangle, CheckCircle, Trash2, ArrowLeft, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfirmDialog } from './ConfirmDialog';
import { CommentItem } from './CommentItem';

interface ItemDetailsProps {
  post: Post;
  comments: Comment[];
  currentUser: UserType | null;
  onClose: () => void;
  onAddComment: (content: string) => void;
  onUpdateStatus: () => void;
  onReport: (reason: string) => void;
  onDelete: () => void;
  onReportComment?: (commentId: string, reason: string) => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ 
  post, 
  comments, 
  currentUser, 
  onClose, 
  onAddComment, 
  onUpdateStatus, 
  onReport,
  onDelete,
  onReportComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
        
        {/* MOBILE LAYOUT - Vertical Stack */}
        <div className="md:hidden flex flex-col h-full overflow-y-auto">
          {/* Mobile Header with Back Button */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 line-clamp-1">{post.title}</h2>
              <p className="text-xs text-gray-500">{post.category}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isLost ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {post.type}
            </div>
          </div>

          {/* 1. INFORMATION FIRST */}
          <div className="p-4 space-y-4 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                {post.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                <span>Posted {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                <span>•</span>
                <span className={`font-semibold ${post.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                  {post.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                "{post.description}"
              </p>
            </div>

            {/* Location & Date Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{post.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase">Date & Time</p>
                  <p className="text-sm font-semibold text-gray-900">{post.date} at {post.time}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            {currentUser ? (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={18} className="text-blue-600" />
                  <p className="text-xs text-blue-500 font-bold uppercase">Contact Info</p>
                </div>
                <p className="font-bold text-blue-900 text-lg">{post.contactInfo}</p>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 font-medium">Login to view contact information</p>
              </div>
            )}

            {/* Action Buttons */}
            {post.status === 'active' && (isOwner || isAdmin) && (
              <button 
                onClick={() => setShowResolveConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer"
              >
                <CheckCircle size={18} />
                Mark as {isLost ? 'Found' : 'Collected'}
              </button>
            )}
          </div>

          {/* 2. PICTURE SECOND */}
          <div className="relative w-full aspect-square border-b border-gray-100">
            <ImageWithFallback 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 3. COMMENTS/CHATS THIRD */}
          <div className="p-4 space-y-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900">
                Comments ({comments.length})
              </h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUser={currentUser}
                    onReport={(reason) => onReportComment?.(comment.id, reason)}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="relative">
                <input 
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
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
              <p className="text-xs text-center text-gray-500 italic py-2">Please log in to comment.</p>
            )}
          </div>

          {/* 4. POST CREATOR DETAILS LAST */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {post.userName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{post.userName}</p>
                  <p className="text-xs text-gray-500">Post Creator</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {!isOwner && (
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <AlertTriangle size={18} />
                  </button>
                )}
                {(isOwner || isAdmin) && (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT - Original Two Column */}
        <div className="hidden md:flex flex-1 overflow-y-auto border-r border-gray-100 no-scrollbar">
          <div className="w-full">
            <div className="relative aspect-video w-full">
              <ImageWithFallback 
                src={post.imageUrl} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
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
                    onClick={() => setShowResolveConfirm(true)}
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
                      onClick={() => setShowDeleteConfirm(true)}
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
        </div>

        {/* Desktop Comments Sidebar */}
        <div className="hidden md:flex w-full md:w-[400px] flex-col bg-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
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
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  onReport={(reason) => onReportComment?.(comment.id, reason)}
                />
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

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          onConfirm={onDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Resolve Confirmation */}
      {showResolveConfirm && (
        <ConfirmDialog
          title={`Mark as ${isLost ? 'Found' : 'Collected'}`}
          message={`Are you sure you want to mark this item as ${isLost ? 'found' : 'collected'}? This will close the post and notify others.`}
          confirmText="Confirm"
          variant="info"
          onConfirm={() => {
            onUpdateStatus();
            setShowResolveConfirm(false);
          }}
          onCancel={() => setShowResolveConfirm(false)}
        />
      )}
    </div>
  );
};