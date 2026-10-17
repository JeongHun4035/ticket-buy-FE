import './Header.css'

import { BsSunFill } from 'react-icons/bs'
import { FaMoon } from 'react-icons/fa'

import useTheme from '@/hooks/useTheme'

import type { HeaderItemProps } from '@/types/interfaces/layouts'

const HeaderItem: React.FC = () => {
  const headerItems: HeaderItemProps[] = [
    {
      id: 1,
      name: 'Home',
    },
    {
      id: 2,
      name: 'About',
    },
    {
      id: 3,
      name: 'Contact',
    },
  ]

  return (
    <div className="header-items">
      {headerItems.map(item => (
        <div
          className="header-item"
          key={item.id}
          onClick={() => console.log(`Clicked on ${item.name}`)}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-thumb">
        {theme === 'light' ? <BsSunFill /> : <FaMoon />}
      </span>
    </button>
  )
}

const LayoutHeader: React.FC = () => {
  return (
    <header className="header-area">
      <HeaderItem />

      <ThemeToggle />
    </header>
  )
}

export default LayoutHeader