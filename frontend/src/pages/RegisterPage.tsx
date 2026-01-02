/**
 * Register Page - Redesigned with Tailwind CSS
 */

import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PersonAdd as RegisterIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import type { RegisterData } from '../types'

export function RegisterPage(): JSX.Element {
  const { register } = useAuth()
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      await register(formData)
    } catch (err: unknown) {
      let errorMessage = 'Error al registrar usuario'

      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: Record<string, unknown> } }).response
        if (response?.data) {
          // Handle validation errors from backend
          const errors = response.data
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ')
          }
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full my-auto animate-fade-in relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <RegisterIcon className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Crear Cuenta
            </h1>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert type="error" message={error} className="mb-4" />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="Nombre"
                value={formData.first_name}
                onChange={handleChange('first_name')}
                required
                autoComplete="given-name"
              />
              <Input
                id="last_name"
                label="Apellido"
                value={formData.last_name}
                onChange={handleChange('last_name')}
                required
                autoComplete="family-name"
              />
            </div>

            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              autoComplete="new-password"
              helperText="Mínimo 8 caracteres"
            />

            <Input
              id="password_confirm"
              label="Confirmar Contraseña"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange('password_confirm')}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registrando...
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  <RegisterIcon className="mr-2" />
                  Registrarse
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold transition-colors hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

