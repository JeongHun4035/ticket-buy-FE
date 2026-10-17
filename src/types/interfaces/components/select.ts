import type { SelectHTMLAttributes } from 'react'

export interface SelectOption {
  value: string | number,
  label: string,
  disabled?: boolean,
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'children' | 'multiple' | 'value' | 'defaultValue'> {
  value?: string | number,
  defaultValue?: string | number,
  options: readonly SelectOption[],
  label?: string,
  placeholder?: string,
  onChange?: (value: string) => void,
}
