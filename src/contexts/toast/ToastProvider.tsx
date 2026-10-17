import { useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import Toast from '@/components/common/Toast/Toast'

import { ToastContext } from './ToastContext'

import type { ToastOptions, ToastVariant } from './ToastContext'
import type { ReactNode } from 'react'

interface ToastItem {
  id: number,
  message: string,
  variant: ToastVariant,
  duration: number,
  closing: boolean,
}

const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)
  const dismiss = useCallback((id: number) => {
    setItems(current => current.map(item => item.id === id ? {
      ...item,
      closing: true,
    } : item))
  }, [])
  const remove = useCallback((id: number) => {
    setItems(current => current.filter(item => item.id !== id))
  }, [])
  const toast = useCallback((message: string, options: ToastOptions = {}) => {
    const id = ++nextId.current
    setItems(current => [
      ...current,
      {
        id,
        message,
        variant: options.variant ?? 'info',
        duration: options.duration ?? 3000,
        closing: false,
      },
    ])
    return id
  }, [])
  const context = useMemo(() => ({
    toast,
    dismiss,
  }), [toast, dismiss])

  return (
    <ToastContext.Provider value={context}>
      {children}
      {createPortal(
        <section className="toast-viewport" aria-label="알림">
          {items.map(item => <Toast key={item.id} {...item} onClose={dismiss} onExited={remove} />)}
        </section>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export default ToastProvider
