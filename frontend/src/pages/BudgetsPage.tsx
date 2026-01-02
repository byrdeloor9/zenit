/**
 * Budgets Page - Redesigned with Tailwind CSS
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, AccountBalanceWallet, Warning, CheckCircle } from '@mui/icons-material'
import { useBudgets, useCategories } from '../hooks'
import { BudgetForm } from '../components/budgets/BudgetForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { formatCurrency } from '../utils/formatters'
import type { BudgetFormData, BudgetWithProgress } from '../api/endpoints/budgets'

export function BudgetsPage(): JSX.Element {
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

  // Calculate totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const overBudgetCount = budgets.filter(b => b.percentage >= 100).length
  const warningCount = budgets.filter(b => b.percentage >= 80 && b.percentage < 100).length

  if (loading && budgets.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-600 mt-1">Controla tus gastos por categoría</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <AddIcon className="mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total Presupuestado
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBudgeted.toString())}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total Gastado
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              {formatCurrency(totalSpent.toString())}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Restante
            </div>
            <div className={`text-2xl font-bold ${
              totalRemaining >= 0 
                ? 'bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent'
            }`}>
              {formatCurrency(totalRemaining.toString())}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Presupuestos
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {budgets.length}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overBudgetCount > 0 && (
        <Alert 
          type="error" 
          message={`${overBudgetCount} presupuesto(s) excedido(s). Revisa tus gastos.`} 
        />
      )}
      
      {warningCount > 0 && (
        <Alert 
          type="warning" 
          message={`${warningCount} presupuesto(s) cerca del límite (80%+).`} 
        />
      )}

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes presupuestos aún
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer presupuesto para comenzar a controlar tus gastos por categoría
          </p>
          <Button
            onClick={() => handleOpenForm()}
            className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
          >
            <AddIcon className="mr-2" />
            Crear Primer Presupuesto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <AccountBalanceWallet className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {budget.is_recurring ? 'Recurrente' : 'Único'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      budget.percentage >= 100 ? 'error' : 
                      budget.percentage >= 80 ? 'warning' : 
                      'success'
                    }
                    size="sm"
                  >
                    {budget.percentage.toFixed(0)}%
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <ProgressBar
                    value={budget.percentage}
                    max={100}
                    color={
                      budget.percentage >= 100 ? 'red' : 
                      budget.percentage >= 80 ? 'orange' : 
                      'green'
                    }
                    showPercentage={false}
                  />
                </div>

                {/* Amounts */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Gastado</span>
                    <span>{formatCurrency(budget.spent.toString())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Presupuesto</span>
                    <span>{formatCurrency(budget.amount)}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  {budget.percentage >= 100 ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <Warning className="text-sm" />
                      <span className="text-sm font-medium">Presupuesto excedido</span>
                    </div>
                  ) : budget.percentage >= 80 ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Warning className="text-sm" />
                      <span className="text-sm font-medium">Cerca del límite</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="text-sm" />
                      <span className="text-sm font-medium">Bajo control</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenForm(budget)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(budget.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      <BudgetForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        budget={selectedBudget}
        loading={loading}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eliminar Presupuesto
          </h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.
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