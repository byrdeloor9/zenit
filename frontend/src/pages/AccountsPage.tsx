/**
 * Accounts Page - Redesigned with Tailwind CSS
 */

import { useEffect, useState } from 'react'
import { Add as AddIcon, AccountBalance, TrendingUp, TrendingDown } from '@mui/icons-material'
import { useAccounts } from '../hooks'
import { AccountForm } from '../components/accounts/AccountForm'
import { AccountHistory } from '../components/accounts/AccountHistory'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { formatCurrency } from '../utils/formatters'
import type { Account, AccountFormData } from '../types/models'

export function AccountsPage(): JSX.Element {
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

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

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

  // Apply filters
  let filteredAccounts = accounts.filter(account => {
    if (typeFilter !== 'all' && account.account_type !== typeFilter) return false
    if (currencyFilter !== 'all' && account.currency !== currencyFilter) return false
    return true
  })

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0)
  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter(account => parseFloat(account.balance) > 0).length

  if (loading && accounts.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Cuentas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus cuentas bancarias y de efectivo</p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <AddIcon className="mr-2" />
          Nueva Cuenta
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Total Cuentas
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {totalAccounts}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Balance Total
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              {formatCurrency(totalBalance.toString())}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Cuentas Activas
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              {activeAccounts}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Tipo de Cuenta"
            id="type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            <option value="checking">Cuenta Corriente</option>
            <option value="savings">Cuenta de Ahorros</option>
            <option value="credit">Tarjeta de Crédito</option>
            <option value="cash">Efectivo</option>
            <option value="investment">Inversión</option>
          </Select>
          
          <Select
            label="Moneda"
            id="currency"
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
          >
            <option value="all">Todas las monedas</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="COP">COP</option>
            <option value="MXN">MXN</option>
          </Select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {accounts.length === 0 
              ? 'No tienes cuentas aún'
              : 'No se encontraron cuentas'}
          </h3>
          <p className="text-gray-600 mb-6">
            {accounts.length === 0
              ? 'Crea tu primera cuenta para comenzar a gestionar tus finanzas'
              : 'Intenta cambiar los filtros para ver más resultados'}
          </p>
          {accounts.length === 0 && (
            <Button
              onClick={() => handleOpenForm()}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white"
            >
              <AddIcon className="mr-2" />
              Crear Primera Cuenta
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {account.name}
                    </h3>
                  </div>
                  <Badge 
                    variant={account.account_type === 'checking' ? 'info' : 
                            account.account_type === 'savings' ? 'success' :
                            account.account_type === 'credit' ? 'warning' : 'secondary'}
                    size="sm"
                  >
                    {account.account_type}
                  </Badge>
                </div>

                {/* Balance */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(account.balance)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {account.currency}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenForm(account)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewHistory(account)}
                    className="flex-1"
                  >
                    Historial
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(account.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Account Form Modal */}
      <AccountForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        account={selectedAccount}
        loading={loading}
      />

      {/* Account History Modal */}
      {historyAccount && (
        <AccountHistory
          open={historyOpen}
          onClose={handleCloseHistory}
          account={historyAccount}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Eliminar Cuenta
          </h3>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer y eliminará todas las transacciones asociadas.
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