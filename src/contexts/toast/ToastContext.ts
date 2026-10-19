import { createContext } from 'react'

import type { ToastContextValue } from '@/types/interfaces/contexts/toast'

export type { ToastVariant, ToastOptions, ToastContextValue } from '@/types/interfaces/contexts/toast'

export const ToastContext = createContext<ToastContextValue | null>(null)
