import type { ChangeEvent, InputHTMLAttributes } from 'react'

import './Input.css'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string,
  onChange?: (value: string) => void,
}

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