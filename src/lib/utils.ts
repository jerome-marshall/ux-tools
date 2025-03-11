import { clsx, type ClassValue } from 'clsx'
import { v4 as uuid } from 'uuid'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateId = () => {
  return uuid()
}

// is Valid UUID - v4
export const isValidUUID = (uuid: string) => {
  return /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(
    uuid
  )
}
