/**
 * GoalList component - Display and manage goals
 * Header similar to Transacciones, cards in grid like Mis Cuentas
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, TrendingUp, CheckCircle, MoreVert, Edit as EditIcon, Delete as DeleteIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { useGoals, useAccounts } from '../../hooks'
import { GoalCard } from './GoalCard'
import { GoalForm } from './GoalForm'
import { UpdateProgressDialog } from './UpdateProgressDialog'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { StatCard } from '../ui/StatCard'
import { Table, TableRow, TableCell } from '../ui/Table'
import { ProgressBar } from '../ui/ProgressBar'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { formatCurrency } from '../../utils/formatters'
import type { Goal } from '../../types'
import type { GoalFormData } from '../../api/endpoints/goals'

export function GoalList(): JSX.Element {
  const {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    editGoal,
    updateProgress,
    markComplete,
    markCancelled,
    removeGoal,
  } = useGoals()

  const {
    accounts,
    fetchAccounts,
  } = useAccounts()

  const [formOpen, setFormOpen] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ anchorEl: HTMLElement | null; goal: Goal | null }>({ anchorEl: null, goal: null })

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchGoals()
    fetchAccounts()
  }, [fetchGoals, fetchAccounts])

  const handleOpenForm = (goal?: Goal): void => {
    setSelectedGoal(goal || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedGoal(null)
  }

  const handleOpenProgressDialog = (goal: Goal): void => {
    setSelectedGoal(goal)
    setProgressDialogOpen(true)
  }

  const handleCloseProgressDialog = (): void => {
    setProgressDialogOpen(false)
    setSelectedGoal(null)
  }

  const handleSubmit = async (data: GoalFormData): Promise<void> => {
    if (selectedGoal) {
      await editGoal(selectedGoal.id, data)
    } else {
      await addGoal(data)
    }
  }

  const handleUpdateProgress = async (amount: string): Promise<void> => {
    if (selectedGoal) {
      await updateProgress(selectedGoal.id, amount)
    }
  }

  const handleComplete = async (id: number): Promise<void> => {
    await markComplete(id)
  }

  const handleCancel = async (id: number): Promise<void> => {
    await markCancelled(id)
  }

  const handleDeleteClick = (id: number): void => {
    setGoalToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (goalToDelete) {
      const success = await removeGoal(goalToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setGoalToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setGoalToDelete(null)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, goal: Goal): void => {
    event.stopPropagation()
    setMenuAnchor({ anchorEl: event.currentTarget, goal })
  }

  const handleMenuClose = (): void => {
    setMenuAnchor({ anchorEl: null, goal: null })
  }

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent): void => {
    e.stopPropagation()
    action()
    handleMenuClose()
  }

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    if (statusFilter !== 'all' && goal.status !== statusFilter) return false
    return true
  })

  // Calculate stats
  const inProgressCount = goals.filter(g => g.status === 'In Progress').length
  const completedCount = goals.filter(g => g.status === 'Completed').length
  const totalTarget = goals
    .filter(g => g.status === 'In Progress')
    .reduce((sum, g) => sum + parseFloat(g.target_amount), 0)
  const totalSaved = goals
    .filter(g => g.status === 'In Progress')
    .reduce((sum, g) => sum + parseFloat(g.current_amount), 0)

  if (loading && goals.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        {/* Title and Button Row */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Mis Metas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Define y alcanza tus objetivos financieros
            </p>
          </div>
          <Button
            onClick={() => handleOpenForm()}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <AddIcon className="mr-2" />
            Nueva Meta
          </Button>
        </div>

        {/* Stats Grid + Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Stats - 75% en desktop */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">En Progreso</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{inProgressCount}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Completadas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Total Objetivo</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">${totalTarget.toFixed(2)}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">Total Ahorrado</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalSaved.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Filters - 25% en desktop, stack en móvil */}
          <div className="lg:w-64 space-y-3">
            <Select
              id="statusFilter"
              label=""
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
            <option value="all">Todas</option>
            <option value="In Progress">En Progreso</option>
            <option value="Completed">Completadas</option>
            <option value="Cancelled">Canceladas</option>
          </Select>
          {statusFilter !== 'all' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Limpiar Filtros
            </Button>
          )}
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Goals: Table on desktop, Cards on mobile */}
      {filteredGoals.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-indigo-300 dark:border-indigo-600 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="text-6xl mb-4">🎯</div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {goals.length === 0
                ? 'No tienes metas aún'
                : 'No se encontraron metas'}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {goals.length === 0
                ? 'Define tus objetivos financieros y haz seguimiento de tu progreso'
                : 'Intenta cambiar el filtro para ver más resultados'}
            </p>
          </div>
          {goals.length === 0 && (
            <Button
              onClick={() => handleOpenForm()}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <AddIcon className="mr-2" />
              Crear Primera Meta
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table headers={['Meta', 'Objetivo', 'Ahorrado', 'Disponible', 'Progreso', 'Fecha límite', '']}>
                {filteredGoals.map(goal => {
                  const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
                  return (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {goal.name}
                          </div>
                          {goal.account_name && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                              💳 {goal.account_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(goal.target_amount)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(goal.current_amount)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-600">
                        {formatCurrency(parseFloat(goal.target_amount) - parseFloat(goal.current_amount))}
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <ProgressBar 
                            value={parseFloat(goal.current_amount)} 
                            max={parseFloat(goal.target_amount)} 
                            showPercentage={false}
                          />
                          <span className="text-xs text-gray-500 mt-0.5 inline-block">
                            {goal.progress_percentage.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {goal.deadline ? (
                          <div className="text-xs">
                            <div className="text-gray-500 dark:text-gray-400">
                              {new Date(goal.deadline).toLocaleDateString('es-ES')}
                            </div>
                            {daysLeft !== null && daysLeft >= 0 && (
                              <div className={`mt-0.5 font-semibold ${daysLeft < 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                                {daysLeft} días
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin fecha límite</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => handleMenuClick(e, goal)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVert className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </Table>
            </Card>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleOpenForm}
                onUpdateProgress={handleOpenProgressDialog}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </>
      )}

      {/* Goal Form Dialog */}
      <GoalForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        goal={selectedGoal}
        accounts={accounts}
        loading={loading}
      />

      {/* Update Progress Dialog */}
      <UpdateProgressDialog
        open={progressDialogOpen}
        onClose={handleCloseProgressDialog}
        onSubmit={handleUpdateProgress}
        goal={selectedGoal}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <Card title="Eliminar Meta">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar esta meta? Esta acción no se puede deshacer.
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

      {/* Context Menu */}
      {menuAnchor.anchorEl && menuAnchor.goal && (
        <ContextMenu anchorEl={menuAnchor.anchorEl} onClose={handleMenuClose}>
          <ContextMenuItem onClick={handleMenuAction(() => handleOpenForm(menuAnchor.goal!))}>
            <EditIcon className="text-sm" />
            Editar
          </ContextMenuItem>
          {menuAnchor.goal.status === 'In Progress' && (
            <ContextMenuItem onClick={handleMenuAction(() => handleOpenProgressDialog(menuAnchor.goal!))}>
              <TrendingUp className="text-sm" />
              Actualizar Progreso
            </ContextMenuItem>
          )}
          {menuAnchor.goal.status === 'In Progress' && (
            <ContextMenuItem onClick={handleMenuAction(() => handleComplete(menuAnchor.goal!.id))}>
              <CheckCircle className="text-sm" />
              Marcar Completada
            </ContextMenuItem>
          )}
          {menuAnchor.goal.status === 'In Progress' && (
            <ContextMenuItem onClick={handleMenuAction(() => handleCancel(menuAnchor.goal!.id))}>
              <CancelIcon className="text-sm" />
              Cancelar Meta
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleMenuAction(() => handleDeleteClick(menuAnchor.goal!.id))} destructive>
            <DeleteIcon className="text-sm" />
            Eliminar
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  )
}

