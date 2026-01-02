/**
 * RecurringTransactionList - Display and manage recurring transactions (income and expenses)
 */

import { useEffect, useState } from 'react'
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  MoreVert,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as GenerateIcon,
  Pause as PauseIcon,
} from '@mui/icons-material'
import { useRecurringTransactions } from '../../hooks'
import { RecurringTransactionCard } from './RecurringTransactionCard'
import { RecurringTransactionForm } from './RecurringTransactionForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { Table, TableRow, TableCell } from '../ui/Table'
import { ContextMenu, ContextMenuItem } from '../ui/ContextMenu'
import { formatCurrency } from '../../utils/formatters'
import type { RecurringTransaction } from '../../types'
import type { RecurringTransactionFormData } from '../../api/endpoints/recurring-transactions'

export function RecurringTransactionList(): JSX.Element {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    toggleActive,
    generateNow,
  } = useRecurringTransactions()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<{ anchorEl: HTMLElement | null; transaction: RecurringTransaction | null }>({ anchorEl: null, transaction: null })

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleOpenForm = (transaction?: RecurringTransaction): void => {
    setSelectedTransaction(transaction || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedTransaction(null)
  }

  const handleSubmit = async (data: RecurringTransactionFormData): Promise<void> => {
    if (selectedTransaction) {
      await editTransaction(selectedTransaction.id, data)
    } else {
      await addTransaction(data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (transactionToDelete) {
      const success = await removeTransaction(transactionToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setTransactionToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setTransactionToDelete(null)
  }

  const handleViewDetails = (transaction: RecurringTransaction): void => {
    setSelectedTransaction(transaction)
    setDetailsDialogOpen(true)
  }

  const handleGenerateNow = async (transaction: RecurringTransaction): Promise<void> => {
    try {
      await generateNow(transaction.id)
      alert(`¡Transacción generada exitosamente para ${transaction.name}!`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, transaction: RecurringTransaction): void => {
    event.stopPropagation()
    setMenuAnchor({ anchorEl: event.currentTarget, transaction })
  }

  const handleMenuClose = (): void => {
    setMenuAnchor({ anchorEl: null, transaction: null })
  }

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent): void => {
    e.stopPropagation()
    action()
    handleMenuClose()
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (statusFilter === 'active' && !transaction.is_active) return false
    if (statusFilter === 'paused' && !transaction.is_active) return false
    if (typeFilter === 'income' && transaction.transaction_type !== 'Income') return false
    if (typeFilter === 'expense' && transaction.transaction_type !== 'Expense') return false
    if (searchQuery && !transaction.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Calculate stats
  const activeTransactions = transactions.filter((t) => t.is_active)
  const activeIncomes = activeTransactions.filter((t) => t.transaction_type === 'Income')
  const activeExpenses = activeTransactions.filter((t) => t.transaction_type === 'Expense')
  
  const totalMonthlyIncome = activeIncomes.reduce((sum, transaction) => {
    const amount = parseFloat(transaction.amount)
    const multiplier =
      transaction.frequency === 'monthly' ? 1 : transaction.frequency === 'biweekly' ? 2 : 4
    return sum + amount * multiplier
  }, 0)

  const totalMonthlyExpense = activeExpenses.reduce((sum, transaction) => {
    const amount = parseFloat(transaction.amount)
    const multiplier =
      transaction.frequency === 'monthly' ? 1 : transaction.frequency === 'biweekly' ? 2 : 4
    return sum + amount * multiplier
  }, 0)

  const netBalance = totalMonthlyIncome - totalMonthlyExpense

  if (loading && transactions.length === 0) {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Ingresos Mensuales</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${totalMonthlyIncome.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Gastos Mensuales</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  ${totalMonthlyExpense.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Balance Neto</p>
                <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${netBalance.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Total Activas</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {activeTransactions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters - 30% en desktop, stack en móvil */}
          <div className="lg:w-72 space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ClearIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select
              id="typeFilter"
              label=""
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="min-w-[140px]"
            >
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </Select>

            <Select
              id="statusFilter"
              label=""
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[120px]"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="paused">Pausados</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Transactions: Table on desktop, Cards on mobile */}
      {filteredTransactions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {transactions.length === 0
                ? 'No tienes transacciones recurrentes'
                : 'No se encontraron transacciones'}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {transactions.length === 0
                ? 'Usa el botón + para agregar ingresos o gastos recurrentes'
                : 'Intenta cambiar los filtros'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Card>
              <Table headers={['Nombre', 'Tipo', 'Monto', 'Frecuencia', 'Próxima', 'Cuenta', 'Categoría', 'Estado', 'Acciones']}>
                {filteredTransactions.map(transaction => {
                  const getTypeConfig = () => {
                    switch (transaction.transaction_type) {
                      case 'Income':
                        return { icon: '💰', color: '#10B981', label: 'Ingreso' }
                      case 'Expense':
                        return { icon: '💸', color: '#EF4444', label: 'Gasto' }
                      default:
                        return { icon: '🔄', color: '#6B7280', label: 'Transacción' }
                    }
                  }
                  const getFrequencyConfig = () => {
                    switch (transaction.frequency) {
                      case 'monthly':
                        return { icon: '🗓️', label: 'Mensual' }
                      case 'biweekly':
                        return { icon: '📆', label: 'Quincenal' }
                      case 'weekly':
                        return { icon: '📅', label: 'Semanal' }
                      default:
                        return { icon: '🔄', label: transaction.frequency }
                    }
                  }
                  const typeConfig = getTypeConfig()
                  const frequencyConfig = getFrequencyConfig()
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {transaction.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border"
                          style={{ 
                            backgroundColor: `${typeConfig.color}20`, 
                            color: typeConfig.color, 
                            borderColor: `${typeConfig.color}40` 
                          }}
                        >
                          {typeConfig.icon} {typeConfig.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: typeConfig.color }}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {frequencyConfig.icon} {frequencyConfig.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {transaction.next_occurrence ? new Date(transaction.next_occurrence).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {transaction.account_name || 'Sin cuenta'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {transaction.category_name || 'Sin categoría'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md border ${
                            transaction.is_active 
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {transaction.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => handleMenuClick(e, transaction)}
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
          <div className="lg:hidden">
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <RecurringTransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleOpenForm}
                  onGenerateNow={handleGenerateNow}
                  onDelete={handleDeleteClick}
                  onToggleActive={toggleActive}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* FAB Flotante */}
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        title="Nueva Transacción Recurrente"
      >
        <AddIcon />
      </button>

      {/* Transaction Form Dialog */}
      <RecurringTransactionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        transaction={selectedTransaction}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <Card title="Eliminar Transacción Recurrente">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar esta transacción recurrente? Esta acción no se puede deshacer.
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

      {/* Details Dialog */}
      <Modal open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} size="lg">
        <Card title="Detalles de la Transacción Recurrente">
          {selectedTransaction && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedTransaction.transaction_type === 'Income' ? '💰' : '💸'} {selectedTransaction.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Tipo</p>
                  <p className="font-medium">{selectedTransaction.transaction_type === 'Income' ? 'Ingreso' : 'Egreso'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Monto</p>
                  <p className="font-medium">${parseFloat(selectedTransaction.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Frecuencia</p>
                  <p className="font-medium">
                    {selectedTransaction.frequency === 'monthly'
                      ? 'Mensual'
                      : selectedTransaction.frequency === 'biweekly'
                      ? 'Quincenal'
                      : 'Semanal'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Cuenta</p>
                  <p className="font-medium">{selectedTransaction.account_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Categoría</p>
                  <p className="font-medium">{selectedTransaction.category_name || 'Sin categoría'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Estado</p>
                  <p className="font-medium">{selectedTransaction.is_active ? 'Activo' : 'Pausado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Próxima ocurrencia</p>
                  <p className="font-medium">{new Date(selectedTransaction.next_occurrence).toLocaleDateString('es-ES')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Transacciones generadas</p>
                  <p className="font-medium">{selectedTransaction.total_generated}</p>
                </div>
              </div>
              {selectedTransaction.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">Notas</p>
                  <p className="font-medium">{selectedTransaction.notes}</p>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setDetailsDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Modal>

      {/* Context Menu */}
      {menuAnchor.anchorEl && menuAnchor.transaction && (
        <ContextMenu anchorEl={menuAnchor.anchorEl} onClose={handleMenuClose}>
          <ContextMenuItem onClick={handleMenuAction(() => handleGenerateNow(menuAnchor.transaction!))}>
            <GenerateIcon className="text-sm" />
            Generar Ahora
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMenuAction(() => toggleActive(menuAnchor.transaction!.id))}>
            {menuAnchor.transaction.is_active ? (
              <>
                <PauseIcon className="text-sm" />
                Desactivar
              </>
            ) : (
              <>
                <GenerateIcon className="text-sm" />
                Activar
              </>
            )}
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMenuAction(() => handleOpenForm(menuAnchor.transaction!))}>
            <EditIcon className="text-sm" />
            Editar
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMenuAction(() => handleDeleteClick(menuAnchor.transaction!.id))} destructive>
            <DeleteIcon className="text-sm" />
            Eliminar
          </ContextMenuItem>
        </ContextMenu>
      )}
    </div>
  )
}



