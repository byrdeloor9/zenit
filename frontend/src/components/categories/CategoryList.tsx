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
import { Select } from '../ui/Select'
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
      {/* Stats Bar + Filters Combined */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Stats - 70% en desktop */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Categorías</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{categories.length}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Ingresos</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{incomeCount}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Gastos</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{expenseCount}</p>
              </div>
            </div>
          </div>
          
          {/* Filters - 30% en desktop, stack en móvil */}
          <div className="lg:w-64 space-y-3">
            <Select
              id="typeFilter"
              label=""
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="Income">Ingresos</option>
              <option value="Expense">Gastos</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Categories Grid */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
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
      <button
          onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        title="Nueva Categoría"
        >
          <AddIcon />
      </button>

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

