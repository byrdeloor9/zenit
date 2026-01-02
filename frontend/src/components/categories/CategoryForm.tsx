/**
 * CategoryForm component - Create/Edit category form
 */

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Category as CategoryIcon } from '@mui/icons-material'
import { IconPicker } from './IconPicker'
import { Modal } from '../ui/Modal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useFormValidation, commonValidators } from '../../hooks/useFormValidation'
import type { Category } from '../../types'
import type { CategoryFormData } from '../../api/endpoints/categories'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  category?: Category | null
  loading: boolean
}

export function CategoryForm({
  open,
  onClose,
  onSubmit,
  category,
  loading,
}: CategoryFormProps): JSX.Element {
  const initialValues: CategoryFormData = {
    name: '',
    type: 'Expense',
    icon: null,
  }

  const validationRules = {
    name: commonValidators.required,
  }

  const {
    formData,
    errors,
    setFormData,
    handleChange,
    validateForm,
    resetForm,
  } = useFormValidation(initialValues, validationRules)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
      })
    } else {
      setFormData({
        name: '',
        type: 'Expense',
        icon: null,
      })
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) return

    await onSubmit(formData)
    onClose()
  }

  const handleTypeChange = (newType: 'Income' | 'Expense'): void => {
    setFormData((prev: CategoryFormData) => ({ ...prev, type: newType }))
  }

  const handleIconChange = (icon: string): void => {
    setFormData((prev: CategoryFormData) => ({ ...prev, icon }))
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Card 
        title={category ? 'Editar Categoría' : 'Nueva Categoría'} 
        description="Organiza tus transacciones creando categorías personalizadas"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Input
            id="name"
            label="Nombre de la Categoría"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
            placeholder="Ej: Salario, Groceries, Rent..."
          />

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Categoría
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('Income')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'Income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="mr-2" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('Expense')}
                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'Expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingDown className="mr-2" />
                Gasto
              </button>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Icono de la Categoría
            </label>
            <IconPicker value={formData.icon} onChange={handleIconChange} />
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
              {loading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  )
}