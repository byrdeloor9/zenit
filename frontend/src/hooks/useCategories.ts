/**
 * Hook for categories management
 */

import { useState, useCallback } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFormData,
} from '../api/endpoints'
import type { Category } from '../types'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  addCategory: (data: CategoryFormData) => Promise<Category | null>
  editCategory: (id: number, data: Partial<CategoryFormData>) => Promise<Category | null>
  removeCategory: (id: number) => Promise<boolean>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addCategory = useCallback(async (data: CategoryFormData): Promise<Category | null> => {
    try {
      setLoading(true)
      setError(null)
      const newCategory = await createCategory(data)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
      console.error('Error creating category:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const editCategory = useCallback(async (
    id: number,
    data: Partial<CategoryFormData>
  ): Promise<Category | null> => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateCategory(id, data)
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
      console.error('Error updating category:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const removeCategory = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
      console.error('Error deleting category:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  }
}

