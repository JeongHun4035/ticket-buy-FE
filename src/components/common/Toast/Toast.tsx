import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi'

import type { ToastVariant } from '@/contexts/toast/ToastContext'

import './Toast.css'

interface ToastProps {
  id: number,
  message: string,
  variant: ToastVariant,
  duration: number,
  closing: boolean,
  onClose: (id: number) => void,
  onExited: (id: number) => void,
}

const Toast = ({ id, message, variant, duration, closing, onClose, onExited }: ToastProps) => {
  const { t } = useTranslation()
  const Icon = variant === 'success' ? FiCheckCircle : variant === 'error' ? FiAlertCircle : FiInfo
  useEffect(() => {
    if (duration <= 0 || closing) return
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [
    id,
    duration,
    onClose,
    closing,
  ])

  useEffect(() => {
    if (!closing) return
    // Ensure removal even if animationend is interrupted or animations are disabled.
    const timer = setTimeout(() => onExited(id), 250)
    return () => clearTimeout(timer)
  }, [
    closing,
    id,
    onExited,
  ])

  return (
    <div
      className={`common-toast common-toast--${variant}${closing ? ' common-toast--closing' : ''}`}
      onAnimationEnd={event => {
        if (event.target === event.currentTarget && event.animationName === 'toast-exit' && closing) onExited(id)
      }}
    >
      <Icon className="common-toast__icon" aria-hidden="true" />
      <span className="common-toast__message" role={variant === 'error' ? 'alert' : 'status'}>{message}</span>
      <button type="button" aria-label={t('닫기')} disabled={closing} onClick={() => onClose(id)}><FiX aria-hidden="true" /></button>
    </div>
  )
}

export default Toast
