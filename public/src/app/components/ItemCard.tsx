import React from 'react';
import { MapPin, Calendar, Tag, User, MessageCircle } from 'lucide-react';
import { Post } from '../types';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItemCardProps {
  post: Post;
  onClick: (post: Post) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ post, onClick }) => {
  const isLost = post.type === 'lost';
  
  return (
    <div 
      onClick={() => onClick(post)}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 cursor-pointer flex flex-col h-full"
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
          {post.type}
        </div>
        {post.status === 'resolved' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-lg shadow-lg rotate-[-12deg]">
              {isLost ? 'FOUND' : 'COLLECTED'}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2">
          <Tag size={12} />
          {post.category}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
          {post.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
          {post.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={14} className="text-blue-500" />
            <span className="truncate">{post.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={14} className="text-blue-500" />
            <span>{post.date}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <User size={12} />
            </div>
            <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">{post.userName}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MessageCircle size={14} />
            <span>Info</span>
          </div>
        </div>
      </div>
    </div>
  );
};
