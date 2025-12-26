import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sessions
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API Request Function
async function request<T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient(config);
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw {
      success: false,
      message: error.message || 'Network error',
      data: null,
    };
  }
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  register: (data: {
    full_name: string;
    email: string;
    username: string;
    password: string;
  }) => request({ method: 'POST', url: '/auth/register', data }),

  login: (data: { username: string; password: string }) =>
    request({ method: 'POST', url: '/auth/login', data }),

  logout: () => request({ method: 'POST', url: '/auth/logout' }),

  getCurrentUser: () => request({ method: 'GET', url: '/auth/me' }),

  getUserById: (id: string | number) =>
    request({ method: 'GET', url: `/auth/users/${id}` }),

  updateProfile: (data: {
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }) => request({ method: 'PUT', url: '/auth/profile', data }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    request({ method: 'POST', url: '/auth/change-password', data }),
};

// ============================================================================
// PROBLEMS API
// ============================================================================

export const problemsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    search?: string;
  }) => request<PaginatedResponse>({ method: 'GET', url: '/problems', params }),

  getById: (id: string | number) =>
    request({ method: 'GET', url: `/problems/${id}` }),

  create: (data: {
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    time_limit?: number;
    memory_limit?: number;
    is_global?: boolean;
  }) => request({ method: 'POST', url: '/problems', data }),

  update: (id: string | number, data: any) =>
    request({ method: 'PUT', url: `/problems/${id}`, data }),

  delete: (id: string | number) =>
    request({ method: 'DELETE', url: `/problems/${id}` }),

  getSubmissions: (id: string | number, params?: { page?: number; limit?: number }) =>
    request<PaginatedResponse>({ method: 'GET', url: `/problems/${id}/submissions`, params }),
};

// ============================================================================
// CONTESTS API
// ============================================================================

export const contestsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: 'upcoming' | 'ongoing' | 'finished';
  }) => request<PaginatedResponse>({ method: 'GET', url: '/contests', params }),

  getById: (id: string | number) =>
    request({ method: 'GET', url: `/contests/${id}` }),

  create: (data: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    is_public?: boolean;
  }) => request({ method: 'POST', url: '/contests', data }),

  update: (id: string | number, data: any) =>
    request({ method: 'PUT', url: `/contests/${id}`, data }),

  join: (id: string | number) =>
    request({ method: 'POST', url: `/contests/${id}/join` }),

  getLeaderboard: (id: string | number, params?: { page?: number; limit?: number }) =>
    request<PaginatedResponse>({ method: 'GET', url: `/contests/${id}/leaderboard`, params }),

  getProblems: (id: string | number) =>
    request({ method: 'GET', url: `/contests/${id}/problems` }),
};

// ============================================================================
// DISCUSSIONS API
// ============================================================================

export const discussionsApi = {
  getAll: (params?: { page?: number; limit?: number; problem_id?: number }) =>
    request<PaginatedResponse>({ method: 'GET', url: '/discussions', params }),

  getById: (id: string | number) =>
    request({ method: 'GET', url: `/discussions/${id}` }),

  create: (data: {
    content: string;
    problem_id?: number;
    parent_id?: number;
  }) => request({ method: 'POST', url: '/discussions', data }),

  update: (id: string | number, data: { content: string }) =>
    request({ method: 'PUT', url: `/discussions/${id}`, data }),

  delete: (id: string | number) =>
    request({ method: 'DELETE', url: `/discussions/${id}` }),

  getProblemDiscussions: (problemId: string | number, params?: { page?: number; limit?: number }) =>
    request<PaginatedResponse>({ method: 'GET', url: `/discussions/problems/${problemId}`, params }),
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsApi = {
  getAll: (params?: { page?: number; limit?: number; unread_only?: boolean }) =>
    request<PaginatedResponse>({ method: 'GET', url: '/notifications', params }),

  getUnreadCount: () =>
    request({ method: 'GET', url: '/notifications/unread-count' }),

  markAsRead: (id: string | number) =>
    request({ method: 'PUT', url: `/notifications/${id}/read` }),

  markMultipleAsRead: (notification_ids: number[]) =>
    request({ method: 'PUT', url: '/notifications/read-multiple', data: { notification_ids } }),

  markAllAsRead: () =>
    request({ method: 'PUT', url: '/notifications/read-all' }),

  delete: (id: string | number) =>
    request({ method: 'DELETE', url: `/notifications/${id}` }),
};

export default apiClient;
