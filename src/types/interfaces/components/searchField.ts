export interface SearchFieldProps {
  value: string,
  onChange: (value: string) => void,
  onSearch: () => void,
  label: string,
  placeholder: string,
  className?: string,
}
