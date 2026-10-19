import type { ToastVariant } from './toast'

export interface ToastItem {
  id: number,
  message: string,
  variant: ToastVariant,
  duration: number,
  closing: boolean,
}
