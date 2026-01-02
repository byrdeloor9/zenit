/**
 * Hook for boolean toggle state
 */

import { useState, useCallback } from 'react'

/**
 * Hook for managing boolean toggle state
 * @param initialValue - Initial boolean value (default: false)
 */
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  return [value, toggle, setValue]
}

