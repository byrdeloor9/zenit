/**
 * DebtList component - Display and manage debts (migrated to Tailwind CSS)
 * Header similar to Transacciones, cards in grid like Mis Cuentas
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, Search as SearchIcon, Clear as ClearIcon, MoreVert, Edit as EditIcon, Delete as DeleteIcon, Payment as PaymentIcon } from '@mui/icons-material'
import { useDebts } from '../../hooks'
import { DebtCard } from './DebtCard'
import { DebtForm } from './DebtForm'
import { PaymentDialog } from './PaymentDialog'
import { DebtDetailsDialog } from './DebtDetailsDialog'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { StatCard } from '../ui/StatCard'
import { Table, TableRow, TableCell } from '../ui/Table'
import { ProgressBar } from '../ui/ProgressBar'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { formatCurrency } from '../../utils/formatters'
import type { Debt } from '../../types'
import type { DebtFormData, PaymentFormData } from '../../api/endpoints/debts'

export function DebtList(): JSX.Element {
  const {
    debts,
    loading,
    error,
    fetchDebts,
    addDebt,
    editDebt,
    makePayment,
    removeDebt,
  } = useDebts()

  const [formOpen, setFormOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)
  const [debtToDelete, setDebtToDelete] = useState<number | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ anchorEl: HTMLElement | null; debt: Debt | null }>({ anchorEl: null, debt: null })

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const handleOpenForm = (debt?: Debt): void => {
    setSelectedDebt(debt || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedDebt(null)
  }

  const handleOpenPaymentDialog = (debt: Debt): void => {
    setSelectedDebt(debt)
    setPaymentDialogOpen(true)
  }

  const handleClosePaymentDialog = (): void => {
    setPaymentDialogOpen(false)
    setSelectedDebt(null)
  }

  const handleOpenDetailsDialog = (debt: Debt): void => {
    setSelectedDebt(debt)
    setDetailsDialogOpen(true)
  }

  const handleCloseDetailsDialog = (): void => {
    setDetailsDialogOpen(false)
    setSelectedDebt(null)
  }

  const handleSubmit = async (data: DebtFormData): Promise<void> => {
    if (selectedDebt) {
      await editDebt(selectedDebt.id, data)
    } else {
      await addDebt(data)
    }
  }

  const handlePaymentSubmit = async (data: PaymentFormData): Promise<void> => {
    if (selectedDebt) {
      await makePayment(selectedDebt.id, data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setDebtToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (debtToDelete) {
      const success = await removeDebt(debtToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setDebtToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setDebtToDelete(null)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, debt: Debt): void => {
    event.stopPropagation()
    setMenuAnchor({ anchorEl: event.currentTarget, debt })
  }

  const handleMenuClose = (): void => {
    setMenuAnchor({ anchorEl: null, debt: null })
  }

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent): void => {
    e.stopPropagation()
    action()
    handleMenuClose()
  }

  // Filter debts
  const filteredDebts = debts.filter(debt => {
    if (statusFilter !== 'all' && debt.status !== statusFilter) return false
    if (searchQuery && !debt.creditor_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Calculate stats
  const activeDebts = debts.filter(d => d.status === 'Active')
  const totalOwed = activeDebts.reduce((sum, d) => sum + parseFloat(d.principal_amount), 0)
  const totalPaid = debts.reduce((sum, d) => sum + parseFloat(d.amount_paid), 0)
  const monthlyPayments = activeDebts.reduce((sum, d) => sum + parseFloat(d.monthly_payment), 0)
  const activeDebtsCount = activeDebts.length

  if (loading && debts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Deudas Activas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeDebtsCount}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Total Adeudado</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">${totalOwed.toLocaleString()}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Total Pagado</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">${totalPaid.toLocaleString()}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Pagos Mensuales</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${monthlyPayments.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* Filters - 30% en desktop, stack en móvil */}
          <div className="lg:w-64 space-y-3">
            <Select
              id="statusFilter"
              label=""
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="Active">Activas</option>
              <option value="Paid">Pagadas</option>
              <option value="Cancelled">Canceladas</option>
            </Select>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="🔍 Buscar acreedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ClearIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Debts: Table on desktop, Cards on mobile */}
      {filteredDebts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No se encontraron deudas' : 'No tienes deudas registradas'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Registra tu primera deuda para comenzar el seguimiento'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={() => handleOpenForm()} className="mx-auto">
              <AddIcon className="mr-2" />
              Agregar Deuda
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table headers={['Acreedor', 'Monto Principal', 'Total', 'Pagado', 'Restante', 'Mensual', 'Interés', 'Progreso', 'Estado', 'Acciones']}>
                {filteredDebts.map(debt => {
                  const monthsElapsed = Math.floor((new Date().getTime() - new Date(debt.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))
                  const monthsRemaining = Math.max(0, debt.term_months - monthsElapsed)
                  
                  return (
                    <TableRow key={debt.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          💳 {debt.creditor_name}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(debt.principal_amount)}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(debt.total_amount)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(debt.amount_paid)}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {formatCurrency(debt.remaining_balance)}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(debt.monthly_payment)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {debt.interest_rate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <ProgressBar 
                            value={debt.payment_progress} 
                            max={100}
                            showPercentage={false}
                          />
                          <span className="text-xs text-gray-500 mt-0.5 inline-block">
                            {debt.payment_progress.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {debt.status === 'Paid' && '✅ Pagada'}
                          {debt.status === 'Cancelled' && '⚠️ Cancelada'}
                          {debt.status === 'Active' && '🔴 Activa'}
                          {debt.status === 'Active' && monthsRemaining >= 0 && (
                            <div className="mt-0.5 text-gray-500">
                              {monthsRemaining} meses
                            </div>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => handleMenuClick(e, debt)}
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
            {filteredDebts.map(debt => (
              <DebtCard
                key={debt.id}
                debt={debt}
                onEdit={handleOpenForm}
                onAddPayment={handleOpenPaymentDialog}
                onDelete={handleDeleteClick}
                onViewDetails={handleOpenDetailsDialog}
              />
            ))}
          </div>
        </>
      )}

      {/* FAB Button */}
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
      >
        <AddIcon />
      </button>

      {/* Debt Form Dialog */}
      <DebtForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        debt={selectedDebt}
        loading={loading}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        onSubmit={handlePaymentSubmit}
        debt={selectedDebt}
        loading={loading}
      />

      {/* Details Dialog */}
      <DebtDetailsDialog
        open={detailsDialogOpen}
        onClose={handleCloseDetailsDialog}
        debt={selectedDebt}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete}>
        <Card title="Eliminar Deuda">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            ¿Estás seguro de que quieres eliminar esta deuda? Esta acción no se puede deshacer.
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
      {menuAnchor.anchorEl && menuAnchor.debt && (
        <ContextMenu anchorEl={menuAnchor.anchorEl} onClose={handleMenuClose}>
          {menuAnchor.debt.status === 'Active' && (
            <ContextMenuItem onClick={handleMenuAction(() => handleOpenPaymentDialog(menuAnchor.debt!))}>
              <PaymentIcon className="text-sm" />
              Registrar Pago
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleMenuAction(() => handleOpenForm(menuAnchor.debt!))}>
            <EditIcon className="text-sm" />
            Editar
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMenuAction(() => handleDeleteClick(menuAnchor.debt!.id))} destructive>
            <DeleteIcon className="text-sm" />
            Eliminar
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  )
}