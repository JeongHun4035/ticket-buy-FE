import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  variant?: ToastVariant,
  duration?: number,
}

export const ToastContext = createContext<{
  toast: (message: string, options?: ToastOptions) => number,
  dismiss: (id: number) => void,
} | null>(null)
