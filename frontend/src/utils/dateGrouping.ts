/**
 * Date grouping utilities for transactions
 */

export function getGroupKey(date: string): string {
    const txDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const txDateNormalized = new Date(txDate)
    txDateNormalized.setHours(0, 0, 0, 0)

    // Hoy
    if (txDateNormalized.getTime() === today.getTime()) {
        return 'today'
    }

    // Ayer
    if (txDateNormalized.getTime() === yesterday.getTime()) {
        return 'yesterday'
    }

    // Esta semana (últimos 7 días)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    if (txDateNormalized >= weekAgo) {
        return 'this-week'
    }

    // Por mes (YYYY-MM)
    return txDate.toISOString().slice(0, 7)
}

export function getGroupLabel(key: string): string {
    if (key === 'today') {
        const today = new Date()
        return `HOY - ${formatLongDate(today)}`
    }

    if (key === 'yesterday') {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return `AYER - ${formatLongDate(yesterday)}`
    }

    if (key === 'this-week') {
        return 'ESTA SEMANA'
    }

    // Formato mes (YYYY-MM)
    const [year, month] = key.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric'
    }).toUpperCase()
}

function formatLongDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}
