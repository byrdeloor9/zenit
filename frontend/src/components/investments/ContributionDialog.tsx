/**
 * ContributionDialog component - Add contribution with real transaction (migrated to Tailwind CSS)
 */

import { useState, useEffect } from 'react'
import { TrendingDown, TrendingUp } from '@mui/icons-material'
import { useInvestments } from '../../hooks'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'
import type { Investment, Account } from '../../types/models'

interface ContributionDialogProps {
  open: boolean
  investment: Investment | null
  accounts: Account[]
  onClose: () => void
  onSuccess?: () => void
  loading?: boolean
}

export function ContributionDialog({
  open,
  investment,
  accounts,
  onClose,
  onSuccess,
  loading = false,
}: ContributionDialogProps): JSX.Element {
  const { contribute, withdraw } = useInvestments()
  const [internalLoading, setInternalLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [transactionType, setTransactionType] = useState<'contribution' | 'withdrawal'>('contribution')

  useEffect(() => {
    if (open) {
      setAmount('')
      setAccountId('')
      setNotes('')
      setError(null)
      setTransactionType('contribution')
    }
  }, [open])

  const handleSubmit = async (): Promise<void> => {
    if (!investment || !amount || !accountId) {
      setError('Por favor completa todos los campos')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    setInternalLoading(true)
    setError(null)

    try {
      if (transactionType === 'contribution') {
        await contribute(investment.id, {
          amount: numAmount,
          account_id: accountId as number,
          notes: notes || undefined,
        })
      } else {
        await withdraw(investment.id, {
          amount: numAmount,
          account_id: accountId as number,
          notes: notes || undefined,
        })
      }

      onSuccess?.()
      onClose()
    } catch (err) {
      setError('Error al procesar la transacción')
      console.error(err)
    } finally {
      setInternalLoading(false)
    }
  }

  const isLoading = loading || internalLoading

  return (
    <Modal open={open} onClose={onClose}>
      <Card title={
        <div className="flex items-center gap-3">
          {transactionType === 'contribution' ? (
            <TrendingUp className="text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="text-red-600 dark:text-red-400" />
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {transactionType === 'contribution' ? 'Agregar Contribución' : 'Retirar Fondos'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {investment?.name}
            </p>
          </div>
        </div>
      }>
        <div className="space-y-4">
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Tipo de Transacción
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('contribution')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  transactionType === 'contribution'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="text-sm" />
                Contribución
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('withdrawal')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  transactionType === 'withdrawal'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <TrendingDown className="text-sm" />
                Retiro
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <Input
            id="amount"
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

          {/* Account Select */}
          <Select
            id="account"
            label="Cuenta"
            value={accountId}
            onChange={(e) => setAccountId(Number(e.target.value))}
            required
          >
            <option value="">Selecciona una cuenta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - ${parseFloat(account.balance).toLocaleString()}
              </option>
            ))}
          </Select>

          {/* Notes Input */}
          <Input
            id="notes"
            label="Notas (opcional)"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descripción de la transacción..."
          />

          {/* Investment Info */}
          {investment && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">
                Información de la Inversión
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Monto Actual:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${parseFloat(investment.current_amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Meta:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${parseFloat(investment.target_amount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && <Alert type="error" message={error} />}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !amount || !accountId}
            className={transactionType === 'contribution' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </div>
            ) : (
              transactionType === 'contribution' ? 'Agregar Contribución' : 'Retirar Fondos'
            )}
          </Button>
        </div>
      </Card>
    </Modal>
  )
}