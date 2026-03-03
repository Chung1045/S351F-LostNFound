import React from 'react';
import { Post, Report, User as UserType } from '../types';
import { ShieldCheck, AlertCircle, CheckCircle, Trash2, User, Eye, ArrowRight, Flag, Calendar, MapPin } from 'lucide-react';

interface AdminDashboardProps {
  posts: Post[];
  reports: Report[];
  users: UserType[];
  onReviewPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onResolveReport: (reportId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  posts,
  reports,
  users,
  onReviewPost,
  onDeletePost,
  onResolveReport
}) => {
  const pendingReports = reports.filter(r => r.status === 'pending');
  const reportedPosts = posts.filter(p => p.isReported);
  
  // Sort posts: reported first, then by creation date
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isReported && !b.isReported) return -1;
    if (!a.isReported && b.isReported) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-10 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Total Posts</p>
          <p className="text-3xl font-black text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-red-500 text-sm font-medium mb-1">Active Reports</p>
          <p className="text-3xl font-black text-red-600">{pendingReports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-blue-500 text-sm font-medium mb-1">Total Users</p>
          <p className="text-3xl font-black text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-green-500 text-sm font-medium mb-1">Resolved Cases</p>
          <p className="text-3xl font-black text-green-600">
            {posts.filter(p => p.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Post Management Section - Full Width */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-500" />
              Post Management
            </h3>
            <p className="text-sm text-gray-500 mt-1">Recently reported posts appear first</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
              {reportedPosts.length} Reported
            </span>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              {posts.length} Total
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
          {sortedPosts.map((post) => (
            <div 
              key={post.id} 
              className={`p-6 hover:bg-gray-50 transition-colors ${post.isReported ? 'bg-red-50/30' : ''}`}
            >
              <div className="flex gap-4">
                {/* Post Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-24 h-24 object-cover rounded-2xl border border-gray-200"
                  />
                </div>

                {/* Post Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isReported && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <Flag size={12} />
                            REPORTED
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                          post.type === 'lost' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {post.type}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                          {post.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          post.status === 'active' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1 text-lg">{post.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{post.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{post.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReviewPost(post)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${post.title}"? This action cannot be undone.`)) {
                            onDeletePost(post.id);
                          }
                        }}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Post"
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
            <div className="p-12 text-center text-gray-400">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" />
              <p>No posts to manage</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports Management */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Recent Reports
            </h3>
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
              {pendingReports.length} Pending
            </span>
          </div>
          
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto no-scrollbar">
            {pendingReports.length > 0 ? (
              pendingReports.map((report) => {
                const targetPost = posts.find(p => p.id === report.targetId);
                return (
                  <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          <User size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">Reporter #{report.reporterId.slice(0, 4)}</span>
                      </div>
                      <span className="text-xs text-gray-400 italic">2 hours ago</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                      <span className="font-bold text-red-700">Reason:</span> {report.reason}
                    </p>

                    <div className="flex items-center justify-between">
                      {targetPost && (
                        <button 
                          onClick={() => onReviewPost(targetPost)}
                          className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          View Target Post <ArrowRight size={12} />
                        </button>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onResolveReport(report.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                          title="Resolve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this reported post?')) {
                              onDeletePost(report.targetId);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                <p>All reports resolved!</p>
              </div>
            )}
          </div>
        </div>

        {/* User Management Simulation */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-blue-500" />
              Registered Users
            </h3>
          </div>
          
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto no-scrollbar">
            {users.map((user) => (
              <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
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
    </div>
  );
};