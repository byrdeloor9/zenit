/**
 * Categories Page - Redesigned with Tailwind CSS
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, Category as CategoryIcon, TrendingUp, TrendingDown } from '@mui/icons-material'
import { useCategories } from '../hooks'
import { CategoryForm } from '../components/categories/CategoryForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import type { Category } from '../types'
import type { CategoryFormData } from '../api/endpoints/categories'

export function CategoriesPage(): JSX.Element {
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
  const totalCount = categories.length

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">Organiza tus transacciones por categorías</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <AddIcon className="mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total Categorías
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalCount}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Ingresos
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {incomeCount}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Gastos
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {expenseCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Tipo de Categoría"
            id="type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            <option value="Income">Solo Ingresos</option>
            <option value="Expense">Solo Gastos</option>
          </Select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {categories.length === 0 
              ? 'No tienes categorías aún'
              : 'No se encontraron categorías'}
          </h3>
          <p className="text-gray-600 mb-6">
            {categories.length === 0
              ? 'Crea tu primera categoría para organizar tus transacciones'
              : 'Intenta cambiar los filtros para ver más resultados'}
          </p>
          {categories.length === 0 && (
            <Button
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
            >
              <AddIcon className="mr-2" />
              Crear Primera Categoría
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      category.type === 'Income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {category.type === 'Income' ? (
                        <TrendingUp className="text-lg" />
                      ) : (
                        <TrendingDown className="text-lg" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.icon && `${category.icon} `}{category.name}
                      </h3>
                    </div>
                  </div>
                  <Badge 
                    variant={category.type === 'Income' ? 'success' : 'error'}
                    size="sm"
                  >
                    {category.type}
                  </Badge>
                </div>

                {/* Description */}
                {category.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenForm(category)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(category.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        category={selectedCategory}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eliminar Categoría
          </h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer y afectará todas las transacciones asociadas.
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
      </Modal>
    </div>
  )
}