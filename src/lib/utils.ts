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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => void>(cb: T, delay: number): T => {
  let timeoutId: number | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        cb(...args)
        timeoutId = null
      }, delay)
    }
  }) as T
}
