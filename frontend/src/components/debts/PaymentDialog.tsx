/**
 * PaymentDialog component - Dialog to add a debt payment (migrated to Tailwind CSS)
 */

import { useState, useEffect } from 'react'
import { Payment as PaymentIcon } from '@mui/icons-material'
import { useAccounts } from '../../hooks'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Alert } from '../ui/Alert'
import type { Debt } from '../../types'
import type { PaymentFormData } from '../../api/endpoints/debts'

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PaymentFormData) => Promise<void>
  debt: Debt | null
  loading: boolean
}

export function PaymentDialog({
  open,
  onClose,
  onSubmit,
  debt,
  loading,
}: PaymentDialogProps): JSX.Element {
  const { accounts, fetchAccounts } = useAccounts()
  const [formData, setFormData] = useState<PaymentFormData>({
    account: 0,
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: null,
  })

  const [error, setError] = useState<string>('')

  // Fetch accounts when dialog opens
  useEffect(() => {
    if (open) {
      fetchAccounts()
    }
  }, [open, fetchAccounts])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        account: 0,
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: null,
      })
      setError('')
    }
  }, [open])

  const handleChange = (field: keyof PaymentFormData, value: string | number): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formData.account) {
      setError('Selecciona una cuenta')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError('Error al registrar el pago')
      console.error(err)
    }
  }

  const handleClose = (): void => {
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Card title={
        <div className="flex items-center gap-3">
          <PaymentIcon className="text-green-600 dark:text-green-400" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Registrar Pago
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {debt?.creditor_name}
            </p>
          </div>
        </div>
      }>
        <div className="space-y-4">
          {/* Account Selection */}
          <Select
            id="account"
            label="Cuenta de Pago"
            value={formData.account}
            onChange={(e) => handleChange('account', Number(e.target.value))}
            required
          >
            <option value={0}>Selecciona una cuenta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - ${parseFloat(account.balance).toLocaleString()}
              </option>
            ))}
          </Select>

          {/* Amount Input */}
          <Input
            id="amount"
            label="Monto del Pago"
            type="number"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

          {/* Payment Date */}
          <Input
            id="payment_date"
            label="Fecha de Pago"
            type="date"
            value={formData.payment_date}
            onChange={(e) => handleChange('payment_date', e.target.value)}
            required
          />

          {/* Notes Input */}
          <Input
            id="notes"
            label="Notas (opcional)"
            type="text"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Descripción del pago..."
          />

          {/* Debt Information */}
          {debt && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Información de la Deuda
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Total Adeudado:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${debt.total_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Pagado:</span>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ${parseFloat(debt.amount_paid).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Restante:</span>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    ${(debt.total_amount - parseFloat(debt.amount_paid)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Pago Mensual:</span>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    ${parseFloat(debt.monthly_payment).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && <Alert type="error" message={error} />}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.account || !formData.amount}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </div>
            ) : (
              'Registrar Pago'
            )}
          </Button>
        </div>
      </Card>
    </Modal>
  )
}