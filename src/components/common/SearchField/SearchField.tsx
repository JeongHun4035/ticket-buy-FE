import { useTranslation } from 'react-i18next'
import { FiSearch } from 'react-icons/fi'

import type { SearchFieldProps } from '@/types/interfaces/components/searchField'

import './SearchField.css'

const SearchField = ({ value, onChange, onSearch, label, placeholder, className = '' }: SearchFieldProps) => {
  const { t } = useTranslation()

  return (
    <form
      className={`search-field ${className}`}
      role="search"
      aria-label={label}
      onSubmit={event => {
        event.preventDefault()
        onSearch()
      }}
      onKeyDown={event => {
        if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
      }}
    >
      <FiSearch aria-hidden="true" />
      <input
        maxLength={100}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      <button type="submit">{t('검색')}</button>
    </form>
  )
}

export default SearchField
