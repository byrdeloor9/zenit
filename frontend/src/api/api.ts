import axios, { AxiosInstance } from 'axios'
import { DashboardStats } from '../types'

const API_BASE_URL = 'http://localhost:8000/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/')
  return response.data
}

export const checkHealth = async (): Promise<{ status: string; message: string }> => {
  const response = await apiClient.get<{ status: string; message: string }>('/health/')
  return response.data
}

export default apiClient

