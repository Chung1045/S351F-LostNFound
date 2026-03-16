import { Post, Comment, User, Report } from '../types';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Optional: Dispatch a custom event to notify the app to update state
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const api = {
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(response).then(data => {
        localStorage.setItem('token', data.token);
        return data.user;
      });
    },
    register: async (userData: { username: string; email: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(response).then(data => {
        localStorage.setItem('token', data.token);
        return data.user;
      });
    },
    logout: () => {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    },
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response).then(data => data.user);
    },
    updateProfile: async (userData: { name: string; email: string }) => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(response).then(data => data.user);
    },
    updatePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      return handleResponse(response);
    },
    deleteAccount: async () => {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response).then(data => {
        localStorage.removeItem('token');
        return data;
      });
    },
    getUsers: async () => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    }
  },
  posts: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/posts`);
      return handleResponse(response);
    },
    create: async (postData: Partial<Post>) => {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      return handleResponse(response);
    },
    updateStatus: async (id: string, status: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${id}/status`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      console.log('Response from updateStatus:', response);
      return handleResponse(response);
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
  comments: {
    getByPostId: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
      return handleResponse(response);
    },
    add: async (postId: string, content: string) => {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      return handleResponse(response);
    },
  },
  reports: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
    create: async (reportData: Partial<Report>) => {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      return handleResponse(response);
    },
    resolve: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/reports/${id}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    },
  },
};
