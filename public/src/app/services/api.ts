import { Post, Comment, User, Report } from '../types';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.user;
    },
    register: async (userData: { username: string; email: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Registration failed');
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.user;
    },
    logout: () => {
      localStorage.removeItem('token');
    },
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      return data.user;
    },
    updateProfile: async (userData: { name: string; email: string }) => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const data = await response.json();
      return data.user;
    },
    updatePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      if (!response.ok) throw new Error('Failed to update password');
      return response.json();
    },
    deleteAccount: async () => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete account');
      localStorage.removeItem('token');
      return response.json();
    },
    getUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  },
  posts: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    create: async (postData: Partial<Post>) => {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    updateStatus: async (id: string, status: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${id}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update post status');
      return response.json();
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
  },
  comments: {
    getByPostId: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    add: async (postId: string, content: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
  },
  reports: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
    create: async (reportData: Partial<Report>) => {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error('Failed to create report');
      return response.json();
    },
    resolve: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/reports/${id}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to resolve report');
      return response.json();
    },
  },
};
