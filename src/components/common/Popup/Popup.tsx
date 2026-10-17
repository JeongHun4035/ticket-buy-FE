import { createPortal } from 'react-dom'
import { IoMdCloseCircle } from 'react-icons/io'

import type { PopupProps } from '@/types/interfaces/components'

import './Popup.css'

const Popup = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
  contentClassName = '',
  style,
  contentStyle,
}: PopupProps) => {
  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      className="popup-overlay"
      onClick={onClose}
    >
      <div
        className={`popup-container popup-${size} ${className}`}
        style={style}
        onClick={event => event.stopPropagation()}
      >
        <div className="popup-header">
          <div className="popup-title">
            {title}
          </div>

          <button
            type="button"
            className="popup-close"
            onClick={onClose}
            aria-label="Close popup"
          >
            <IoMdCloseCircle />
          </button>
        </div>

        <div
          className={`popup-content ${contentClassName}`}
          style={contentStyle}
        >
          {children}
        </div>

        {footer && (
          <div className="popup-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Popup