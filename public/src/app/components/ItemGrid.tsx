import React, { useState, useMemo } from 'react';
import { Search, Grid2X2, List } from 'lucide-react';
import { Post, Category, ItemType } from '../types';
import { ItemCard } from './ItemCard';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext';

interface ItemGridProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

const CATEGORIES: Category[] = ['Electronics', 'Clothing', 'Documents', 'Keys', 'Wallets', 'Pets', 'Other'];

export const ItemGrid: React.FC<ItemGridProps> = ({ posts, onSelectPost }) => {
  const { t } = useApp();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ItemType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

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
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Search and Main Filters */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t.grid.searchPlaceholder}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg sm:rounded-xl w-full md:w-auto gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-initial md:px-4 lg:px-6 px-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {t.grid.all}
            </button>
            <button
              onClick={() => setActiveTab('lost')}
              className={`flex-1 md:flex-initial md:px-4 lg:px-6 px-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'lost' ? 'bg-white dark:bg-gray-700 text-red-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {t.grid.lost}
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`flex-1 md:flex-initial md:px-4 lg:px-6 px-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'found' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {t.grid.found}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-gray-700'
            }`}
          >
            {t.grid.categories.All}
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              {t.grid.categories[cat as keyof typeof t.grid.categories]}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          <span className="font-bold text-gray-900 dark:text-white">{filteredPosts.length}</span> {t.grid.items}
        </p>
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-blue-600"><Grid2X2 size={18} /></button>
          <button className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer dark:text-gray-400"><List size={18} /></button>
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search size={28} className="text-gray-300 dark:text-gray-600 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{t.grid.noItemsTitle}</h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xs">{t.grid.noItemsDesc}</p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('All'); setActiveTab('all'); }}
            className="mt-6 text-sm sm:text-base text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            {t.grid.clearFilters}
          </button>
        </div>
      )}
    </div>
  );
};
