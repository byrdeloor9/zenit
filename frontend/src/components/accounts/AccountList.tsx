/**
 * AccountList component - Display and manage accounts
 */

import { useEffect, useState, useMemo, useRef } from 'react'
import { Add as AddIcon } from '@mui/icons-material'
import { useAccounts } from '../../hooks'
import { AccountCard } from './AccountCard'
import { AccountForm } from './AccountForm'
import { AccountHistory } from './AccountHistory'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/formatters'
import type { Account, AccountFormData } from '../../types/models'

export function AccountList(): JSX.Element {
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    editAccount,
    removeAccount,
  } = useAccounts()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null)
  const [historyAccount, setHistoryAccount] = useState<Account | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  
  // Ref para controlar la primera carga y evitar llamadas duplicadas
  const hasFetchedRef = useRef<boolean>(false)

  useEffect(() => {
    // Solo hacer fetch una vez al montar el componente
    // El hook useAccounts ya tiene protección contra llamadas simultáneas
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchAccounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vacío intencionalmente - solo ejecutar al montar

  const handleOpenForm = (account?: Account): void => {
    setSelectedAccount(account || null)
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
    setSelectedAccount(null)
  }

  const handleSubmit = async (data: AccountFormData): Promise<void> => {
    if (selectedAccount) {
      await editAccount(selectedAccount.id, data)
    } else {
      await addAccount(data)
    }
  }

  const handleDeleteClick = (id: number): void => {
    setAccountToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (accountToDelete) {
      const success = await removeAccount(accountToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setAccountToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  const handleViewHistory = (account: Account): void => {
    setHistoryAccount(account)
    setHistoryOpen(true)
  }

  const handleCloseHistory = (): void => {
    setHistoryOpen(false)
    setHistoryAccount(null)
  }

  // Filter accounts - memoizado para evitar recálculos innecesarios
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      if (typeFilter !== 'all' && account.type !== typeFilter) return false
      if (currencyFilter !== 'all' && account.currency !== currencyFilter) return false
      return true
    })
  }, [accounts, typeFilter, currencyFilter])

  // Calculate totals - memoizado para evitar recálculos innecesarios
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
  }, [accounts])

  const availableBalance = useMemo(() => {
    return totalBalance - accounts.reduce((sum, acc) => sum + acc.committed_to_goals, 0)
  }, [accounts, totalBalance])

  // Solo mostrar loading si no hay datos cargados aún
  // Si hay datos, se mantienen visibles mientras se actualiza en background
  if (loading && accounts.length === 0) {
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
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Cuentas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{accounts.length}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Balance Total</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalBalance.toString())}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase font-semibold text-gray-500 dark:text-gray-300 mb-2">Disponible</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(availableBalance.toString())}</p>
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
              <option value="all">Todas</option>
              <option value="bank">Bancaria</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="investment">Inversión</option>
            </Select>
            <Select
              id="currencyFilter"
              label=""
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
            >
              <option value="all">💵</option>
            <option value="USD">USD</option>
            <option value="MXN">MXN</option>
            <option value="EUR">EUR</option>
          </Select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {typeFilter !== 'all' || currencyFilter !== 'all'
              ? 'No se encontraron cuentas'
              : 'No tienes cuentas aún'}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-4">
            {typeFilter !== 'all' || currencyFilter !== 'all'
              ? 'Intenta cambiar los filtros para ver más resultados'
              : 'Crea tu primera cuenta para comenzar a administrar tus finanzas'}
          </p>
          {typeFilter === 'all' && currencyFilter === 'all' && (
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Haz clic en el botón + en la esquina inferior derecha
            </p>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenForm}
              onDelete={handleDeleteClick}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => handleOpenForm()}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        title="Nueva Cuenta"
      >
        <AddIcon />
      </button>

      {/* Account Form Dialog */}
      <AccountForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        account={selectedAccount}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <Card title="Eliminar Cuenta">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.
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

      {/* Account History Dialog */}
      <AccountHistory
        open={historyOpen}
        onClose={handleCloseHistory}
        account={historyAccount}
      />
    </div>
  )
}

