/**
 * TransactionTableView - Table view with date grouping
 */

import { useState, useRef, useEffect } from 'react'
import { MoreVert, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { formatCurrency } from '../../utils/formatters'
import type { Transaction } from '../../types'

interface TransactionGroup {
    key: string
    label: string
    count: number
    transactions: Transaction[]
}

interface TransactionTableViewProps {
    groups: TransactionGroup[]
    compact?: boolean
    onEdit: (transaction: Transaction) => void
    onDelete: (id: number) => void
}

export function TransactionTableView({
    groups,
    compact = false,
    onEdit,
    onDelete
}: TransactionTableViewProps) {
    if (groups.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No se encontraron transacciones
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Intenta cambiar los filtros para ver más resultados
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.key} className="space-y-2">
                    {/* Group Header */}
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            📅 {group.label}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {group.count} {group.count === 1 ? 'transacción' : 'transacciones'}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <th className="px-4 py-2 text-left font-semibold">Descripción</th>
                                        {!compact && <th className="px-4 py-2 text-left font-semibold">Cuenta</th>}
                                        <th className="px-4 py-2 text-left font-semibold">Categoría</th>
                                        <th className="px-4 py-2 text-right font-semibold">Monto</th>
                                        <th className="px-4 py-2 w-[140px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {group.transactions.map((tx) => (
                                        <TransactionTableRow
                                            key={tx.id}
                                            transaction={tx}
                                            compact={compact}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

interface TransactionTableRowProps {
    transaction: Transaction
    compact?: boolean
    onEdit: (transaction: Transaction) => void
    onDelete: (id: number) => void
}

function TransactionTableRow({ transaction: tx, compact, onEdit, onDelete }: TransactionTableRowProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false)
            }
        }

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [menuOpen])

    // Get category icon from API or use fallback
    const getCategoryIcon = () => {
        // Use category_icon from API if available
        if (tx.category_icon) {
            return tx.category_icon
        }
        // Fallback to type-based arrow
        return tx.type === 'Income' ? '↗️' : '↘️'
    }

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 group transition-colors">
            {/* Descripción + Icono */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${tx.type === 'Income'
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                        {getCategoryIcon()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tx.description || 'Sin descripción'}
                    </span>
                </div>
            </td>

            {/* Cuenta */}
            {!compact && (
                <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tx.account_name}
                    </span>
                </td>
            )}

            {/* Categoría */}
            <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${tx.type === 'Income'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                    {tx.category_name || 'Sin categoría'}
                </span>
            </td>

            {/* Monto */}
            <td className="px-4 py-3 text-right">
                <span className={`font-bold ${tx.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                    {tx.type === 'Income' ? '+' : '−'}{formatCurrency(tx.amount)}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3 relative w-[120px]">
                <div ref={menuRef} className="relative h-8 flex items-center justify-end overflow-hidden">
                    {/* Trigger Button (3 dots) - slides out or fades when actions show */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)} // reusing menuOpen as 'showActions' based on previous variable name, but logic changes
                        className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all absolute right-0 z-10 ${menuOpen ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'
                            }`}
                        title="Opciones"
                    >
                        <MoreVert className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Sliding Action Buttons */}
                    <div
                        className={`flex items-center gap-2 transition-all duration-300 ease-out absolute right-0 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
                            }`}
                    >
                        {/* Cancel/Close Button - optional, but clicking 3 dots again is hard if it's gone. 
                            Users can click outside? Or we add a close button? 
                            The BudgetCard uses 'showActions' toggle. 
                            Here 3 dots moves away. Let's add a "Close" (X) or just let clicking Edit/Delete work.
                            Actually, usually clicking outside closes it. 
                            Let's keep it simple: Edit and Delete buttons.
                            To close without action: click outside (need ClickAwayListener) or maybe render an overlay. 
                            
                            Let's stick to the BudgetCard logic:
                            BudgetCard layout:
                            - 3 dots not present in budget card desktop, it just shows on click? No, Budget card has no dots on desktop, just click card?
                            "onClick={() => setShowActions(!showActions)}" on the wrapper.
                            
                            Here we have a table row. 
                            Let's make the Close button appearing where the 3 dots was?
                        */}

                        <button
                            onClick={() => setMenuOpen(false)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 mr-1"
                            title="Cerrar"
                        >
                            <span className="text-lg leading-none">&times;</span>
                        </button>

                        <button
                            onClick={() => {
                                onEdit(tx)
                                setMenuOpen(false)
                            }}
                            className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors shadow-sm"
                            title="Editar"
                        >
                            <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                onDelete(tx.id)
                                setMenuOpen(false)
                            }}
                            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors shadow-sm"
                            title="Eliminar"
                        >
                            <DeleteIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    )
}
