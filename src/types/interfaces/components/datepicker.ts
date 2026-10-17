export interface DatePickerProps {
  value: string,
  onChange: (value: string) => void,
  id?: string,
  name?: string,
  label?: string,
  disabled?: boolean,
  min?: string,
  max?: string,
}
