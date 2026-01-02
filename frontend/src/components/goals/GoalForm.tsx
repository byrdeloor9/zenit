/**
 * GoalForm component - Create/Edit goal form
 */

import { useState, useEffect } from 'react'
import { EmojiEvents } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { Goal, Account } from '../../types'
import type { GoalFormData } from '../../api/endpoints/goals'

interface GoalFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: GoalFormData) => Promise<void>
  goal?: Goal | null
  accounts: Account[]
  loading: boolean
}

export function GoalForm({
  open,
  onClose,
  onSubmit,
  goal,
  accounts,
  loading,
}: GoalFormProps): JSX.Element {
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    account: null,
    target_amount: '',
    current_amount: '0',
    deadline: null,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({})

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        account: goal.account_id,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline,
      })
    } else {
      setFormData({
        name: '',
        account: null,
        target_amount: '',
        current_amount: '0',
        deadline: null,
      })
    }
    setErrors({})
  }, [goal, open])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'El monto objetivo debe ser mayor a 0'
    }

    const current = parseFloat(formData.current_amount || '0')
    const target = parseFloat(formData.target_amount || '0')
    
    if (current < 0) {
      newErrors.current_amount = 'El monto actual no puede ser negativo'
    }

    if (current > target) {
      newErrors.current_amount = 'El monto actual no puede ser mayor al objetivo'
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

  const handleChange = (field: keyof GoalFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev: GoalFormData) => ({ ...prev, [field]: e.target.value || (field === 'deadline' ? null : '') }))
    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof GoalFormData, string>>) => ({ ...prev, [field]: undefined }))
    }
  }

  // Calculate progress
  const current = parseFloat(formData.current_amount || '0')
  const target = parseFloat(formData.target_amount || '0')
  const progress = target > 0 ? (current / target) * 100 : 0

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Card 
        title={goal ? 'Editar Meta' : 'Nueva Meta'} 
        description="Establece y rastrea tus objetivos financieros"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Input
            id="name"
            label="Nombre de la Meta"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
            placeholder="Ej: Fondo de Emergencia, Vacaciones, Auto Nuevo..."
          />

          {/* Account */}
          <Select
            id="account"
            label="Cuenta Vinculada (opcional)"
            value={formData.account || ''}
            onChange={handleChange('account')}
            error={errors.account}
          >
            <option value="">
              Sin vincular
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} - ${parseFloat(account.balance).toFixed(2)} ({account.currency})
              </option>
            ))}
          </Select>
          {!errors.account && (
            <p className="text-sm text-gray-500 -mt-2">Vincula esta meta a una cuenta para rastrear el dinero comprometido</p>
          )}

          {/* Target Amount */}
          <Input
            id="target_amount"
            label="Monto Objetivo"
            type="number"
            value={formData.target_amount}
            onChange={handleChange('target_amount')}
            error={errors.target_amount}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />

          {/* Current Amount */}
          <Input
            id="current_amount"
            label="Monto Actual"
            type="number"
            value={formData.current_amount}
            onChange={handleChange('current_amount')}
            error={errors.current_amount}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          {!errors.current_amount && (
            <p className="text-sm text-gray-500 -mt-2">Cuánto has ahorrado hasta ahora</p>
          )}

          {/* Progress Preview */}
          {target > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">
                📊 Progreso de la Meta:
              </h4>
              <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-sm text-green-700">
                ${current.toFixed(2)} de ${target.toFixed(2)} ({progress.toFixed(1)}%)
              </p>
              {progress >= 100 && (
                <p className="text-sm font-bold text-green-800 mt-1">
                  🎉 ¡Meta alcanzada!
                </p>
              )}
            </div>
          )}

          {/* Deadline */}
          <Input
            id="deadline"
            label="Fecha Límite (opcional)"
            type="date"
            value={formData.deadline || ''}
            onChange={handleChange('deadline')}
            error={errors.deadline}
          />
          {!errors.deadline && (
            <p className="text-sm text-gray-500 -mt-2">Define una fecha para alcanzar tu meta</p>
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
              {loading ? 'Guardando...' : (goal ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}