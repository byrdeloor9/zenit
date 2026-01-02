/**
 * TransferForm component - Create transfer form with balance validation
 */

import { useState, useEffect, useMemo } from 'react'
import { SwapHoriz } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import type { Account } from '../../types'
import type { TransferFormData } from '../../api/endpoints/transfers'

interface TransferFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TransferFormData) => Promise<void>
  accounts: Account[]
  loading: boolean
}

export function TransferForm({
  open,
  onClose,
  onSubmit,
  accounts,
  loading,
}: TransferFormProps): JSX.Element {
  const [formData, setFormData] = useState<TransferFormData>({
    from_account: 0,
    to_account: 0,
    amount: '',
    transfer_date: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TransferFormData, string>>>({})

  // Get selected account for balance validation
  const fromAccount = useMemo(
    () => accounts.find(acc => acc.id === formData.from_account),
    [accounts, formData.from_account]
  )

  useEffect(() => {
    if (open) {
      setFormData({
        from_account: accounts.length > 0 ? accounts[0].id : 0,
        to_account: accounts.length > 1 ? accounts[1].id : 0,
        amount: '',
        transfer_date: new Date().toISOString().split('T')[0],
      })
    }
    setErrors({})
  }, [open, accounts])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TransferFormData, string>> = {}

    if (!formData.from_account) {
      newErrors.from_account = 'Selecciona la cuenta origen'
    }

    if (!formData.to_account) {
      newErrors.to_account = 'Selecciona la cuenta destino'
    }

    if (formData.from_account === formData.to_account) {
      newErrors.to_account = 'La cuenta destino debe ser diferente a la origen'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    // Validate balance (considering committed to goals)
    if (fromAccount && formData.amount) {
      const availableBalance = fromAccount.available_balance
      const transferAmount = parseFloat(formData.amount)
      
      if (transferAmount > availableBalance) {
        const committed = fromAccount.committed_to_goals
        newErrors.amount = `Saldo insuficiente. Disponible: $${availableBalance.toFixed(2)}${committed > 0 ? ` ($${committed.toFixed(2)} comprometido en metas)` : ''}`
      }
    }

    if (!formData.transfer_date) {
      newErrors.transfer_date = 'La fecha es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validate()) return

    await onSubmit(formData)
    onClose()
  }

  const handleChange = (field: keyof TransferFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev: TransferFormData) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof TransferFormData, string>>) => ({ ...prev, [field]: undefined }))
    }
  }

  // Available accounts for "to" (excluding selected "from")
  const availableToAccounts = accounts.filter(acc => acc.id !== formData.from_account)

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Card 
        title="Nueva Transferencia" 
        description="Transfiere dinero entre tus cuentas de forma segura"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From Account */}
          <Select
            id="from_account"
            label="Desde Cuenta"
            value={formData.from_account || ''}
            onChange={handleChange('from_account')}
            error={errors.from_account}
            required
            disabled={accounts.length === 0}
          >
            {accounts.length === 0 ? (
              <option value="">No hay cuentas disponibles</option>
            ) : (
              accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - Disponible: ${account.available_balance.toFixed(2)}
                </option>
              ))
            )}
          </Select>

          {/* Show available balance info */}
          {fromAccount && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              💰 Disponible: ${fromAccount.available_balance.toFixed(2)}
              {fromAccount.committed_to_goals > 0 && (
                <span className="text-gray-500"> (${fromAccount.committed_to_goals.toFixed(2)} comprometido en metas)</span>
              )}
            </div>
          )}

          {/* To Account */}
          <Select
            id="to_account"
            label="Hacia Cuenta"
            value={formData.to_account || ''}
            onChange={handleChange('to_account')}
            error={errors.to_account}
            required
            disabled={accounts.length < 2}
          >
            {availableToAccounts.length === 0 ? (
              <option value="">Selecciona cuenta origen primero</option>
            ) : (
              availableToAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} (${parseFloat(account.balance).toFixed(2)})
                </option>
              ))
            )}
          </Select>

          {/* Amount */}
          <Input
            id="amount"
            label="Monto a Transferir"
            type="number"
            value={formData.amount}
            onChange={handleChange('amount')}
            error={errors.amount}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />

          {/* Transfer Date */}
          <Input
            id="transfer_date"
            label="Fecha de Transferencia"
            type="date"
            value={formData.transfer_date}
            onChange={handleChange('transfer_date')}
            error={errors.transfer_date}
            required
          />

          {/* Info Alert */}
          {accounts.length < 2 && (
            <Alert 
              type="info"
              message="Necesitas al menos 2 cuentas para realizar transferencias."
            />
          )}

          {/* Balance Preview */}
          {fromAccount && formData.amount && parseFloat(formData.amount) > 0 && !errors.amount && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📊 Balance después de la transferencia:
              </h4>
              <p className="text-sm text-gray-700 mb-1">
                {fromAccount.name}: ${(parseFloat(fromAccount.balance) - parseFloat(formData.amount)).toFixed(2)}
              </p>
              {fromAccount.committed_to_goals > 0 && (
                <p className="text-xs text-gray-600">
                  Disponible: ${(fromAccount.available_balance - parseFloat(formData.amount)).toFixed(2)} (${fromAccount.committed_to_goals.toFixed(2)} comprometido)
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Transferiendo...' : 'Transferir'}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}