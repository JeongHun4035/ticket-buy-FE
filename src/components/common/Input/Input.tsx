import type { InputProps } from '@/types/interfaces/components/input'
import type { ChangeEvent } from 'react'

import './Input.css'

const Input: React.FC<InputProps> = ({
  id,
  label,
  onChange,
  ...props
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value)
  }

  return (
    <div className="common-input">
      {label && (
        <label
          className="common-input__label"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={id}
        className="common-input__field"
        onChange={handleChange}
      />
    </div>
  )
}

export default Input