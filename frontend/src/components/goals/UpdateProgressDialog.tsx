/**
 * UpdateProgressDialog component - Dialog to update goal progress (migrated to Tailwind CSS)
 */

import { useState, useEffect } from 'react'
import { Add, Remove, Edit } from '@mui/icons-material'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import type { Goal } from '../../types'

interface UpdateProgressDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (amount: string) => Promise<void>
  goal: Goal | null
  loading: boolean
}

export function UpdateProgressDialog({
  open,
  onClose,
  onSubmit,
  goal,
  loading,
}: UpdateProgressDialogProps): JSX.Element {
  const [mode, setMode] = useState<'set' | 'add' | 'remove'>('add')
  const [amount, setAmount] = useState<string>('')
  const [deltaAmount, setDeltaAmount] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (goal) {
      setAmount(goal.current_amount)
      setDeltaAmount('')
      setMode('add')
    }
    setError('')
  }, [goal, open])

  const handleSubmit = async (): Promise<void> => {
    if (!goal) return

    let finalAmount = ''
    
    if (mode === 'set') {
      if (!amount || parseFloat(amount) < 0) {
        setError('El monto debe ser mayor o igual a 0')
        return
      }
      finalAmount = amount
    } else {
      if (!deltaAmount || parseFloat(deltaAmount) <= 0) {
        setError('El monto debe ser mayor a 0')
        return
      }
      
      const currentAmount = parseFloat(goal.current_amount)
      const delta = parseFloat(deltaAmount)
      
      if (mode === 'add') {
        finalAmount = (currentAmount + delta).toString()
      } else {
        if (currentAmount - delta < 0) {
          setError('No puedes retirar más de lo que tienes')
          return
        }
        finalAmount = (currentAmount - delta).toString()
      }
    }

    try {
      await onSubmit(finalAmount)
      onClose()
    } catch (err) {
      setError('Error al actualizar el progreso')
      console.error(err)
    }
  }

  const getModeIcon = (): JSX.Element => {
    switch (mode) {
      case 'add':
        return <Add className="text-green-600 dark:text-green-400" />
      case 'remove':
        return <Remove className="text-red-600 dark:text-red-400" />
      default:
        return <Edit className="text-blue-600 dark:text-blue-400" />
    }
  }

  const getModeTitle = (): string => {
    switch (mode) {
      case 'add':
        return 'Agregar Progreso'
      case 'remove':
        return 'Retirar Progreso'
      default:
        return 'Establecer Progreso'
    }
  }

  const getModeDescription = (): string => {
    switch (mode) {
      case 'add':
        return 'Agregar dinero a tu meta'
      case 'remove':
        return 'Retirar dinero de tu meta'
      default:
        return 'Establecer el monto actual de tu meta'
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Card title={
        <div className="flex items-center gap-3">
          {getModeIcon()}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {getModeTitle()}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goal?.name}
            </p>
          </div>
        </div>
      }>
        <div className="space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Modo de Actualización
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('add')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  mode === 'add'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Add className="text-sm" />
                Agregar
              </button>
              <button
                type="button"
                onClick={() => setMode('remove')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  mode === 'remove'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Remove className="text-sm" />
                Retirar
              </button>
              <button
                type="button"
                onClick={() => setMode('set')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  mode === 'set'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Edit className="text-sm" />
                Establecer
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getModeDescription()}
          </p>

          {/* Amount Input */}
          {mode === 'set' ? (
            <Input
              id="amount"
              label="Monto Actual"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          ) : (
            <Input
              id="deltaAmount"
              label={mode === 'add' ? 'Monto a Agregar' : 'Monto a Retirar'}
              type="number"
              value={deltaAmount}
              onChange={(e) => setDeltaAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          )}

          {/* Goal Information */}
          {goal && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">
                Información de la Meta
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Monto Actual:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${parseFloat(goal.current_amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Meta:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${parseFloat(goal.target_amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Progreso:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {goal.progress_percentage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Restante:</span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ${(parseFloat(goal.target_amount) - parseFloat(goal.current_amount)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && <Alert type="error" message={error} />}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (mode === 'set' ? !amount : !deltaAmount)}
            className={mode === 'add' ? 'bg-green-600 hover:bg-green-700' : mode === 'remove' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Actualizando...
              </div>
            ) : (
              'Actualizar Progreso'
            )}
          </Button>
        </div>
      </Card>
    </Modal>
  )
}