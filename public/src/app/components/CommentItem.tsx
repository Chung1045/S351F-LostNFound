import React, { useState } from 'react';
import { Comment, User as UserType } from '../types';
import { format } from 'date-fns';
import { Flag } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { useApp } from '../contexts/AppContext';

interface CommentItemProps {
  comment: Comment;
  currentUser: UserType | null;
  onReport: (reason: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, currentUser, onReport }) => {
  const { t } = useApp();
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
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
          {comment.userName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700 md:bg-white dark:md:bg-gray-750 p-3 sm:p-4 rounded-xl md:rounded-2xl rounded-tl-none md:shadow-sm md:border md:border-gray-100 dark:md:border-gray-700 relative">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white">{comment.userName}</p>
              {currentUser && !isOwnComment && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title={t.comment.reportComment}
                >
                  <Flag size={12} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 sm:mt-1.5 ml-1">
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
            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-4 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.comment.reportComment}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.comment.reportSubtitle}</p>

            <textarea
              className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-100 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm resize-none mb-4"
              rows={3}
              placeholder={t.comment.reportPlaceholder}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportReason(''); }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer text-sm sm:text-base"
              >
                {t.comment.cancel}
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all disabled:opacity-50 cursor-pointer text-sm sm:text-base"
              >
                {t.comment.submitReport}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportConfirm && (
        <ConfirmDialog
          title={t.comment.reportConfirmTitle}
          message={t.comment.reportConfirmMessage(reportReason)}
          confirmText={t.comment.confirmReport}
          cancelText={t.comment.cancel}
          variant="warning"
          onConfirm={confirmReport}
          onCancel={() => setShowReportConfirm(false)}
        />
      )}
    </>
  );
};
