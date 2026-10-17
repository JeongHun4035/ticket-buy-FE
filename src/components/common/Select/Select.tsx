import { useId } from 'react'



import type { SelectProps } from '@/types/interfaces/components'

import './Select.css'





const Select = ({ id, label, options, placeholder, onChange, className = '', ...props }: SelectProps) => {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <div className={`common-select ${className}`}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <div className="common-select__control">
        <select {...props} id={selectId} onChange={event => onChange?.(event.target.value)}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
        <svg className="common-select__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  )
}

export default Select
