import React, { useState } from 'react';
import { Post, Report, User as UserType } from '../types';
import { ShieldCheck, AlertCircle, CheckCircle, Trash2, User, Eye, ArrowRight, Flag, Calendar, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ConfirmDialog } from './ConfirmDialog';

interface AdminDashboardProps {
  posts: Post[];
  reports: Report[];
  users: UserType[];
  onReviewPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onResolveReport: (reportId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ posts, reports, users, onReviewPost, onDeletePost, onResolveReport }) => {
  const { t } = useApp();
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const pendingReports = reports.filter(r => r.status === 'pending');
  const reportedPosts = posts.filter(p => p.isReported);

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isReported && !b.isReported) return -1;
    if (!a.isReported && b.isReported) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{t.admin.totalPosts}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{posts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-red-500 text-sm font-medium mb-1">{t.admin.activeReports}</p>
          <p className="text-3xl font-black text-red-600">{pendingReports.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-blue-500 text-sm font-medium mb-1">{t.admin.totalUsers}</p>
          <p className="text-3xl font-black text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-green-500 text-sm font-medium mb-1">{t.admin.resolvedCases}</p>
          <p className="text-3xl font-black text-green-600">{posts.filter(p => p.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Post Management */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-500" />
              {t.admin.postManagement}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.admin.postManagementSubtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-red-50 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
              {reportedPosts.length} {t.admin.reported}
            </span>
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              {posts.length} {t.admin.total}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {sortedPosts.map((post) => (
            <div key={post.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${post.isReported ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img src={post.imageUrl} alt={post.title} className="w-24 h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {post.isReported && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                            <Flag size={12} />
                            {t.admin.reportedBadge}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${post.type === 'lost' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {post.type === 'lost' ? t.grid.lost : t.grid.found}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold">
                          {t.grid.categories[post.category as keyof typeof t.grid.categories] || post.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${post.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                          {post.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-lg">{post.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{post.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1"><User size={14} /><span>{post.userName}</span></div>
                        <div className="flex items-center gap-1"><MapPin size={14} /><span>{post.location}</span></div>
                        <div className="flex items-center gap-1"><Calendar size={14} /><span>{new Date(post.createdAt).toLocaleDateString()}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onReviewPost(post)} className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer">
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`Delete "${post.title}"?`)) onDeletePost(post.id); }}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
              <p>No posts to manage</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Management */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              {t.admin.reports}
            </h3>
            <span className="bg-red-50 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
              {pendingReports.length} {t.admin.pending}
            </span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[500px] overflow-y-auto no-scrollbar">
            {pendingReports.length > 0 ? (
              pendingReports.map((report) => {
                const targetPost = posts.find(p => p.id === report.targetId);
                return (
                  <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Reporter #{report.reporterId.slice(0, 4)}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">2 hours ago</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/40 mb-4">
                      <span className="font-bold text-red-700 dark:text-red-400">Reason:</span> {report.reason}
                    </p>
                    <div className="flex items-center justify-between">
                      {targetPost && (
                        <button onClick={() => onReviewPost(targetPost)} className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                          View Target Post <ArrowRight size={12} />
                        </button>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onResolveReport(report.id)} 
                          className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                        >
                          <CheckCircle size={16} />
                          Resolve
                        </button>
                        <button 
                          onClick={() => setReportToDelete(report.targetId)} 
                          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                        >
                          <Trash2 size={16} />
                          Delete Post
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                <p>{t.admin.noReports}</p>
              </div>
            )}
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              Registered Users
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-[500px] overflow-y-auto no-scrollbar">
            {users.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                    {user.role}
                  </span>
                  {user.role !== 'admin' && (
                    <button className="text-red-400 hover:text-red-600 p-2 cursor-pointer transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reportToDelete && (
        <ConfirmDialog
          title="Delete Reported Post?"
          message="This action will permanently remove the reported item from the platform. This cannot be undone."
          confirmText="Delete Post"
          variant="danger"
          onConfirm={() => {
            onDeletePost(reportToDelete);
            setReportToDelete(null);
          }}
          onCancel={() => setReportToDelete(null)}
        />
      )}
    </div>
  );
};
