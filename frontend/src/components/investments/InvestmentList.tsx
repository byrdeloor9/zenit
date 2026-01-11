/**
 * InvestmentList component - Display and manage investments (goals and policies) (migrated to Tailwind CSS)
 */

import { useEffect, useState } from 'react'
import {
  EmojiEvents as GoalIcon,
  Shield as PolicyIcon,
  TrendingUp,
  CheckCircle,
  Cancel as CancelIcon,
  Add as AddIcon,
  MoreVert,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useInvestments, useAccounts } from '../../hooks'
import { QuickActionFAB } from '../ui/QuickActionFAB'
import { InvestmentCard } from './InvestmentCard'
import { InvestmentForm } from './InvestmentForm'
import { ContributionDialog } from './ContributionDialog'
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
import type { Investment } from '../../types'
import type { InvestmentFormData } from '../../api/endpoints/investments'

export function InvestmentList(): JSX.Element {
  const {
    investments,
    loading,
    error,
    fetchInvestments,
    addInvestment,
    editInvestment,
    removeInvestment,
    complete,
    cancel,
  } = useInvestments()

  const {
    accounts,
    fetchAccounts,
  } = useAccounts()

  const [formOpen, setFormOpen] = useState(false)
  const [contributionDialogOpen, setContributionDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const [investmentToDelete, setInvestmentToDelete] = useState<number | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ anchorEl: HTMLElement | null; investment: Investment | null }>({ anchorEl: null, investment: null })

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvestments()
    fetchAccounts()
  }, [fetchInvestments, fetchAccounts])

  const handleOpenForm = (investment?: Investment): void => {
    setSelectedInvestment(investment || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedInvestment(null)
  }

  const handleOpenContributionDialog = (investment: Investment): void => {
    setSelectedInvestment(investment)
    setContributionDialogOpen(true)
  }

  const handleCloseContributionDialog = (): void => {
    setContributionDialogOpen(false)
    setSelectedInvestment(null)
  }

  const handleSubmit = async (data: InvestmentFormData): Promise<void> => {
    if (selectedInvestment) {
      await editInvestment(selectedInvestment.id, data)
    } else {
      await addInvestment(data)
    }
  }

  const handleOpenDeleteDialog = (id: number): void => {
    setInvestmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = (): void => {
    setDeleteDialogOpen(false)
    setInvestmentToDelete(null)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (investmentToDelete) {
      await removeInvestment(investmentToDelete)
      handleCloseDeleteDialog()
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, investment: Investment): void => {
    event.stopPropagation()
    setMenuAnchor({ anchorEl: event.currentTarget, investment })
  }

  const handleMenuClose = (): void => {
    setMenuAnchor({ anchorEl: null, investment: null })
  }

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent): void => {
    e.stopPropagation()
    action()
    handleMenuClose()
  }

  // Filter investments
  const filteredInvestments = investments.filter(inv => {
    const matchesType = typeFilter === 'all' || inv.investment_type === typeFilter
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesType && matchesStatus
  })

  // Calculate stats
  const activeMetas = investments.filter(inv => inv.investment_type === 'goal' && inv.status === 'active').length
  const activePolicies = investments.filter(inv => inv.investment_type === 'insurance' && inv.status === 'active').length
  const totalInvested = investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + parseFloat(inv.current_amount), 0)

  if (loading && investments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Metas Activas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeMetas}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Pólizas Activas</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activePolicies}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Total Invertido</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${totalInvested.toLocaleString()}</p>
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
              <option value="goal">Metas</option>
              <option value="insurance">Pólizas</option>
            </Select>
            <Select
              id="statusFilter"
              label=""
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Investments: Table on desktop, Cards on mobile */}
      {filteredInvestments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {typeFilter !== 'all' || statusFilter !== 'all' ? 'No se encontraron inversiones' : 'No tienes inversiones registradas'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea tu primera meta o póliza para comenzar a invertir'
            }
          </p>
          {typeFilter === 'all' && statusFilter === 'all' && (
            <Button onClick={() => handleOpenForm()} className="mx-auto">
              <AddIcon className="mr-2" />
              Agregar Inversión
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table headers={['Inversión', 'Tipo', 'Monto Inicial', 'Monto Actual', 'Objetivo/Vencimiento', 'Progreso', 'Cuenta', 'Acciones']}>
                {filteredInvestments.map(investment => {
                  const getTypeIcon = () => investment.investment_type === 'goal' ? '🎯' : '🛡️'
                  const getTypeLabel = () => investment.investment_type === 'goal' ? 'Meta' : 'Póliza'
                  const daysLeft = investment.deadline
                    ? Math.ceil((new Date(investment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null
                  const daysToMaturity = investment.maturity_date
                    ? Math.ceil((new Date(investment.maturity_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null

                  return (
                    <TableRow key={investment.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {investment.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getTypeIcon()} {getTypeLabel()}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(investment.initial_amount || '0')}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(investment.current_amount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {investment.target_amount ? (
                            <div className="font-semibold">
                              {formatCurrency(investment.target_amount)}
                            </div>
                          ) : investment.maturity_date ? (
                            <div className="text-gray-500 dark:text-gray-400">
                              {new Date(investment.maturity_date).toLocaleDateString('es-ES')}
                              {daysToMaturity !== null && daysToMaturity > 0 && (
                                <div className="mt-0.5 text-blue-600 font-semibold">
                                  {daysToMaturity} días
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <ProgressBar
                            value={parseFloat(investment.current_amount)}
                            max={parseFloat(investment.target_amount || '0')}
                            showPercentage={false}
                          />
                          <span className="text-xs text-gray-500 mt-0.5 inline-block">
                            {investment.progress_percentage.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {investment.account_name || 'Sin cuenta'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => handleMenuClick(e, investment)}
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
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInvestments.map(investment => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onEdit={handleOpenForm}
                onAddContribution={handleOpenContributionDialog}
                onDelete={handleOpenDeleteDialog}
                onComplete={() => complete(investment.id)}
                onCancel={() => cancel(investment.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* FAB Button */}
      <QuickActionFAB onClick={handleOpenForm} label="Nuevo" />

      {/* Investment Form Dialog */}
      <InvestmentForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        investment={selectedInvestment}
        accounts={accounts}
        loading={loading}
      />

      {/* Contribution Dialog */}
      <ContributionDialog
        open={contributionDialogOpen}
        onClose={handleCloseContributionDialog}
        investment={selectedInvestment}
        accounts={accounts}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <Card title="Eliminar Inversión">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            ¿Estás seguro de que quieres eliminar esta inversión? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={handleCloseDeleteDialog}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </div>
        </Card>
      </Modal>

      {/* Context Menu */}
      {menuAnchor.anchorEl && menuAnchor.investment && (
        <ContextMenu anchorEl={menuAnchor.anchorEl} onClose={handleMenuClose}>
          {menuAnchor.investment.status === 'active' && (
            <ContextMenuItem onClick={handleMenuAction(() => handleOpenContributionDialog(menuAnchor.investment!))}>
              <AddIcon className="text-sm" />
              Agregar Contribución
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleMenuAction(() => handleOpenForm(menuAnchor.investment!))}>
            <EditIcon className="text-sm" />
            Editar
          </ContextMenuItem>
          {menuAnchor.investment.status === 'active' && (
            <ContextMenuItem onClick={handleMenuAction(() => complete(menuAnchor.investment!.id))}>
              <CheckCircle className="text-sm" />
              Marcar Completado
            </ContextMenuItem>
          )}
          {menuAnchor.investment.status === 'active' && (
            <ContextMenuItem onClick={handleMenuAction(() => cancel(menuAnchor.investment!.id))}>
              <CancelIcon className="text-sm" />
              Cancelar
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleMenuAction(() => handleOpenDeleteDialog(menuAnchor.investment!.id))} destructive>
            <DeleteIcon className="text-sm" />
            Eliminar
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  )
}