import type { ToastVariant } from '../contexts/toast'

export interface ToastProps {
  id: number,
  message: string,
  variant: ToastVariant,
  duration: number,
  closing: boolean,
  onClose: (id: number) => void,
  onExited: (id: number) => void,
}
