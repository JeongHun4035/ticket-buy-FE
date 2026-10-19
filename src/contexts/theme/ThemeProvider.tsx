import {
  useEffect,
  useState,
} from 'react'

import {
  ThemeContext,
  type Theme,
} from './ThemeContext'

import type { ProviderProps } from '@/types/interfaces/contexts/provider'

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return 'light'
}

const ThemeProvider: React.FC<ProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider