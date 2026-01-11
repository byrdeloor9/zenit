/**
 * CategoryList component - Display and manage categories
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon } from '@mui/icons-material'
import { useCategories } from '../../hooks'
import { CategoryCard } from './CategoryCard'
import { CategoryForm } from './CategoryForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import type { Category } from '../../types'
import type { CategoryFormData } from '../../api/endpoints/categories'

export function CategoryList(): JSX.Element {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleOpenForm = (category?: Category): void => {
    setSelectedCategory(category || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedCategory(null)
  }

  const handleSubmit = async (data: CategoryFormData): Promise<void> => {
    if (selectedCategory) {
      await editCategory(selectedCategory.id, data)
    } else {
      await addCategory(data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (categoryToDelete) {
      const success = await removeCategory(categoryToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  // Filter categories
  const filteredCategories = categories.filter(category => {
    if (typeFilter !== 'all' && category.type !== typeFilter) return false
    return true
  })

  // Count by type
  const incomeCount = categories.filter(c => c.type === 'Income').length
  const expenseCount = categories.filter(c => c.type === 'Expense').length

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Floating Pills Stats & Filters */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 bg-transparent">
        {/* Stats Pills */}
        <div className="flex flex-wrap gap-3 flex-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-full shadow-sm border flex items-center gap-2 transition-all ${typeFilter === 'all'
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 ring-2 ring-gray-200 dark:ring-gray-600'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
          >
            <span className="text-xl">📂</span>
            <span className={`font-semibold ${typeFilter === 'all' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
              {categories.length}
            </span>
            <span className="text-xs text-gray-500 uppercase font-medium ml-1">Total</span>
          </button>

          <button
            onClick={() => setTypeFilter(typeFilter === 'Income' ? 'all' : 'Income')}
            className={`px-4 py-2 rounded-full shadow-sm border flex items-center gap-2 transition-all ${typeFilter === 'Income'
              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-emerald-300'
              }`}
          >
            <span className="text-xl">💰</span>
            <span className="font-semibold">{incomeCount}</span>
            <span className="text-xs uppercase font-medium ml-1 opacity-70">Ingresos</span>
          </button>

          <button
            onClick={() => setTypeFilter(typeFilter === 'Expense' ? 'all' : 'Expense')}
            className={`px-4 py-2 rounded-full shadow-sm border flex items-center gap-2 transition-all ${typeFilter === 'Expense'
              ? 'bg-rose-100 border-rose-300 text-rose-800'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-rose-300'
              }`}
          >
            <span className="text-xl">💸</span>
            <span className="font-semibold">{expenseCount}</span>
            <span className="text-xs uppercase font-medium ml-1 opacity-70">Gastos</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Categories Grid - Wide Layout (Cyber Plate) */}
      {filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {categories.length === 0
              ? 'No tienes categorías aún'
              : 'No se encontraron categorías'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            {categories.length === 0
              ? 'Haz clic en el botón flotante para crear tu primera categoría'
              : 'Intenta cambiar el filtro para ver más resultados'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleOpenForm}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* FAB Button */}
      <QuickActionFAB onClick={handleOpenForm} label="Nuevo" />

      {/* Category Form Dialog */}
      <CategoryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        category={selectedCategory}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <Card title="Eliminar Categoría">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar esta categoría? Las transacciones asociadas quedarán sin categoría.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </div>
  )
}
