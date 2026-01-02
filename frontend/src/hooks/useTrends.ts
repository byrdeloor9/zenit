/**
 * Hook for trends data management
 */

import { useState, useEffect, useCallback } from 'react'
import { getTrendCategories, getCategoryTrend } from '../api/endpoints'
import type { CategoryOverview, CategoryTrend } from '../types/models'

interface UseTrendsState {
  categories: CategoryOverview[]
  selectedCategory: number | null
  selectedMonths: number
  trends: CategoryTrend | null
  loadingCategories: boolean
  loadingTrends: boolean
  error: string | null
  selectCategory: (categoryId: number | null) => void
  selectMonths: (months: number) => void
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage trends data
 */
export function useTrends(): UseTrendsState {
  const [categories, setCategories] = useState<CategoryOverview[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedMonths, setSelectedMonths] = useState<number>(6)
  const [trends, setTrends] = useState<CategoryTrend | null>(null)
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true)
  const [loadingTrends, setLoadingTrends] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      try {
        setLoadingCategories(true)
        setError(null)
        const data = await getTrendCategories()
        setCategories(data)
        // Auto-select first category if available
        if (data.length > 0 && selectedCategory === null) {
          setSelectedCategory(data[0].id)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading categories'
        setError(errorMessage)
        console.error('Error fetching categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch trends when category or months change
  useEffect(() => {
    const fetchTrends = async (): Promise<void> => {
      if (selectedCategory === null) {
        setTrends(null)
        return
      }

      try {
        setLoadingTrends(true)
        setError(null)
        const data = await getCategoryTrend(selectedCategory, selectedMonths)
        setTrends(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading trends'
        setError(errorMessage)
        console.error('Error fetching trends:', err)
      } finally {
        setLoadingTrends(false)
      }
    }

    fetchTrends()
  }, [selectedCategory, selectedMonths])

  const selectCategory = useCallback((categoryId: number | null): void => {
    setSelectedCategory(categoryId)
  }, [])

  const selectMonths = useCallback((months: number): void => {
    setSelectedMonths(months)
  }, [])

  const refetch = useCallback(async (): Promise<void> => {
    if (selectedCategory === null) return

    try {
      setLoadingTrends(true)
      setError(null)
      const data = await getCategoryTrend(selectedCategory, selectedMonths)
      setTrends(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading trends'
      setError(errorMessage)
      console.error('Error fetching trends:', err)
    } finally {
      setLoadingTrends(false)
    }
  }, [selectedCategory, selectedMonths])

  return {
    categories,
    selectedCategory,
    selectedMonths,
    trends,
    loadingCategories,
    loadingTrends,
    error,
    selectCategory,
    selectMonths,
    refetch,
  }
}

