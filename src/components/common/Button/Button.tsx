
import './Button.css'
import type { ButtonProps  } from '@/types/interfaces/components'

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const buttonClassName = [
    'common-button',
    `common-button-${variant}`,
    `common-button-${size}`,
    fullWidth && 'common-button-full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      type={type}
      className={buttonClassName}
    >
      {children}
    </button>
  )
}

export default Button