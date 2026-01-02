/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
} from '../api/endpoints/auth'
import { tokenManager } from '../api/client'
import { getErrorMessage } from '../utils/errorMessages'
import type {
  User,
  AuthContextType,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
} from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const accessToken = tokenManager.getAccessToken()


      if (accessToken) {
        try {
          // Try to get current user
          const userData = await getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          // Token is invalid or expired
          console.error('Failed to get current user:', error)
          tokenManager.clearTokens()
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        // No token found

        setUser(null)
        setIsAuthenticated(false)
      }


      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await apiLogin(credentials)

      // Save tokens
      tokenManager.setTokens(response.access, response.refresh)

      // Set user
      setUser(response.user)
      setIsAuthenticated(true)

      // Redirect to dashboard
      navigate('/')
    } catch (error) {
      // Convert error to user-friendly message
      const errorMessage = getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }, [navigate])

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      const response = await apiRegister(data)

      // Save tokens
      tokenManager.setTokens(response.tokens.access, response.tokens.refresh)

      // Set user
      setUser(response.user)
      setIsAuthenticated(true)

      // Redirect to dashboard
      navigate('/')
    } catch (error) {
      // Convert error to user-friendly message
      const errorMessage = getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }, [navigate])

  const logout = useCallback((): void => {
    // Clear tokens
    tokenManager.clearTokens()

    // Clear user state
    setUser(null)
    setIsAuthenticated(false)

    // Redirect to login
    navigate('/login')
  }, [navigate])

  const updateUser = useCallback(async (data: UpdateProfileData): Promise<void> => {
    try {
      const response = await apiUpdateProfile(data)
      setUser(response.user)
    } catch (error) {
      // Convert error to user-friendly message
      const errorMessage = getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }, [])

  const changePassword = useCallback(async (data: ChangePasswordData): Promise<void> => {
    try {
      await apiChangePassword(data)
    } catch (error) {
      // Convert error to user-friendly message
      const errorMessage = getErrorMessage(error)
      throw new Error(errorMessage)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

