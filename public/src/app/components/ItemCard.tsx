import React from 'react';
import { MapPin, Calendar, Tag, User, MessageCircle } from 'lucide-react';
import { Post } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useApp } from '../contexts/AppContext';

interface ItemCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ post, onClick }) => {
  const { t } = useApp();
  const isLost = post.type === 'lost';

  return (
    <div
      onClick={() => onClick(post)}
      className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-video overflow-hidden">
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isLost ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          {isLost ? t.grid.lost : t.grid.found}
        </div>
        {post.status !== 'active' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-lg shadow-lg rotate-[-12deg]">
              {isLost ? t.card.found : t.card.collected}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
          <Tag size={12} />
          {t.grid.categories[post.category as keyof typeof t.grid.categories] || post.category}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
          {post.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 flex-1">
          {post.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={14} className="text-blue-500" />
            <span className="truncate">{post.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={14} className="text-blue-500" />
            <span>{post.date}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
              <User size={12} />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{post.userName}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MessageCircle size={14} />
            <span>{t.card.info}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
