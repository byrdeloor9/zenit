/**
 * InvestmentForm component - Create/Edit investment with dynamic fields
 */

import { useState, useEffect } from 'react'
import { EmojiEvents } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { Investment, Account } from '../../types'
import type { InvestmentFormData } from '../../api/endpoints/investments'

interface InvestmentFormProps {
  open: boolean
  investment: Investment | null
  investmentType: 'goal' | 'insurance'
  accounts: Account[]
  onClose: () => void
  onSubmit: (data: InvestmentFormData) => Promise<void>
}

export function InvestmentForm({
  open,
  investment,
  investmentType,
  accounts,
  onClose,
  onSubmit,
}: InvestmentFormProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InvestmentFormData>({
    investment_type: investmentType,
    name: '',
    account: null,
    initial_amount: '0',
    current_amount: '0',
    target_amount: null,
    policy_number: '',
    institution_name: '',
    expected_return_rate: '',
    maturity_term_months: null,
    maturity_date: null,
    start_date: new Date().toISOString().split('T')[0],
    deadline: null,
    notes: '',
  })

  const [maturityType, setMaturityType] = useState<'months' | 'date'>('months')

  useEffect(() => {
    if (investment) {
      setFormData({
        investment_type: investment.investment_type,
        name: investment.name,
        account: investment.account,
        initial_amount: investment.initial_amount,
        current_amount: investment.current_amount,
        target_amount: investment.target_amount,
        policy_number: investment.policy_number || '',
        institution_name: investment.institution_name || '',
        expected_return_rate: investment.expected_return_rate || '',
        maturity_term_months: investment.maturity_term_months,
        maturity_date: investment.maturity_date,
        start_date: investment.start_date,
        deadline: investment.deadline,
        notes: investment.notes || '',
      })
      // Set maturity type based on existing data
      if (investment.maturity_date) {
        setMaturityType('date')
      } else if (investment.maturity_term_months) {
        setMaturityType('months')
      }
    } else {
      // Reset for new investment
      setFormData({
        investment_type: investmentType,
        name: '',
        account: null,
        initial_amount: '0',
        current_amount: '0',
        target_amount: null,
        policy_number: '',
        institution_name: '',
        expected_return_rate: '',
        maturity_term_months: null,
        maturity_date: null,
        start_date: new Date().toISOString().split('T')[0],
        deadline: null,
        notes: '',
      })
      setMaturityType('months')
    }
  }, [investment, investmentType, open])

  const handleChange = (field: keyof InvestmentFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setLoading(true)

    try {
      // Clean up data based on investment type and maturity type
      const submitData: InvestmentFormData = { ...formData }

      if (formData.investment_type === 'insurance') {
        // For insurance, clear maturity field not being used
        if (maturityType === 'months') {
          submitData.maturity_date = null
        } else {
          submitData.maturity_term_months = null
        }
        // Clear goal-specific fields
        submitData.target_amount = null
        submitData.deadline = null
      } else {
        // For goals, clear insurance-specific fields
        submitData.policy_number = ''
        submitData.institution_name = ''
        submitData.expected_return_rate = ''
        submitData.maturity_term_months = null
        submitData.maturity_date = null
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Error submitting investment:', error)
    } finally {
      setLoading(false)
    }
  }

  const isInsurance = formData.investment_type === 'insurance'
  const isGoal = formData.investment_type === 'goal'

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <Card 
        title={
          <div className="flex items-center gap-3 pb-2 border-b-2 border-emerald-500">
            <span className="text-2xl">{isInsurance ? '🛡️' : '🎯'}</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {investment ? 'Editar Inversión' : `Nueva ${isInsurance ? 'Póliza' : 'Meta'}`}
            </span>
          </div>
        }
        description={isInsurance ? 'Administra tu póliza de seguros' : 'Establece una meta de inversión'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="name"
              label="Nombre"
              value={formData.name}
              onChange={handleChange('name')}
              required
              placeholder={isInsurance ? "Ej: Seguro de Vida, Seguro Médico..." : "Ej: Casa, Auto, Vacaciones..."}
            />

            <Select
              id="account"
              label="Cuenta Asociada"
              value={formData.account || ''}
              onChange={handleChange('account')}
            >
              <option value="">Sin cuenta asociada</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="initial_amount"
              label="Monto Inicial"
              type="number"
              value={formData.initial_amount}
              onChange={handleChange('initial_amount')}
              min="0"
              step="0.01"
              placeholder="0.00"
            />

            <Input
              id="current_amount"
              label="Monto Actual"
              type="number"
              value={formData.current_amount}
              onChange={handleChange('current_amount')}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* Goal-specific fields */}
          {isGoal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="target_amount"
                label="Monto Objetivo"
                type="number"
                value={formData.target_amount || ''}
                onChange={handleChange('target_amount')}
                min="0"
                step="0.01"
                placeholder="0.00"
              />

              <Input
                id="deadline"
                label="Fecha Límite"
                type="date"
                value={formData.deadline || ''}
                onChange={handleChange('deadline')}
              />
            </div>
          )}

          {/* Insurance-specific fields */}
          {isInsurance && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="policy_number"
                  label="Número de Póliza"
                  value={formData.policy_number}
                  onChange={handleChange('policy_number')}
                  placeholder="Ej: POL-123456"
                />

                <Input
                  id="institution_name"
                  label="Institución"
                  value={formData.institution_name}
                  onChange={handleChange('institution_name')}
                  placeholder="Ej: Seguros XYZ"
                />
              </div>

              <Input
                id="expected_return_rate"
                label="Tasa de Retorno Esperada (%)"
                type="number"
                value={formData.expected_return_rate}
                onChange={handleChange('expected_return_rate')}
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
              />

              {/* Maturity Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Vencimiento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMaturityType('months')}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                      maturityType === 'months'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📅 Por Meses
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaturityType('date')}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                      maturityType === 'date'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📆 Por Fecha
                  </button>
                </div>
              </div>

              {/* Maturity Fields */}
              {maturityType === 'months' && (
                <Input
                  id="maturity_term_months"
                  label="Plazo en Meses"
                  type="number"
                  value={formData.maturity_term_months || ''}
                  onChange={handleChange('maturity_term_months')}
                  min="1"
                  max="1200"
                  step="1"
                  placeholder="12"
                />
              )}
              {/* Note: maturity_date for 'date' type is shown with start_date below */}
            </>
          )}

          {/* Start Date and Maturity Date (for insurance with date type) */}
          {isInsurance && maturityType === 'date' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="start_date"
                label="Fecha de Inicio"
                type="date"
                value={formData.start_date}
                onChange={handleChange('start_date')}
                required
              />
              <Input
                id="maturity_date"
                label="Fecha de Vencimiento"
                type="date"
                value={formData.maturity_date || ''}
                onChange={handleChange('maturity_date')}
              />
            </div>
          ) : (
            <Input
              id="start_date"
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={handleChange('start_date')}
              required
            />
          )}

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={handleChange('notes')}
              rows={3}
              placeholder="Detalles adicionales..."
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
            />
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
              {loading ? 'Guardando...' : (investment ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}