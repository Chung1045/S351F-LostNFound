export type ItemType = 'lost' | 'found';

export type Category = 'Electronics' | 'Clothing' | 'Documents' | 'Keys' | 'Wallets' | 'Pets' | 'Other';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  type: ItemType;
  title: string;
  category: Category;
  description: string;
  location: string;
  date: string;
  time: string;
  contactInfo: string;
  imageUrl: string;
  imageUrls?: string[];
  status: 'active' | 'collected' | 'found';
  userId: string;
  userName: string;
  createdAt: string;
  isReported?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Report {
  id: string;
  targetType: 'post' | 'comment';
  targetId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved';
  commentContent?: string;
  reporterName?: string;
  postId?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  link_id?: string;
}
