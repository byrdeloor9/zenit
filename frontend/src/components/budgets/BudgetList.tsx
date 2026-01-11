/**
 * BudgetList component - Display and manage budgets (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon } from '@mui/icons-material'
import { useBudgets, useCategories } from '../../hooks'
import { QuickActionFAB } from '../ui/QuickActionFAB'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import type { BudgetFormData, BudgetWithProgress } from '../../api/endpoints/budgets'

export function BudgetList(): JSX.Element {
  const {
    budgets,
    loading,
    error,
    fetchBudgets,
    addBudget,
    editBudget,
    removeBudget,
  } = useBudgets()

  const {
    categories,
    fetchCategories,
  } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithProgress | null>(null)
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [fetchBudgets, fetchCategories])

  const handleOpenForm = (budget?: BudgetWithProgress): void => {
    setSelectedBudget(budget || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedBudget(null)
  }

  const handleSubmit = async (data: BudgetFormData): Promise<void> => {
    if (selectedBudget) {
      await editBudget(selectedBudget.id, data)
    } else {
      await addBudget(data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setBudgetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (budgetToDelete) {
      const success = await removeBudget(budgetToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setBudgetToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setBudgetToDelete(null)
  }

  // Calculate stats
  const activeBudgets = budgets.filter(b => b.status === 'Active')
  const totalBudgeted = activeBudgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
  const totalSpent = activeBudgets.reduce((sum, b) => sum + (b.spent || 0), 0)
  const totalRemaining = totalBudgeted - totalSpent
  const activeBudgetsCount = activeBudgets.length

  if (loading && budgets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar - Pill Style */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Activos</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{activeBudgetsCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Presupuestado</span>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">${totalBudgeted.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 rounded-full">
          <span className="text-xs font-medium text-red-600 dark:text-red-400">Gastado</span>
          <span className="text-sm font-bold text-red-700 dark:text-red-300">${totalSpent.toLocaleString()}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${totalRemaining >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
          <span className={`text-xs font-medium ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>Disponible</span>
          <span className={`text-sm font-bold ${totalRemaining >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            ${totalRemaining.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Budgets: Table on desktop, Cards on mobile */}
      {budgets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No tienes presupuestos registrados
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            Crea tu primer presupuesto para comenzar a controlar tus gastos
          </p>
          <Button onClick={() => handleOpenForm()} className="mx-auto">
            <AddIcon className="mr-2" />
            Crear Presupuesto
          </Button>
        </Card>
      ) : (
        <>
          {/* Grid on desktop, Vertical Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {budgets.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={handleOpenForm}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </>
      )}

      {/* FAB Button */}
      <QuickActionFAB onClick={handleOpenForm} label="Nuevo" />

      {/* Budget Form Dialog */}
      <BudgetForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        budget={selectedBudget}
        categories={categories}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete}>
        <Card title="Eliminar Presupuesto">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            ¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </div>
        </Card>
      </Modal>

    </div>
  )
}