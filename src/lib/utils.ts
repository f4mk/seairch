import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const applyDarkClass = (target: HTMLElement) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  try {
    target.classList.toggle('dark', media.matches)
    media.addEventListener('change', (e) => {
      target.classList.toggle('dark', e.matches)
    })
  } catch (error) {
    console.error('Error applying dark class', error)
  }
}
