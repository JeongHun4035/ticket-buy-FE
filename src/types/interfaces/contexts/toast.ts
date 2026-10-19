export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  variant?: ToastVariant,
  duration?: number,
}

export interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => number,
  dismiss: (id: number) => void,
}
