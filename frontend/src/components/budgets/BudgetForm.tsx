/**
 * BudgetForm component - Create/Edit budget form
 */

import { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import { Alert } from '../ui/Alert'
import type { BudgetFormData, BudgetWithProgress } from '../../api/endpoints/budgets'
import type { Category } from '../../types/models'

interface BudgetFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: BudgetFormData) => Promise<void>
  budget?: BudgetWithProgress | null
  categories: Category[]
  loading: boolean
}

export function BudgetForm({
  open,
  onClose,
  onSubmit,
  budget,
  categories,
  loading,
}: BudgetFormProps): JSX.Element {
  // Calculate end_date based on months
  const calculateEndDateFromMonths = (startDate: string, months: number): string => {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + months)
    date.setDate(date.getDate() - 1) // Last day of period
    return date.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState<BudgetFormData>({
    category: 0,
    amount: '',
    months: 1,  // Default to 1 month
    start_date: new Date().toISOString().split('T')[0],
    end_date: calculateEndDateFromMonths(new Date().toISOString().split('T')[0], 1),
    is_indefinite: false,
    is_recurring: false,
    change_reason: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({})

  // Filter expense categories only - memoized to prevent infinite loop
  const expenseCategories = useMemo(
    () => categories.filter(cat => cat.type === 'Expense'),
    [categories]
  )

  useEffect(() => {
    if (budget) {
      // When editing
      const isIndefinite = budget.period_end === null
      let monthsDiff = null

      if (!isIndefinite && budget.period_end) {
        const start = new Date(budget.period_start)
        const end = new Date(budget.period_end)
        monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      }

      setFormData({
        category: budget.category_id,
        amount: budget.amount,
        months: monthsDiff,
        start_date: budget.period_start,
        end_date: budget.period_end || '',
        is_indefinite: isIndefinite,
        is_recurring: budget.is_recurring,
        change_reason: '',
      })
    } else {
      // New budget
      const today = new Date()
      const startDate = today.toISOString().split('T')[0]
      const endDate = calculateEndDateFromMonths(startDate, 1)

      setFormData({
        category: expenseCategories.length > 0 ? expenseCategories[0].id : 0,
        amount: '',
        months: 1,
        start_date: startDate,
        end_date: endDate,
        is_indefinite: false,
        is_recurring: false,
        change_reason: '',
      })
    }
    setErrors({})
  }, [budget, open, expenseCategories])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BudgetFormData, string>> = {}

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida'
    }

    // end_date is only required if NOT indefinite
    if (!formData.is_indefinite && !formData.end_date) {
      newErrors.end_date = 'La fecha de fin es requerida'
    }

    if (!formData.is_indefinite && formData.end_date && formData.start_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }

    // Validate months if provided and NOT indefinite
    if (!formData.is_indefinite && formData.months !== null && formData.months <= 0) {
      newErrors.months = 'El plazo debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!validate()) {

      return
    }


    await onSubmit(formData)
    onClose()
  }

  const handleChange = (field: keyof BudgetFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const value = e.target.value

    setFormData((prev: BudgetFormData) => {
      let parsedValue: string | number | null = value

      // Parse numeric fields
      if (field === 'months' || field === 'category') {
        parsedValue = value === '' ? (field === 'months' ? null : 0) : parseInt(value)
      }

      const updated = { ...prev, [field]: parsedValue }

      // Auto-calculate end_date when months changes
      if (field === 'months') {
        const months = parseInt(value) || 0
        if (months > 0) {
          updated.end_date = calculateEndDateFromMonths(prev.start_date, months)
        }
      }

      // Recalculate end_date when start_date changes and months is set
      if (field === 'start_date' && prev.months && prev.months > 0) {
        updated.end_date = calculateEndDateFromMonths(value, prev.months)
      }

      return updated
    })

    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof BudgetFormData, string>>) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <Card
        title={
          <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-500">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </span>
          </div>
        }
        description="Establece límites de gasto para mantener el control de tus finanzas"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="category"
              label="Categoría"
              value={formData.category || ''}
              onChange={handleChange('category')}
              error={errors.category}
              required
              disabled={expenseCategories.length === 0}
            >
              {expenseCategories.length === 0 ? (
                <option value="">No hay categorías de gasto</option>
              ) : (
                expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon && `${cat.icon} `}{cat.name}
                  </option>
                ))
              )}
            </Select>

            <Input
              id="amount"
              label="Monto del Presupuesto"
              type="number"
              value={formData.amount}
              onChange={handleChange('amount')}
              error={errors.amount}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* Indefinite Budget Toggle */}
          <Toggle
            label="∞ Presupuesto sin fecha de fin (indefinido)"
            description="Se renovará automáticamente cada mes"
            enabled={formData.is_indefinite || false}
            setEnabled={(isChecked) => {
              setFormData(prev => ({
                ...prev,
                is_indefinite: isChecked,
                end_date: isChecked ? null : (prev.months ? calculateEndDateFromMonths(prev.start_date, prev.months) : ''),
                months: isChecked ? null : prev.months,
                is_recurring: isChecked ? true : prev.is_recurring,
              }))
            }}
          />

          {formData.is_indefinite && (
            <Alert
              type="info"
              message="Este presupuesto no tiene fecha de finalización y se renovará automáticamente cada mes."
            />
          )}

          {/* Months Duration - Solo si NO es indefinido */}
          {!formData.is_indefinite && (
            <Input
              id="months"
              label="Plazo del Presupuesto (meses)"
              type="number"
              value={formData.months || ''}
              onChange={handleChange('months')}
              error={errors.months}
              placeholder="Ej: 1, 3, 6, 12..."
              min="1"
              max="120"
            />
          )}

          {/* Dates */}
          <div className={`grid gap-6 ${formData.is_indefinite ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <Input
              id="start_date"
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={handleChange('start_date')}
              error={errors.start_date}
              required
            />

            {!formData.is_indefinite && (
              <Input
                id="end_date"
                label="Fecha de Fin"
                type="date"
                value={formData.end_date || ''}
                onChange={handleChange('end_date')}
                error={errors.end_date}
                required
                disabled={!!formData.months && formData.months > 0}
              />
            )}
          </div>

          {/* Info Messages */}
          {!formData.is_indefinite && formData.months && formData.months > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              📅 La fecha de fin se calcula automáticamente: {formData.months} {formData.months === 1 ? 'mes' : 'meses'} desde la fecha de inicio
            </div>
          )}
          {!formData.is_indefinite && (!formData.months || formData.months === 0) && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              ✏️ Puedes editar las fechas de inicio y fin manualmente
            </div>
          )}

          {/* Change Reason - Solo al editar */}
          {budget && (
            <div>
              <label htmlFor="change_reason" className="block text-sm font-medium text-gray-700 mb-1">
                Razón del cambio (opcional)
              </label>
              <textarea
                id="change_reason"
                value={formData.change_reason}
                onChange={handleChange('change_reason')}
                rows={2}
                placeholder="Ej: Ajuste por aumento de gastos..."
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
              />
              <p className="mt-1 text-sm text-gray-500">Esto se guardará en el historial de cambios</p>
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
              {loading ? 'Guardando...' : (budget ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}