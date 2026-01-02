/**
 * DebtForm component - Create/Edit debt with automatic payment calculation
 */

import { useState, useEffect } from 'react'
import { CreditCard } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { useFormValidation, commonValidators } from '../../hooks/useFormValidation'
import { calculateMonthlyPayment } from '../../api/endpoints/debts'
import type { Debt } from '../../types'
import type { DebtFormData } from '../../api/endpoints/debts'

interface DebtFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: DebtFormData) => Promise<void>
  debt?: Debt | null
  loading: boolean
}

export function DebtForm({
  open,
  onClose,
  onSubmit,
  debt,
  loading,
}: DebtFormProps): JSX.Element {
  const initialValues: DebtFormData = {
    creditor_name: '',
    principal_amount: '',
    interest_rate: '',
    interest_type: 'simple',
    term_months: 12,
    start_date: new Date().toISOString().split('T')[0],
    notes: null,
  }

  const validationRules = {
    creditor_name: commonValidators.required,
    principal_amount: commonValidators.positive,
    interest_rate: (value: string) => {
      const num = parseFloat(value)
      if (value === '' || isNaN(num) || num < 0) return 'La tasa de interés no puede ser negativa'
      return undefined
    },
    term_months: (value: number) => !value || value <= 0 ? 'El plazo debe ser mayor a 0' : undefined,
    start_date: commonValidators.required,
  }

  const {
    formData,
    errors,
    setFormData,
    handleChange,
    validateForm,
    resetForm,
  } = useFormValidation(initialValues, validationRules)

  const [calculatedPayment, setCalculatedPayment] = useState<number>(0)

  useEffect(() => {
    if (debt) {
      setFormData({
        creditor_name: debt.creditor_name,
        principal_amount: debt.principal_amount,
        interest_rate: debt.interest_rate,
        interest_type: debt.interest_type,
        term_months: debt.term_months,
        start_date: debt.start_date,
        notes: debt.notes,
      })
    } else {
      setFormData({
        creditor_name: '',
        principal_amount: '',
        interest_rate: '',
        interest_type: 'simple',
        term_months: 12,
        start_date: new Date().toISOString().split('T')[0],
        notes: null,
      })
    }
  }, [debt, open])

  // Calculate monthly payment whenever relevant fields change
  useEffect(() => {
    if (formData.principal_amount && formData.interest_rate !== '' && formData.term_months) {
      const principal = parseFloat(formData.principal_amount)
      const rate = parseFloat(formData.interest_rate)
      const months = formData.term_months
      
      if (principal > 0 && months > 0 && rate >= 0) {
        const payment = calculateMonthlyPayment(principal, rate, months, formData.interest_type)
        setCalculatedPayment(payment)
      }
    }
  }, [formData.principal_amount, formData.interest_rate, formData.term_months, formData.interest_type])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return

    await onSubmit(formData)
    onClose()
  }

  const totalInterest = calculatedPayment * formData.term_months - parseFloat(formData.principal_amount || '0')
  const totalAmount = parseFloat(formData.principal_amount || '0') + totalInterest

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <Card 
        title={
          <div className="flex items-center gap-3 pb-2 border-b-2 border-red-500">
            <span className="text-2xl">💳</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {debt ? 'Editar Deuda' : 'Nueva Deuda'}
            </span>
          </div>
        }
        description="Registra y administra tus deudas con cálculos automáticos de pagos"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Creditor Name */}
          <Input
            id="creditor_name"
            label="Acreedor"
            value={formData.creditor_name}
            onChange={handleChange('creditor_name')}
            error={errors.creditor_name}
            required
            placeholder="Ej: Mi hermana, Banco XYZ..."
          />
          {!errors.creditor_name && (
            <p className="text-sm text-gray-500 mt-1">A quién le debes (ej: Mi hermana, Banco, etc.)</p>
          )}

          {/* Principal Amount and Interest Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="principal_amount"
              label="Monto de la Deuda"
              type="number"
              value={formData.principal_amount}
              onChange={handleChange('principal_amount')}
              error={errors.principal_amount}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />

            {/* Interest Rate */}
            <div>
              <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 mb-1">
                Tasa de Interés Anual
              </label>
              <div className="relative">
                <input
                  id="interest_rate"
                  type="number"
                  value={formData.interest_rate}
                  onChange={handleChange('interest_rate')}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  className={`block w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition ${errors.interest_rate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
              {errors.interest_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.interest_rate}</p>
              )}
            </div>
          </div>

          {/* Interest Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Interés
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, interest_type: 'simple' }))}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.interest_type === 'simple'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                💰 Interés Simple
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, interest_type: 'amortized' }))}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.interest_type === 'amortized'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Amortización
              </button>
            </div>
            <p className="mt-1.5 text-sm text-gray-500">
              {formData.interest_type === 'simple' 
                ? 'Interés fijo sobre el monto original (cuotas iguales)' 
                : 'Cuotas fijas, interés decreciente (pago bancario estándar)'}
            </p>
          </div>

          {/* Term in Months and Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                id="term_months"
                label="Plazo (meses)"
                type="number"
                value={formData.term_months}
                onChange={handleChange('term_months')}
                error={errors.term_months}
                required
                min="1"
                max="360"
                step="1"
                placeholder="12"
              />
              {!errors.term_months && (
                <p className="text-sm text-gray-500 mt-1">Número de meses para pagar la deuda</p>
              )}
            </div>

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
              placeholder="Detalles adicionales sobre la deuda..."
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
          </div>

          {/* Calculation Preview */}
          {calculatedPayment > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                📊 Resumen del Préstamo ({formData.interest_type === 'simple' ? 'Interés Simple' : 'Amortización'})
              </h4>
              <div className="space-y-0.5 text-sm">
                <p className="text-gray-700">
                  • Cuota mensual: <strong>${calculatedPayment.toFixed(2)}</strong>
                </p>
                <p className="text-gray-700">
                  • Total intereses: <strong>${totalInterest.toFixed(2)}</strong> ({((totalInterest / parseFloat(formData.principal_amount || '1')) * 100).toFixed(1)}%)
                </p>
                <p className="text-gray-700">
                  • Total a pagar: <strong>${totalAmount.toFixed(2)}</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1.5">
                  {formData.interest_type === 'simple' 
                    ? `${formData.term_months} cuotas iguales de $${calculatedPayment.toFixed(2)}`
                    : `${formData.term_months} cuotas fijas de $${calculatedPayment.toFixed(2)} (interés decreciente)`
                  }
                </p>
              </div>
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
              {loading ? 'Guardando...' : (debt ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}