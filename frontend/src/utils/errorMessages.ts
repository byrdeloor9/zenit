/**
 * Error Message Translation Utility
 * Converts technical API errors into user-friendly Spanish messages
 */

import { AxiosError } from 'axios'

interface ApiErrorResponse {
    detail?: string
    message?: string
    error?: string
    email?: string[]
    password?: string[]
    non_field_errors?: string[]
}

/**
 * Translates API errors to user-friendly Spanish messages
 */
export function getErrorMessage(error: unknown): string {
    // Handle Axios errors
    if (error instanceof Error && 'isAxiosError' in error) {
        const axiosError = error as AxiosError<ApiErrorResponse>

        // Network errors (no response from server)
        if (!axiosError.response) {
            if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
                return 'La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.'
            }
            return 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
        }

        const { status, data } = axiosError.response

        // Extract error message from response
        const errorDetail = data?.detail || data?.message || data?.error

        // Handle specific status codes
        switch (status) {
            case 400: // Bad Request
                // Check for specific field errors
                if (data?.email?.[0]) {
                    if (data.email[0].includes('already exists')) {
                        return 'Este email ya está registrado. Intenta iniciar sesión o usa otro email.'
                    }
                    return data.email[0]
                }
                if (data?.password?.[0]) {
                    return data.password[0]
                }
                if (data?.non_field_errors?.[0]) {
                    return data.non_field_errors[0]
                }
                return errorDetail || 'Los datos ingresados no son válidos. Verifica e intenta de nuevo.'

            case 401: // Unauthorized
                if (errorDetail?.toLowerCase().includes('credentials')) {
                    return 'Email o contraseña incorrectos. Verifica tus datos e intenta de nuevo.'
                }
                if (errorDetail?.toLowerCase().includes('not found')) {
                    return 'No existe una cuenta con este email. ¿Quieres registrarte?'
                }
                if (errorDetail?.toLowerCase().includes('inactive')) {
                    return 'Tu cuenta está inactiva. Contacta al soporte para más información.'
                }
                return 'No tienes autorización para acceder. Verifica tus credenciales.'

            case 403: // Forbidden
                return 'No tienes permisos para realizar esta acción.'

            case 404: // Not Found
                return 'El recurso solicitado no existe.'

            case 409: // Conflict
                return 'Ya existe un registro con estos datos.'

            case 422: // Unprocessable Entity
                return 'Los datos proporcionados no son válidos. Verifica e intenta de nuevo.'

            case 429: // Too Many Requests
                return 'Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.'

            case 500: // Internal Server Error
                return 'Error en el servidor. Por favor, intenta más tarde.'

            case 502: // Bad Gateway
            case 503: // Service Unavailable
            case 504: // Gateway Timeout
                return 'El servidor no está disponible en este momento. Intenta más tarde.'

            default:
                return errorDetail || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
        }
    }

    // Handle regular Error objects
    if (error instanceof Error) {
        return error.message
    }

    // Fallback for unknown errors
    return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
}

/**
 * Checks if an error is a network error (no server response)
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof Error && 'isAxiosError' in error) {
        const axiosError = error as AxiosError
        return !axiosError.response
    }
    return false
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof Error && 'isAxiosError' in error) {
        const axiosError = error as AxiosError
        return axiosError.response?.status === 401
    }
    return false
}
