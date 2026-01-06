/**
 * BudgetForm component - Create/Edit budget form (Monthly Budgets)
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
  const [formData, setFormData] = useState<BudgetFormData>({
    category: 0,
    amount: '',
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
      setFormData({
        category: budget.category_id,
        amount: budget.amount,
        is_recurring: budget.is_recurring,
        change_reason: '',
      })
    } else {
      // New budget
      setFormData({
        category: expenseCategories.length > 0 ? expenseCategories[0].id : 0,
        amount: '',
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
      let parsedValue: string | number | boolean = value

      // Parse numeric fields
      if (field === 'category') {
        parsedValue = value === '' ? 0 : parseInt(value)
      }

      return { ...prev, [field]: parsedValue }
    })

    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof BudgetFormData, string>>) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Card
        title={
          <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-500">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto Mensual'}
            </span>
          </div>
        }
        description="Establece un límite de gasto mensual para controlar tus finanzas"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Alert */}
          <Alert
            type="info"
            message="El presupuesto se aplicará al mes actual y calculará automáticamente tus gastos del mes."
          />

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
              label="Presupuesto Mensual"
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

          {/* Recurring Toggle */}
          <Toggle
            label="🔄 Presupuesto mensual recurrente"
            description="Este presupuesto se renovará automáticamente cada mes"
            enabled={formData.is_recurring || false}
            setEnabled={(isChecked) => {
              setFormData(prev => ({
                ...prev,
                is_recurring: isChecked,
              }))
            }}
          />

          {formData.is_recurring && (
            <Alert
              type="success"
              message="Este presupuesto se renovará automáticamente cada mes sin fecha de finalización."
            />
          )}

          {/* Change Reason - Solo al editar */}
          {budget && (
            <div>
              <label htmlFor="change_reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Razón del cambio (opcional)
              </label>
              <textarea
                id="change_reason"
                value={formData.change_reason}
                onChange={handleChange('change_reason')}
                rows={2}
                placeholder="Ej: Ajuste por aumento de gastos..."
                className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Esto se guardará en el historial de cambios</p>
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