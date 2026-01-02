/**
 * TransferList component - Display and manage transfers
 * Header similar to Transacciones, cards in grid like Mis Cuentas
 */

import { useEffect, useState } from 'react'
import { 
  Add as AddIcon, 
  ArrowForward,
  AccountBalance,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useTransfers, useAccounts } from '../../hooks'
import { TransferForm } from './TransferForm'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Card } from '../ui/Card'
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { TransferFormData } from '../../api/endpoints/transfers'

const TRANSFER_COLOR = '#3B82F6'

export function TransferList(): JSX.Element {
  const {
    transfers,
    loading,
    error,
    fetchTransfers,
    addTransfer,
    removeTransfer,
  } = useTransfers()

  const {
    accounts,
    loading: accountsLoading,
    fetchAccounts,
  } = useAccounts()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transferToDelete, setTransferToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchTransfers()
    fetchAccounts()
  }, [fetchTransfers, fetchAccounts])

  const handleOpenForm = (): void => {
    setFormOpen(true)
  }

  const handleCloseForm = (): void => {
    setFormOpen(false)
  }

  const handleSubmit = async (data: TransferFormData): Promise<void> => {
    const result = await addTransfer(data)
    if (result) {
      // Refresh accounts to update balances
      await fetchAccounts()
    }
  }

  const handleDeleteClick = (id: number): void => {
    setTransferToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (transferToDelete) {
      const success = await removeTransfer(transferToDelete)
      if (success) {
        setDeleteDialogOpen(false)
        setTransferToDelete(null)
      }
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setTransferToDelete(null)
  }

  // Calculate stats
  const totalTransferred = transfers.reduce((sum, t) => sum + parseFloat(t.amount), 0)

  if (loading && transfers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar - Grid responsive */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-300 mb-1">Transferencias</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{transfers.length}</p>
          </div>
          <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
            <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-300 mb-1">Monto Total</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalTransferred.toString())}</p>
          </div>
        </div>
      </div>

      {/* Error and Alert Messages */}
      {error && (
        <Alert type="error" message={error} />
      )}

      {!accountsLoading && accounts.length < 2 && (
        <Alert type="info" message="Necesitas al menos 2 cuentas para realizar transferencias. Crea más cuentas en la sección 'Cuentas'." />
      )}

      {/* Transfers List */}
      {transfers.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">💸</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No tienes transferencias aún
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            {accounts.length < 2
              ? 'Crea al menos 2 cuentas para comenzar a transferir dinero'
              : 'Haz clic en el botón flotante para crear tu primera transferencia'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-3">
                {/* Icono From */}
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AccountBalance className="w-5 h-5 text-red-600" />
                </div>
                
                <ArrowForward className="w-6 h-6 text-blue-600" />
                
                {/* Icono To */}
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <AccountBalance className="w-5 h-5 text-green-600" />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {transfer.from_account_name} → {transfer.to_account_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    {formatDate(transfer.transfer_date)}
                  </p>
                </div>
                
                {/* Monto */}
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(transfer.amount)}
                  </p>
                </div>
                
                {/* Acciones */}
                <button
                  onClick={() => handleDeleteClick(transfer.id)}
                  className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <DeleteIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB Button */}
      {accounts.length >= 2 && (
        <button
          onClick={() => handleOpenForm()}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
          title="Nueva Transferencia"
        >
          <AddIcon />
        </button>
      )}

      {/* Transfer Form Dialog */}
      <TransferForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        accounts={accounts}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Modal open={deleteDialogOpen} onClose={handleCancelDelete} size="sm">
        <Card title="Eliminar Transferencia">
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              ¿Estás seguro de que deseas eliminar esta transferencia? Esta acción no se puede deshacer.
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
    </div>
  )
}

