// Toggle component for switches

interface ToggleProps {
  label: string
  description?: string
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  disabled?: boolean
}

export function Toggle({ label, description, enabled, setEnabled, disabled = false }: ToggleProps) {
  return (
    <div 
      onClick={() => !disabled && setEnabled(!enabled)}
      className={`flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="flex-grow flex flex-col">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <span className="text-sm text-gray-500">{description}</span>
        )}
      </span>
      <div
        className={`${
          enabled ? 'bg-indigo-600' : 'bg-gray-200'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
        />
      </div>
    </div>
  )
}
