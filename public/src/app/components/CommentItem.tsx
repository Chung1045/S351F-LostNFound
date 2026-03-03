import React, { useState } from 'react';
import { Comment, User as UserType } from '../types';
import { format } from 'date-fns';
import { Flag } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface CommentItemProps {
  comment: Comment;
  currentUser: UserType | null;
  onReport: (reason: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUser, onReport }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const isOwnComment = currentUser?.id === comment.userId;

  const handleReportSubmit = () => {
    if (!reportReason.trim()) return;
    setShowReportModal(false);
    setShowReportConfirm(true);
  };

  const confirmReport = () => {
    onReport(reportReason);
    setShowReportConfirm(false);
    setReportReason('');
  };

  return (
    <>
      <div className="flex gap-2 sm:gap-3 group">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
          {comment.userName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 md:bg-white p-3 sm:p-4 rounded-xl md:rounded-2xl rounded-tl-none md:shadow-sm md:border md:border-gray-100 relative">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-bold text-gray-900">{comment.userName}</p>
              {currentUser && !isOwnComment && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Report comment"
                >
                  <Flag size={12} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">{comment.content}</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 sm:mt-1.5 ml-1">
            {format(new Date(comment.createdAt), 'h:mm a')}
          </p>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Report Comment</h3>
            <p className="text-sm text-gray-500 mb-4">Why are you reporting this comment?</p>
            
            <textarea 
              className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm resize-none mb-4"
              rows={3}
              placeholder="Spam, harassment, inappropriate content..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              autoFocus
            />

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 cursor-pointer text-sm sm:text-base"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Confirmation Dialog */}
      {showReportConfirm && (
        <ConfirmDialog
          title="Report Comment"
          message={`You're about to report this comment for: "${reportReason}". Admins will review it shortly.`}
          confirmText="Confirm Report"
          cancelText="Cancel"
          variant="warning"
          onConfirm={confirmReport}
          onCancel={() => setShowReportConfirm(false)}
        />
      )}
    </>
  );
};
