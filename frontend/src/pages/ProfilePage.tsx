/**
 * Profile Page - View and edit user profile (Redesigned with Tailwind CSS)
 */

import { useState, FormEvent } from 'react'
import { Person as PersonIcon, Lock as LockIcon, Logout as LogoutIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { Card } from '../components/ui/Card'
import type { UpdateProfileData, ChangePasswordData } from '../types'

export function ProfilePage(): JSX.Element {
  const { user, logout, updateUser, changePassword } = useAuth()
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
  })
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)
    setProfileLoading(true)

    try {
      await updateUser(profileData)
      setProfileSuccess('Perfil actualizado exitosamente')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil'
      setProfileError(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validate passwords match
    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setPasswordError('Las contraseñas nuevas no coinciden')
      return
    }

    setPasswordLoading(true)

    try {
      await changePassword(passwordData)
      setPasswordSuccess('Contraseña actualizada exitosamente')
      // Clear password fields
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      })
    } catch (err: unknown) {
      let errorMessage = 'Error al cambiar contraseña'
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: Record<string, unknown> } }).response
        if (response?.data) {
          const errors = response.data
          if (typeof errors === 'object') {
            errorMessage = Object.values(errors).flat().join(', ')
          }
        }
      }
      
      setPasswordError(errorMessage)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleProfileChange = (field: keyof UpdateProfileData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setProfileData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handlePasswordChange = (field: keyof ChangePasswordData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Profile Information Section */}
        <Card title="Información Personal" className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <PersonIcon className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Información Personal
            </h2>
          </div>

          {profileSuccess && (
            <div className="mb-6">
              <Alert type="success" message={profileSuccess} />
            </div>
          )}

          {profileError && (
            <div className="mb-6">
              <Alert type="error" message={profileError} />
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="first_name"
                label="Nombre"
                value={profileData.first_name}
                onChange={handleProfileChange('first_name')}
                required
              />
              <Input
                id="last_name"
                label="Apellido"
                value={profileData.last_name}
                onChange={handleProfileChange('last_name')}
                required
              />
            </div>

            <Input
              id="email"
              label="Email"
              type="email"
              value={profileData.email}
              onChange={handleProfileChange('email')}
              required
            />

            <div>
              <Input
                id="username"
                label="Nombre de usuario"
                value={user.username}
                disabled
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">El nombre de usuario no se puede cambiar</p>
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="w-full sm:w-auto"
            >
              {profileLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </form>
        </Card>

        {/* Change Password Section */}
        <Card title="Cambiar Contraseña">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <LockIcon className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Cambiar Contraseña
            </h2>
          </div>

          {passwordSuccess && (
            <div className="mb-6">
              <Alert type="success" message={passwordSuccess} />
            </div>
          )}

          {passwordError && (
            <div className="mb-6">
              <Alert type="error" message={passwordError} />
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <Input
              id="old_password"
              label="Contraseña Actual"
              type="password"
              value={passwordData.old_password}
              onChange={handlePasswordChange('old_password')}
              required
            />

            <div>
              <Input
                id="new_password"
                label="Nueva Contraseña"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange('new_password')}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">Mínimo 8 caracteres</p>
            </div>

            <Input
              id="new_password_confirm"
              label="Confirmar Nueva Contraseña"
              type="password"
              value={passwordData.new_password_confirm}
              onChange={handlePasswordChange('new_password_confirm')}
              required
            />

            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full sm:w-auto"
            >
              {passwordLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Cambiando...
                </div>
              ) : (
                'Cambiar Contraseña'
              )}
            </Button>
          </form>
        </Card>

        {/* Logout Section */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Cerrar Sesión
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Salir de tu cuenta en este dispositivo
              </p>
            </div>
            <Button
              variant="danger"
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogoutIcon />
              Cerrar Sesión
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

