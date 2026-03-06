import React, { useState } from 'react';
import { Post, Comment, User as UserType } from '../types';
import { X, MapPin, Calendar, Clock, Phone, User, MessageCircle, Send, AlertTriangle, CheckCircle, Trash2, ArrowLeft, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConfirmDialog } from './ConfirmDialog';
import { CommentItem } from './CommentItem';
import { useApp } from '../contexts/AppContext';

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
  onLogin?: () => void;
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
  onReportComment,
  onLogin
}) => {
  const { t } = useApp();
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
      <div className="bg-white dark:bg-gray-800 w-full max-w-5xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
        
        {/* MOBILE LAYOUT */}
        <div className="md:hidden flex flex-col h-full overflow-y-auto">
          {/* Mobile Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer">
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 dark:text-white line-clamp-1">{post.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.grid.categories[post.category as keyof typeof t.grid.categories] || post.category}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isLost ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {isLost ? t.grid.lost : t.grid.found}
            </div>
          </div>

          {/* 1. INFO */}
          <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2">{post.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-3">
                <span>Posted {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                <span>•</span>
                <span className={`font-semibold ${post.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>{post.status.toUpperCase()}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">"{post.description}"</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center text-blue-600"><MapPin size={20} /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase">{t.details.location}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <div className="w-10 h-10 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center text-blue-600"><Calendar size={20} /></div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase">{t.details.dateTime}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.date} {t.details.at} {post.time}</p>
                </div>
              </div>
            </div>
            {currentUser ? (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={18} className="text-blue-600" />
                  <p className="text-xs text-blue-500 font-bold uppercase">{t.details.contactInfo}</p>
                </div>
                <p className="font-bold text-blue-900 dark:text-blue-200 text-lg">{post.contactInfo}</p>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">{t.details.loginToView}</p>
                <button onClick={onLogin} className="px-4 py-1.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg font-bold text-gray-900 dark:text-white text-sm hover:bg-gray-50 dark:hover:bg-gray-500 transition-all cursor-pointer">{t.details.logIn}</button>
              </div>
            )}
            {post.status === 'active' && (isOwner || isAdmin) && (
              <button onClick={() => setShowResolveConfirm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer">
                <CheckCircle size={18} />
                {isLost ? t.details.markAsFound : t.details.markAsCollected}
              </button>
            )}
          </div>

          {/* 2. IMAGE */}
          <div className="relative w-full aspect-square border-b border-gray-100 dark:border-gray-700">
            <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* 3. COMMENTS */}
          <div className="p-4 space-y-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={20} className="text-blue-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">{t.details.comments} ({comments.length})</h3>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} currentUser={currentUser} onReport={(reason) => onReportComment?.(comment.id, reason)} />
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">{t.details.noComments}</p>
                  <p className="text-xs mt-1">{t.details.noCommentsHint2}</p>
                </div>
              )}
            </div>
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="relative">
                <input type="text" placeholder={t.details.commentPlaceholder2} className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all cursor-pointer"><Send size={18} /></button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">{t.details.loginToComment2}</p>
                <button onClick={onLogin} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer">
                  {t.details.logIn}
                </button>
              </div>
            )}
          </div>

          {/* 4. CREATOR */}
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-lg">{post.userName.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{post.userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.details.postCreator}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isOwner && (
                  <button onClick={() => setShowReportModal(true)} className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"><AlertTriangle size={18} /></button>
                )}
                {(isOwner || isAdmin) && (
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={18} /></button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex flex-1 overflow-y-auto border-r border-gray-100 dark:border-gray-700 no-scrollbar">
          <div className="w-full">
            <div className="relative aspect-video w-full">
              <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
              <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${isLost ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {isLost ? t.grid.lost : t.grid.found}
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-tight">
                    {t.grid.categories[post.category as keyof typeof t.grid.categories] || post.category}
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">{post.title}</h1>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <span>Posted {format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
                    <span>•</span>
                    <span className={`font-semibold ${post.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>{post.status.toUpperCase()}</span>
                  </div>
                </div>
                {post.status === 'active' && (isOwner || isAdmin) && (
                  <button onClick={() => setShowResolveConfirm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 cursor-pointer">
                    <CheckCircle size={18} />
                    {isLost ? t.details.markAsFound : t.details.markAsCollected}
                  </button>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg italic">"{post.description}"</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 dark:border-gray-600"><MapPin size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.details.location}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{post.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-gray-600 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 dark:border-gray-600"><Calendar size={24} /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.details.dateTime}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{post.date} {t.details.at} {post.time}</p>
                  </div>
                </div>
              </div>

              {currentUser ? (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600"><Phone size={24} /></div>
                    <div>
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">{t.details.contactInfo}</p>
                      <p className="font-bold text-blue-900 dark:text-blue-200 text-lg">{post.contactInfo}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-2xl text-center">
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-3">{t.details.loginToView}</p>
                  <button onClick={onLogin} className="px-6 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-500 transition-all cursor-pointer">{t.details.logIn}</button>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">{post.userName.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{post.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.details.postCreator}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isOwner && (
                    <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 font-medium transition-colors cursor-pointer">
                      <AlertTriangle size={16} />
                      {t.details.report}
                    </button>
                  )}
                  {(isOwner || isAdmin) && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-medium transition-colors cursor-pointer ml-4">
                      <Trash2 size={16} />
                      {t.details.delete}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Comments Sidebar */}
        <div className="hidden md:flex w-full md:w-[400px] flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              {t.details.infoExchange}
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-400 cursor-pointer"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} currentUser={currentUser} onReport={(reason) => onReportComment?.(comment.id, reason)} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 px-6">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p className="font-medium">{t.details.noComments}</p>
                <p className="text-xs mt-1">{t.details.noCommentsHint}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            {currentUser ? (
              <form onSubmit={handleSubmitComment} className="relative">
                <input type="text" placeholder={t.details.commentPlaceholder} className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all cursor-pointer"><Send size={18} /></button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">{t.details.loginToComment}</p>
                <button onClick={onLogin} className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer">
                  {t.details.logIn}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.details.reportPost}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.details.reportPostSubtitle}</p>
            <textarea className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-100 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm resize-none mb-6" rows={3} placeholder={t.details.reportPlaceholder} value={reportReason} onChange={(e) => setReportReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">{t.details.cancel}</button>
              <button onClick={() => { onReport(reportReason); setShowReportModal(false); }} disabled={!reportReason.trim()} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 cursor-pointer">{t.details.submitReport}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title={t.details.deleteTitle}
          message={t.details.deleteMessage}
          confirmText={t.details.delete}
          variant="danger"
          onConfirm={onDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showResolveConfirm && (
        <ConfirmDialog
          title={t.details.resolveTitle(isLost ? t.details.markAsFound : t.details.markAsCollected)}
          message={t.details.resolveMessage(isLost ? t.details.markAsFound.toLowerCase() : t.details.markAsCollected.toLowerCase())}
          confirmText={t.details.confirm}
          variant="info"
          onConfirm={() => { onUpdateStatus(); setShowResolveConfirm(false); }}
          onCancel={() => setShowResolveConfirm(false)}
        />
      )}
    </div>
  );
};