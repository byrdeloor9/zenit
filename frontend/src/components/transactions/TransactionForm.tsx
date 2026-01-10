/**
 * TransactionForm component - Create/Edit transaction form
 */

import { useEffect } from 'react'
import { TrendingUp, TrendingDown } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useFormValidation, commonValidators } from '../../hooks/useFormValidation'
import type { Transaction, Account, Category } from '../../types'
import type { TransactionFormData } from '../../api/endpoints/transactions'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => Promise<void>
  transaction?: Transaction | null
  loading: boolean
  accounts: Account[]
  categories: Category[]
  onDelete?: (id: number) => void
}

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  transaction,
  loading,
  accounts,
  categories,
  onDelete,
}: TransactionFormProps): JSX.Element {
  const initialValues: TransactionFormData = {
    account: 0,
    category: null,
    type: 'Expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
  }

  const validationRules = {
    account: (value: number) => !value ? 'Selecciona una cuenta' : undefined,
    amount: (value: string) => {
      const num = parseFloat(value)
      if (!value || isNaN(num) || num <= 0) return 'El monto debe ser mayor a 0'
      return undefined
    },
    transaction_date: commonValidators.required,
  }

  const {
    formData,
    errors,
    setFormData,
    handleChange,
    validateForm,
  } = useFormValidation(initialValues, validationRules)

  useEffect(() => {
    if (transaction) {
      setFormData({
        account: transaction.account_id,
        category: transaction.category_id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || '',
        transaction_date: transaction.transaction_date,
      })
    } else {
      // Set default account only if accounts exist
      const defaultAccount = accounts.length > 0 ? accounts[0].id : 0
      setFormData({
        account: defaultAccount,
        category: null,
        type: 'Expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
      })
    }
  }, [transaction, open, accounts])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return

    // Convert string values to appropriate types and ensure proper formatting
    const submitData: TransactionFormData = {
      account: Number(formData.account),
      category: formData.category && formData.category !== 0 ? Number(formData.category) : null,
      type: formData.type,
      amount: formData.amount.trim(), // Remove any leading/trailing whitespace
      description: formData.description.trim(),
      transaction_date: formData.transaction_date,
    }



    await onSubmit(submitData)
    onClose()
  }

  const handleTypeChange = (newType: 'Income' | 'Expense'): void => {
    setFormData((prev: TransactionFormData) => ({ ...prev, type: newType }))
  }

  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Card
        title={transaction ? 'Editar Transacción' : 'Nueva Transacción'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Tipo de Transacción
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('Income')}
                className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all text-sm font-medium ${formData.type === 'Income'
                  ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                <TrendingUp className="mr-1.5 w-4 h-4" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Expense')}
                className={`flex items-center justify-center px-3 py-2 rounded-lg border transition-all text-sm font-medium ${formData.type === 'Expense'
                  ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
              >
                <TrendingDown className="mr-1.5 w-4 h-4" />
                Gasto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account */}
            <div>
              <Select
                id="account"
                label="Cuenta"
                value={formData.account?.toString() || ''}
                onChange={handleChange('account')}
                error={errors.account}
                required
                disabled={accounts.length === 0}
              >
                {accounts.length === 0 ? (
                  <option value="">No hay cuentas</option>
                ) : (
                  accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))
                )}
              </Select>
            </div>

            {/* Category */}
            <div>
              <Select
                id="category"
                label="Categoría"
                value={formData.category?.toString() || ''}
                onChange={handleChange('category')}
              >
                <option value="">Sin categoría</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon && `${category.icon} `}{category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Amount and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="amount"
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              error={errors.amount}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />

            <Input
              id="transaction_date"
              label="Fecha"
              type="date"
              value={formData.transaction_date}
              onChange={handleChange('transaction_date')}
              error={errors.transaction_date}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-gray-500 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange('description')}
              rows={2}
              placeholder="Ej: Compra..."
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-2">
            {transaction && onDelete ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => onDelete(transaction.id)}
                disabled={loading}
                className="!px-3 !py-2 text-sm"
                title="Eliminar"
              >
                <TrendingDown className="transform rotate-45 w-4 h-4 mr-1" />
                Eliminar
              </Button>
            ) : <div></div>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="!py-2 text-sm"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="!py-2 text-sm"
              >
                {loading ? '...' : (transaction ? 'Guardar' : 'Crear')}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </Modal>
  )
}