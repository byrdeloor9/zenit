/**
 * BudgetList component - Display and manage budgets (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, MoreVert, Edit as EditIcon, Delete as DeleteIcon, History as HistoryIcon, Loop as LoopIcon } from '@mui/icons-material'
import { useBudgets, useCategories } from '../../hooks'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { Table, TableRow, TableCell } from '../ui/Table'
import { ProgressBar } from '../ui/ProgressBar'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { formatCurrency } from '../../utils/formatters'
import { BudgetHistoryDialog } from './BudgetHistoryDialog'
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
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedBudgetForHistory, setSelectedBudgetForHistory] = useState<BudgetWithProgress | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ anchorEl: HTMLElement | null; budget: BudgetWithProgress | null }>({ anchorEl: null, budget: null })

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, budget: BudgetWithProgress): void => {
    event.stopPropagation()
    setMenuAnchor({ anchorEl: event.currentTarget, budget })
  }

  const handleMenuClose = (): void => {
    setMenuAnchor({ anchorEl: null, budget: null })
  }

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent): void => {
    e.stopPropagation()
    action()
    handleMenuClose()
  }

  const handleOpenHistory = (budget: BudgetWithProgress): void => {
    setSelectedBudgetForHistory(budget)
    setHistoryOpen(true)
  }

  const handleCloseHistory = (): void => {
    setHistoryOpen(false)
    setSelectedBudgetForHistory(null)
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
      {/* Stats Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Presupuestos Activos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeBudgetsCount}</p>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Total Presupuestado</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${totalBudgeted.toLocaleString()}</p>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Total Gastado</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Disponible</p>
            <p className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${totalRemaining.toLocaleString()}
            </p>
          </div>
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
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table headers={['Categoría', 'Monto', 'Gastado', 'Disponible', 'Progreso', 'Periodo', '']}>
                {budgets.map(budget => (
                  <TableRow key={budget.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{budget.category_icon || '📊'}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {budget.category_name}
                          </div>
                          {(budget.is_recurring || budget.is_indefinite) && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {budget.is_recurring && (
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  <LoopIcon fontSize="inherit" />
                                </span>
                              )}
                              {budget.is_indefinite && (
                                <span className="text-xs text-purple-600 dark:text-purple-400">∞</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(budget.amount)}
                    </TableCell>
                    <TableCell className={`font-semibold ${
                      budget.spent && budget.spent > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatCurrency(budget.spent || 0)}
                    </TableCell>
                    <TableCell className={`font-semibold ${
                      (budget.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(budget.remaining || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <ProgressBar 
                          value={budget.spent || 0} 
                          max={parseFloat(budget.amount)} 
                          showPercentage={false}
                        />
                        <span className="text-xs text-gray-500 mt-0.5 inline-block">
                          {budget.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(budget.period_start).toLocaleDateString('es-ES', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {budget.period_end && (
                          <>
                            {' - '}
                            {new Date(budget.period_end).toLocaleDateString('es-ES', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </>
                        )}
                        {budget.days_left !== null && budget.days_left >= 0 && (
                          <div className="mt-0.5 text-gray-600 dark:text-gray-300 font-semibold">
                            {budget.days_left} días
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => handleMenuClick(e, budget)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVert className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </Card>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
      >
        <AddIcon />
      </button>

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

      {/* Context Menu */}
      {menuAnchor.anchorEl && menuAnchor.budget && (
        <ContextMenu anchorEl={menuAnchor.anchorEl} onClose={handleMenuClose}>
          <ContextMenuItem onClick={handleMenuAction(() => handleOpenForm(menuAnchor.budget!))}>
            <EditIcon className="text-sm" />
            Editar
          </ContextMenuItem>
          {menuAnchor.budget.history_count > 0 && (
            <ContextMenuItem onClick={handleMenuAction(() => handleOpenHistory(menuAnchor.budget!))}>
              <HistoryIcon className="text-sm" />
              Historial ({menuAnchor.budget.history_count})
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleMenuAction(() => handleDeleteClick(menuAnchor.budget!.id))} destructive>
            <DeleteIcon className="text-sm" />
            Eliminar
          </ContextMenuItem>
        </ContextMenu>
      )}

      {/* History Dialog */}
      {selectedBudgetForHistory && (
        <BudgetHistoryDialog
          open={historyOpen}
          onClose={handleCloseHistory}
          budgetId={selectedBudgetForHistory.id}
          budgetName={selectedBudgetForHistory.category_name}
        />
      )}
    </div>
  )
}