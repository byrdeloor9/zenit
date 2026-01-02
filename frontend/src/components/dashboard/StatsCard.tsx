/**
 * StatsCard component - Redesigned with Tailwind CSS
 */

interface StatsCardProps {
  title: string
  value: string
  icon: string
  gradient: string
  accentColor: string
}

export function StatsCard({ 
  title, 
  value, 
  icon,
  gradient,
}: StatsCardProps): JSX.Element {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-300 group-hover:scale-110"
        style={{ 
          background: gradient,
          transform: 'translate(30%, -30%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
            {title}
          </p>
          <span className="text-2xl">{icon}</span>
        </div>
        
        <h3 
          className="text-2xl font-bold mb-1 tracking-tight"
          style={{
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {value}
        </h3>
      </div>
    </div>
  )
}


