import { createContext } from 'react'

import type { ThemeContextValue } from '@/types/interfaces/contexts/theme'

export type { Theme, ThemeContextValue } from '@/types/interfaces/contexts/theme'

export const ThemeContext = createContext<ThemeContextValue | null>(null)
