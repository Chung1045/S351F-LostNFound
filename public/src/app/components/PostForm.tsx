import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Post, Category, ItemType } from '../types';
import { X, Camera, MapPin, Calendar, Clock, Phone, AlertCircle, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface PostFormProps {
  onSubmit: (data: Partial<Post>) => void;
  onClose: () => void;
  initialData?: Post;
}

const CATEGORIES: Category[] = ['Electronics', 'Clothing', 'Documents', 'Keys', 'Wallets', 'Pets', 'Other'];

export const PostForm: React.FC<PostFormProps> = ({ onSubmit, onClose, initialData }) => {
  const { t } = useApp();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
      type: 'lost' as ItemType,
      category: 'Electronics' as Category,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
  });

  const watchType = watch('type');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      imageUrl: imagePreview || undefined
    });
  };

  const inputClass = "w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {initialData ? t.form.editPost : (watchType === 'lost' ? t.form.reportLost : t.form.reportFound)}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.form.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 sm:p-6 overflow-y-auto no-scrollbar flex-1">
          <div className="space-y-4 sm:space-y-6">
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <label className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg cursor-pointer transition-all text-sm sm:text-base ${watchType === 'lost' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                <input type="radio" value="lost" {...register('type')} className="hidden" />
                {t.form.iLost}
              </label>
              <label className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg cursor-pointer transition-all text-sm sm:text-base ${watchType === 'found' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                <input type="radio" value="found" {...register('type')} className="hidden" />
                {t.form.iFound}
              </label>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.itemTitle}</label>
                <input {...register('title', { required: t.form.errors.titleRequired })} placeholder={t.form.itemTitlePlaceholder} className={inputClass} />
                {errors.title && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.title.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.category}</label>
                <select {...register('category')} className={`${inputClass} appearance-none`}>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{t.grid.categories[cat as keyof typeof t.grid.categories]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.location}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('location', { required: t.form.errors.locationRequired })} placeholder={t.form.locationPlaceholder} className={`${inputClass} pl-12`} />
                {errors.location && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.location.message as string}</p>}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.date}</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="date" {...register('date', { required: t.form.errors.dateRequired })} className={`${inputClass} pl-12`} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.time}</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="time" {...register('time')} className={`${inputClass} pl-12`} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.description}</label>
              <textarea {...register('description', { required: t.form.errors.descriptionRequired })} rows={4} placeholder={t.form.descriptionPlaceholder} className={`${inputClass} resize-none`} />
              {errors.description && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.description.message as string}</p>}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.contactInfo}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('contactInfo', { required: t.form.errors.contactRequired })} placeholder={t.form.contactPlaceholder} className={`${inputClass} pl-12`} />
                {errors.contactInfo && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.contactInfo.message as string}</p>}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">{t.form.contactNote}</p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-200">{t.form.uploadPhotos}</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              {imagePreview ? (
                <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Camera size={20} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setImagePreview(null)} 
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 group-hover:text-blue-500 shadow-sm transition-colors">
                    <Camera size={20} className="sm:hidden" />
                    <Camera size={24} className="hidden sm:block" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.form.uploadHint}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.form.uploadFormat}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 pb-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer order-2 sm:order-1">
              {t.form.cancel}
            </button>
            <button type="submit" className="flex-1 px-6 py-3 sm:py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer order-1 sm:order-2">
              {initialData ? t.form.saveChanges : t.form.submitPost}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
