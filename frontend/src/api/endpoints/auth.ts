/**
 * Authentication API endpoints
 */

import apiClient from '../client'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
  UpdateProfileData,
  ChangePasswordData,
  AuthTokens,
} from '../../types'

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login/', credentials)
  return response.data
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register/', data)
  return response.data
}

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refresh: string): Promise<{ access: string; refresh: string }> => {
  const response = await apiClient.post<{ access: string; refresh: string }>('/auth/refresh/', {
    refresh,
  })
  return response.data
}

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/user/')
  return response.data
}

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileData): Promise<{ user: User; message: string }> => {
  const response = await apiClient.patch<{ user: User; message: string }>('/auth/user/', data)
  return response.data
}

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/change-password/', data)
  return response.data
}

