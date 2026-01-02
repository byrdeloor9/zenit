/**
 * AccountForm component - Create/Edit account form
 */

import { useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useFormValidation, commonValidators } from '../../hooks/useFormValidation'
import type { Account, AccountFormData } from '../../types'

interface AccountFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AccountFormData) => Promise<void>
  account?: Account | null
  loading: boolean
}

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Cuenta Bancaria' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'investment', label: 'Inversión' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD - Dólar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'MXN', label: 'MXN - Peso Mexicano' },
]

const ACCOUNT_COLORS = [
  { value: '#4F46E5', label: 'Índigo', name: 'Índigo' },
  { value: '#06B6D4', label: 'Turquesa', name: 'Turquesa' },
  { value: '#10B981', label: 'Esmeralda', name: 'Esmeralda' },
  { value: '#F59E0B', label: 'Ámbar', name: 'Ámbar' },
  { value: '#EF4444', label: 'Rojo', name: 'Rojo' },
  { value: '#8B5CF6', label: 'Violeta', name: 'Violeta' },
  { value: '#EC4899', label: 'Rosa', name: 'Rosa' },
  { value: '#14B8A6', label: 'Teal', name: 'Teal' },
  { value: '#84CC16', label: 'Lima', name: 'Lima' },
  { value: '#F97316', label: 'Naranja', name: 'Naranja' },
  { value: '#6366F1', label: 'Índigo Claro', name: 'Índigo Claro' },
  { value: '#22D3EE', label: 'Cian', name: 'Cian' },
]

export function AccountForm({ open, onClose, onSubmit, account, loading }: AccountFormProps): JSX.Element {
  const initialValues: AccountFormData = {
    name: '',
    type: 'bank',
    balance: '0.00',
    currency: 'USD',
    color: '#4F46E5',
  }

  const validationRules = {
    name: commonValidators.required,
    balance: (value: string) => {
      const num = parseFloat(value)
      if (isNaN(num)) return 'El balance debe ser un número válido'
      return undefined
    },
  }

  const {
    formData,
    errors,
    setFormData,
    handleChange,
    validateForm,
  } = useFormValidation(initialValues, validationRules)

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        color: account.color || '#4F46E5',
      })
    } else {
      setFormData({
        name: '',
        type: 'bank',
        balance: '0.00',
        currency: 'USD',
        color: '#4F46E5',
      })
    }
  }, [account, open])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return

    await onSubmit(formData)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Card 
        title={account ? 'Editar Cuenta' : 'Nueva Cuenta'} 
        description="Administra tus cuentas financieras y mantén un registro de tus balances"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Input
            id="name"
            label="Nombre de la Cuenta"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
            placeholder="Ej: Cuenta Principal, Efectivo..."
          />

          {/* Type and Currency in grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="type"
              label="Tipo de Cuenta"
              value={formData.type}
              onChange={handleChange('type')}
              required
            >
              {ACCOUNT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              id="currency"
              label="Moneda"
              value={formData.currency}
              onChange={handleChange('currency')}
              required
            >
              {CURRENCIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Balance */}
          <Input
            id="balance"
            label="Balance Inicial"
            type="number"
            value={formData.balance}
            onChange={handleChange('balance')}
            error={errors.balance}
            required
            step="0.01"
            placeholder="0.00"
          />

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color de la Cuenta
            </label>
            <div className="grid grid-cols-6 gap-3">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData((prev: AccountFormData) => ({ ...prev, color: color.value }))}
                  className={`w-full aspect-square rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 relative ${
                    formData.color === color.value 
                      ? 'ring-2 ring-indigo-500 ring-offset-2' 
                      : 'hover:ring-1 hover:ring-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-lg font-bold drop-shadow-lg">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Selecciona un color para identificar fácilmente esta cuenta
            </p>
          </div>

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
              {loading ? 'Guardando...' : (account ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}