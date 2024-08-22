import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalize = (str: string) => {
  if (str.length === 0) {
    return str
  }
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getDateStr = (date: Date | undefined) => {
  if (!date) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
