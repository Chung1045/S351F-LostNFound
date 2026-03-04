import React from 'react';
import { useForm } from 'react-hook-form';
import { Post, Category, ItemType } from '../types';
import { X, Camera, MapPin, Calendar, Clock, Phone, AlertCircle } from 'lucide-react';

interface PostFormProps {
  onSubmit: (data: Partial<Post>) => void;
  onClose: () => void;
  initialData?: Post;
}

const CATEGORIES: Category[] = ['Electronics', 'Clothing', 'Documents', 'Keys', 'Wallets', 'Pets', 'Other'];

export const PostForm: React.FC<PostFormProps> = ({ onSubmit, onClose, initialData }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      type: 'lost' as ItemType,
      category: 'Electronics' as Category,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
  });

  const watchType = watch('type');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? 'Edit Post' : `Report ${watchType === 'lost' ? 'Lost' : 'Found'} Item`}
            </h2>
            <p className="text-sm text-gray-500">Please provide as much detail as possible to help recovery.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="space-y-6">
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl">
              <label className={`flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer transition-all ${watchType === 'lost' ? 'bg-white text-red-600 shadow-sm font-bold' : 'text-gray-500'}`}>
                <input type="radio" value="lost" {...register('type')} className="hidden" />
                I Lost Something
              </label>
              <label className={`flex items-center justify-center gap-2 py-3 rounded-lg cursor-pointer transition-all ${watchType === 'found' ? 'bg-white text-green-600 shadow-sm font-bold' : 'text-gray-500'}`}>
                <input type="radio" value="found" {...register('type')} className="hidden" />
                I Found Something
              </label>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Item Title</label>
                <input 
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g. Blue iPhone 13, Leather Wallet"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                {errors.title && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.title.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select 
                  {...register('category')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Time */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  {...register('location', { required: 'Location is required' })}
                  placeholder="Where was it lost/found?"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Time (Approx)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="time"
                    {...register('time')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea 
                {...register('description', { required: 'Description is required' })}
                rows={4}
                placeholder="Describe the item in detail. Any unique marks, colors, or contents?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Contact Information</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  {...register('contactInfo', { required: 'Contact info is required' })}
                  placeholder="Phone number or Email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 italic">This will only be visible to registered users who interact with your post.</p>
            </div>

            {/* Image Placeholder */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Upload Photos</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 shadow-sm transition-colors">
                  <Camera size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Click to upload photos</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                </div>
                {/* Simulation: Just adding a default image URL if none provided */}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-2 px-6 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer"
            >
              {initialData ? 'Save Changes' : `Submit Post`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
