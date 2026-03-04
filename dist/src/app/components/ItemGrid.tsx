import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Grid2X2, List, X } from 'lucide-react';
import { Post, Category, ItemType } from '../types';
import { ItemCard } from './ItemCard';
import { motion, AnimatePresence } from 'motion/react';

interface ItemGridProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

const CATEGORIES: Category[] = ['Electronics', 'Clothing', 'Documents', 'Keys', 'Wallets', 'Pets', 'Other'];

export const ItemGrid: React.FC<ItemGridProps> = ({ posts, onSelectPost }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) || 
                           post.location.toLowerCase().includes(search.toLowerCase()) ||
                           post.description.toLowerCase().includes(search.toLowerCase());
      const matchesTab = activeTab === 'all' || post.type === activeTab;
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesTab && matchesCategory;
    });
  }, [posts, search, activeTab, selectedCategory]);

  return (
    <div className="space-y-8 pb-20">
      {/* Search and Main Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by keyword, location, or item..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('lost')}
              className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'lost' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Lost
            </button>
            <button 
              onClick={() => setActiveTab('found')}
              className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'found' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Found
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              selectedCategory === 'All' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          Showing <span className="font-bold text-gray-900">{filteredPosts.length}</span> items
        </p>
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-blue-600"><Grid2X2 size={20} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"><List size={20} /></button>
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ItemCard post={post} onClick={onSelectPost} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 max-w-xs">
            We couldn't find any items matching your current filters. Try adjusting your search.
          </p>
          <button 
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setActiveTab('all');
            }}
            className="mt-6 text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
