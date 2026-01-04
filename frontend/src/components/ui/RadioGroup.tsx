/**
 * RadioGroup - Radio button group component
 */

interface RadioOption {
    value: string
    label: string
}

interface RadioGroupProps {
    value: string
    onChange: (value: string) => void
    options: RadioOption[]
    name?: string
    className?: string
}

export function RadioGroup({
    value,
    onChange,
    options,
    name = 'radio-group',
    className = ''
}: RadioGroupProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {options.map((option) => (
                <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        {option.label}
                    </span>
                </label>
            ))}
        </div>
    )
}
