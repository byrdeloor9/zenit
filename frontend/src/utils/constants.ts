/**
 * Application constants
 */

export const TRANSACTION_TYPES = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
} as const

export const ACCOUNT_TYPES = {
  BANK: 'bank',
  CASH: 'cash',
  CARD: 'card',
  INVESTMENT: 'investment',
} as const

export const GOAL_STATUS = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const

export const COLORS = {
  // Main palette
  primary: {
    main: '#667eea',
    light: '#818cf8',
    dark: '#5568d3',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Status colors
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  
  danger: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  
  info: {
    main: '#06B6D4',
    light: '#22D3EE',
    dark: '#0891B2',
    bg: 'rgba(6, 182, 212, 0.1)',
  },
  
  purple: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    bg: 'rgba(139, 92, 246, 0.1)',
  },
  
  // Financial categories
  income: {
    main: '#10B981',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  
  expense: {
    main: '#EF4444',
    gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
  },
  
  // Analysis & Charts
  charts: {
    blue: '#3B82F6',
    green: '#10B981',
    red: '#EF4444',
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    pink: '#EC4899',
    indigo: '#667eea',
  },
} as const

export const TAILWIND_COLORS = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-500',
} as const

export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
} as const

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const

