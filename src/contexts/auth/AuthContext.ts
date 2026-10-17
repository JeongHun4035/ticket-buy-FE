import { createContext } from 'react'

import type { ApiUser } from '@/types/interfaces/api/ticket'

export interface AuthContextValue {
  user: ApiUser | null,
  loading: boolean,
  signIn: (username: string, password: string) => Promise<void>,
  signOut: () => Promise<void>,
}
export const AuthContext = createContext<AuthContextValue | null>(null)
