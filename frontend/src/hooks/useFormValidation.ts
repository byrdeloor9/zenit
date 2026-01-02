/**
 * useFormValidation - Hook genérico para manejo de formularios
 * TypeScript strict mode compatible con validación tipada
 */

import { useState, useCallback, useMemo } from 'react'

export type ValidationRule<T> = {
  [K in keyof T]?: (value: T[K], formData: T) => string | undefined
}

export type FormErrors<T> = Partial<Record<keyof T, string>>

export interface UseFormValidationReturn<T> {
  formData: T
  errors: FormErrors<T>
  isValid: boolean
  setFormData: React.Dispatch<React.SetStateAction<T>>
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void
  clearFieldError: <K extends keyof T>(field: K) => void
  clearAllErrors: () => void
  validateField: <K extends keyof T>(field: K) => boolean
  validateForm: () => boolean
  handleChange: <K extends keyof T>(field: K) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  resetForm: (newData?: Partial<T>) => void
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRule<T> = {}
): UseFormValidationReturn<T> {
  const [formData, setFormData] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})

  // Validar un campo específico
  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const rule = validationRules[field]
      if (!rule) return true

      const error = rule(formData[field], formData)
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }))
      return !error
    },
    [formData, validationRules]
  )

  // Validar todo el formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {}
    let isValid = true

    Object.keys(validationRules).forEach(key => {
      const field = key as keyof T
      const rule = validationRules[field]
      if (rule) {
        const error = rule(formData[field], formData)
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [formData, validationRules])

  // Establecer valor de un campo
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]): void => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Limpiar error del campo si existe
      setErrors(prev => {
        if (prev[field]) {
          return { ...prev, [field]: undefined }
        }
        return prev
      })
    },
    []
  )

  // Establecer error de un campo
  const setFieldError = useCallback(
    <K extends keyof T>(field: K, error: string | undefined): void => {
      setErrors(prev => ({ ...prev, [field]: error }))
    },
    []
  )

  // Limpiar error de un campo
  const clearFieldError = useCallback(
    <K extends keyof T>(field: K): void => {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    },
    []
  )

  // Limpiar todos los errores
  const clearAllErrors = useCallback((): void => {
    setErrors({})
  }, [])

  // Handler genérico para cambios en campos
  const handleChange = useCallback(
    <K extends keyof T>(field: K) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
      const value = event.target.value as T[K]
      setFieldValue(field, value)
    },
    [setFieldValue]
  )

  // Resetear formulario
  const resetForm = useCallback(
    (newData?: Partial<T>): void => {
      setFormData(newData ? { ...initialValues, ...newData } : initialValues)
      setErrors({})
    },
    [initialValues]
  )

  // Verificar si el formulario es válido
  const isValid = useMemo((): boolean => {
    return Object.keys(errors).length === 0 && Object.values(errors).every(error => !error)
  }, [errors])

  return {
    formData,
    errors,
    isValid,
    setFormData,
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    validateField,
    validateForm,
    handleChange,
    resetForm,
  }
}

// Funciones de validación comunes
export const commonValidators = {
  required: <T>(value: T): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return 'Este campo es requerido'
    }
    return undefined
  },

  minLength: (min: number) => <T extends string>(value: T): string | undefined => {
    if (value && value.length < min) {
      return `Debe tener al menos ${min} caracteres`
    }
    return undefined
  },

  maxLength: (max: number) => <T extends string>(value: T): string | undefined => {
    if (value && value.length > max) {
      return `No puede tener más de ${max} caracteres`
    }
    return undefined
  },

  email: <T extends string>(value: T): string | undefined => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Ingresa un email válido'
    }
    return undefined
  },

  min: (min: number) => (value: number | string): string | undefined => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (!isNaN(num) && num < min) {
      return `El valor debe ser mayor o igual a ${min}`
    }
    return undefined
  },

  max: (max: number) => (value: number | string): string | undefined => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (!isNaN(num) && num > max) {
      return `El valor debe ser menor o igual a ${max}`
    }
    return undefined
  },

  positive: (value: number | string): string | undefined => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (!isNaN(num) && num <= 0) {
      return 'El valor debe ser mayor a 0'
    }
    return undefined
  },

  number: (value: number | string): string | undefined => {
    if (value && isNaN(typeof value === 'string' ? parseFloat(value) : value)) {
      return 'Debe ser un número válido'
    }
    return undefined
  },

  date: (value: string): string | undefined => {
    if (value && isNaN(Date.parse(value))) {
      return 'Ingresa una fecha válida'
    }
    return undefined
  },

  dateAfter: (compareDate: string) => (value: string): string | undefined => {
    if (value && compareDate && new Date(value) <= new Date(compareDate)) {
      return 'La fecha debe ser posterior a la fecha de referencia'
    }
    return undefined
  },
}
