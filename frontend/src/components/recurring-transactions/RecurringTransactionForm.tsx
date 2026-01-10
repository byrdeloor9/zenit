/**
 * RecurringTransactionForm - Create/Edit recurring transaction dialog
 */

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Repeat } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import { useAccounts, useCategories } from '../../hooks'
import type { RecurringTransaction } from '../../types'
import type { RecurringTransactionFormData } from '../../api/endpoints/recurring-transactions'

interface RecurringTransactionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RecurringTransactionFormData) => Promise<void>
  transaction?: RecurringTransaction | null
  loading: boolean
}

export function RecurringTransactionForm({
  open,
  onClose,
  onSubmit,
  transaction,
  loading,
}: RecurringTransactionFormProps): JSX.Element {
  const { accounts, fetchAccounts } = useAccounts()
  const { categories, fetchCategories } = useCategories()

  const [formData, setFormData] = useState<RecurringTransactionFormData>({
    name: '',
    transaction_type: 'Income',
    amount: '',
    frequency: 'monthly',
    day_of_period: 1,
    account: 0,
    category: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    is_active: true,
    notes: null,
  })

  const [isIndefinite, setIsIndefinite] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof RecurringTransactionFormData, string>>>({})

  useEffect(() => {
    if (open) {
      fetchAccounts()
      fetchCategories()
    }
  }, [open, fetchAccounts, fetchCategories])

  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.name,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        frequency: transaction.frequency,
        day_of_period: transaction.day_of_period,
        account: transaction.account,
        category: transaction.category,
        start_date: transaction.start_date,
        end_date: transaction.end_date,
        is_active: transaction.is_active,
        notes: transaction.notes,
      })
      setIsIndefinite(!transaction.end_date)
    } else {
      const today = new Date()
      // Use local date string YYYY-MM-DD to avoid UTC offset issues
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayStr = `${year}-${month}-${day}`

      setFormData({
        name: '',
        transaction_type: 'Income',
        amount: '',
        frequency: 'monthly',
        day_of_period: today.getDate(), // Initialize with Today's day
        account: accounts.length > 0 ? accounts[0].id : 0,
        category: null,
        start_date: todayStr,
        end_date: null,
        is_active: true,
        notes: null,
      })
      setIsIndefinite(true)
    }
    setErrors({})
  }, [transaction, open, accounts])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RecurringTransactionFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.account) {
      newErrors.account = 'Debes seleccionar una cuenta'
    }

    // Validate day_of_period based on frequency
    if (formData.frequency === 'monthly' && (formData.day_of_period < 1 || formData.day_of_period > 31)) {
      newErrors.day_of_period = 'Para frecuencia mensual, el día debe estar entre 1 y 31'
    } else if (formData.frequency === 'biweekly' && (formData.day_of_period < 1 || formData.day_of_period > 15)) {
      newErrors.day_of_period = 'Para frecuencia quincenal, el día debe estar entre 1 y 15'
    } else if (formData.frequency === 'weekly' && (formData.day_of_period < 1 || formData.day_of_period > 7)) {
      newErrors.day_of_period = 'Para frecuencia semanal, el día debe estar entre 1 y 7'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida'
    }

    if (!isIndefinite && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      if (end <= start) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validate()) return

    const submitData = {
      ...formData,
      end_date: isIndefinite ? null : formData.end_date,
    }

    await onSubmit(submitData)
    onClose()
  }

  // Auto-update day_of_period when start_date changes
  useEffect(() => {
    if (formData.start_date) {
      const date = new Date(formData.start_date + 'T12:00:00')

      setFormData(prev => {
        // Only update if the value seems consistent with a user action (optional, but good UX)
        // For now, we enforce sync to avoid errors
        let newDay = prev.day_of_period

        if (prev.frequency === 'monthly') {
          newDay = date.getDate()
        } else if (prev.frequency === 'weekly') {
          // JS getDay(): 0=Sun, 1=Mon...6=Sat
          // Model expects: 1=Mon...7=Sun (ISO) usually? 
          // Let's check model validation: "1 (Lunes) y 7 (Domingo)"
          const day = date.getDay()
          newDay = day === 0 ? 7 : day
        } else if (prev.frequency === 'biweekly') {
          // For biweekly, if date is > 15, we subtract 15 or keep it?
          // Model says 1-15.
          const day = date.getDate()
          newDay = day > 15 ? day - 15 : day
        }

        return {
          ...prev,
          day_of_period: newDay
        }
      })
    }
  }, [formData.start_date, formData.frequency])

  const handleChange = (field: keyof RecurringTransactionFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const getDayLabel = (): string => {
    switch (formData.frequency) {
      case 'monthly':
        return 'Día del mes (1-31)'
      case 'biweekly':
        return 'Día de la quincena (1-15)'
      case 'weekly':
        return 'Día de la semana (1=Lun, 7=Dom)'
      default:
        return 'Día'
    }
  }

  // Filter categories by transaction type
  const filteredCategories = categories.filter(
    (c) => c.type === formData.transaction_type
  )

  const multiplier = formData.frequency === 'monthly' ? 1 : formData.frequency === 'biweekly' ? 2 : 4
  const monthlyAmount = parseFloat(formData.amount || '0') * multiplier

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <Card
        title={
          <div className="flex items-center gap-3 pb-2 border-b-2 border-cyan-500">
            <span className="text-2xl">🔄</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {transaction ? 'Editar Transacción Recurrente' : 'Nueva Transacción Recurrente'}
            </span>
          </div>
        }
        description="Configura transacciones que se repiten automáticamente"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Transacción *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  transaction_type: 'Income',
                  category: null, // Reset category when changing type
                }))}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${formData.transaction_type === 'Income'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
              >
                <TrendingUp className="mr-2" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  transaction_type: 'Expense',
                  category: null, // Reset category when changing type
                }))}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${formData.transaction_type === 'Expense'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
              >
                <TrendingDown className="mr-2" />
                Egreso
              </button>
            </div>
          </div>

          {/* Name */}
          <Input
            id="name"
            label="Nombre de la Transacción"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
            placeholder="Ej: Salario, Renta, Servicios..."
          />

          {/* Amount and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="amount"
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              error={errors.amount}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />

            <Select
              id="frequency"
              label="Frecuencia"
              value={formData.frequency}
              onChange={handleChange('frequency')}
            >
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
            </Select>
          </div>

          {/* Day of Period and Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="day_of_period"
              label={getDayLabel()}
              type="number"
              value={formData.day_of_period}
              onChange={handleChange('day_of_period')}
              error={errors.day_of_period}
              required
              min="1"
              max={formData.frequency === 'monthly' ? 31 : formData.frequency === 'biweekly' ? 15 : 7}
              step="1"
            />

            <Input
              id="start_date"
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={handleChange('start_date')}
              error={errors.start_date}
              required
            />
          </div>

          {/* Account and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="account"
              label="Cuenta"
              value={formData.account || ''}
              onChange={handleChange('account')}
              error={errors.account}
              required
              disabled={accounts.length === 0}
            >
              {accounts.length === 0 ? (
                <option value="">No hay cuentas disponibles</option>
              ) : (
                accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))
              )}
            </Select>

            <Select
              id="category"
              label="Categoría"
              value={formData.category || ''}
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

          {/* End Date */}
          {!isIndefinite && (
            <Input
              id="end_date"
              label="Fecha de Fin"
              type="date"
              value={formData.end_date || ''}
              onChange={handleChange('end_date')}
              error={errors.end_date}
            />
          )}

          {/* Indefinite Toggle */}
          <Toggle
            label="Transacción indefinida"
            description="No tiene fecha de finalización"
            enabled={isIndefinite}
            setEnabled={setIsIndefinite}
          />

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={handleChange('notes')}
              rows={2}
              placeholder="Detalles adicionales..."
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
          </div>

          {/* Monthly Amount Preview */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📊 Equivalente mensual:
              </h4>
              <p className="text-lg font-bold text-blue-900">
                ${monthlyAmount.toFixed(2)} / mes
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {formData.frequency === 'monthly' ? '1x por mes' :
                  formData.frequency === 'biweekly' ? '2x por mes' : '4x por mes'}
              </p>
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
              {loading ? 'Guardando...' : (transaction ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}