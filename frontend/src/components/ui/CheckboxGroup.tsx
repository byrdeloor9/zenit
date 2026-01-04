/**
 * CheckboxGroup - Checkbox group component for multi-select
 */

interface CheckboxOption {
    value: string | number
    label: string
}

interface CheckboxGroupProps {
    value: Array<string | number>
    onChange: (value: Array<string | number>) => void
    options: CheckboxOption[]
    className?: string
}

export function CheckboxGroup({
    value,
    onChange,
    options,
    className = ''
}: CheckboxGroupProps) {
    const handleToggle = (optionValue: string | number) => {
        if (value.includes(optionValue)) {
            onChange(value.filter(v => v !== optionValue))
        } else {
            onChange([...value, optionValue])
        }
    }

    return (
        <div className={`space-y-2 max-h-48 overflow-y-auto ${className}`}>
            {options.map((option) => (
                <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <input
                        type="checkbox"
                        checked={value.includes(option.value)}
                        onChange={() => handleToggle(option.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 truncate">
                        {option.label}
                    </span>
                </label>
            ))}
        </div>
    )
}
