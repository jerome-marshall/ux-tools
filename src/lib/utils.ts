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

export const scrollToSection = (sectionId: string, offset = 0) => {
  if (typeof window === 'undefined') return

  const section = document.getElementById(sectionId)
  if (section) {
    const yOffset = offset
    const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  } else {
    console.warn(`Section with ID "${sectionId}" not found in the DOM`)
  }
}
