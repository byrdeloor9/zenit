/**
 * Axios API client with JWT authentication interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Token management functions
export const tokenManager = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds - increased for auth operations and slow connections
})

// Flag to prevent multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Request interceptor - Add JWT token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log requests in development
    if (import.meta.env.DEV) {

    }

    return config
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log responses in development
    if (import.meta.env.DEV) {

    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle errors globally
    if (error.response) {
      const status = error.response.status

      // Handle 401 Unauthorized - Try to refresh token
      if (status === 401 && !originalRequest._retry) {
        // Don't try to refresh on initial login/register requests
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login/') ||
          originalRequest.url?.includes('/auth/register/')

        if (isAuthEndpoint) {
          // Let the login/register error propagate without redirect
          return Promise.reject(error)
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => {
              return apiClient(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = tokenManager.getRefreshToken()

        if (!refreshToken) {
          // No refresh token available, logout
          tokenManager.clearTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        try {
          // Try to refresh the access token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          })

          const { access, refresh } = response.data
          tokenManager.setTokens(access, refresh)

          // Update the failed request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`
          }

          processQueue(null)
          isRefreshing = false

          // Retry the original request
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout
          processQueue(refreshError as AxiosError)
          isRefreshing = false
          tokenManager.clearTokens()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else if (status === 403) {
        console.error('[API] Forbidden - Insufficient permissions')
      } else if (status === 404) {
        console.error('[API] Resource not found')
      } else if (status >= 500) {
        console.error('[API] Server error')
      }

      // Log error in development
      if (import.meta.env.DEV) {
        console.error(
          `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          status,
          error.response.data
        )
      }
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('[API] Request timeout - The server took too long to respond')
      } else {
        console.error('[API] No response received - Network error')
      }
    } else {
      console.error('[API] Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient


