import { createPortal } from 'react-dom'
import { IoMdCloseCircle } from 'react-icons/io'

import Button from '@/components/common/Button/Button'

import type { ConfirmProps } from '@/types/interfaces/components'
import './Confirm.css'

const Confirm = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  contents,
  footer,
  className = '',
  contentClassName = '',
  style,
  contentStyle,
}: ConfirmProps) => {
  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      className="confirm-overlay"
      onClick={onClose}
    >
      <div
        className={`confirm-container ${className}`}
        style={style}
        onClick={event => event.stopPropagation()}
      >
        <div className="confirm-header">
          <div className="confirm-title">
            {title}
          </div>

          <button
            type="button"
            className="confirm-close"
            onClick={onClose}
            aria-label="Close popup"
          >
            <IoMdCloseCircle />
          </button>
        </div>

        <div
          className={`confirm-content ${contentClassName}`}
          style={contentStyle}
        >
          {contents}
        </div>

        <div className="confirm-footer">
          {footer ? (
            footer
          ) : (
            <div className="confirm-footer-actions">
              <Button
                size="sm"
                onClick={onConfirm}
              >
                Confirm
              </Button>

              <Button
                size="sm"
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default Confirm
