import React from 'react';
import { Bell, Check, Trash2, Clock, Info, AlertCircle } from 'lucide-react';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../contexts/AppContext';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onClose
}) => {
  const { t } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <Info className="text-blue-500" size={18} />;
      case 'report_resolved':
        return <Check className="text-green-500" size={18} />;
      case 'post_deleted':
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={16} className="text-blue-600" />
          {t.notifications?.title || 'Notifications'}
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            {t.notifications?.markAllRead || 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="text-gray-400" size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {t.notifications?.empty || 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className={`px-4 py-4 flex gap-3 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!notification.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-400">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"
                    title="Mark as read"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-center">
          <button
            onClick={onClose}
            className="text-[10px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors uppercase tracking-wider"
          >
            {t.ui?.close || 'Close'}
          </button>
        </div>
      )}
    </div>
  );
};
