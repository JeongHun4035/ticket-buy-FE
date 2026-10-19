import { createContext } from 'react'

import type { AuthContextValue } from '@/types/interfaces/contexts/auth'

export type { AuthContextValue } from '@/types/interfaces/contexts/auth'

export const AuthContext = createContext<AuthContextValue | null>(null)
