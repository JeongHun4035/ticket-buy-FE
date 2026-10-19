import type { ApiUser } from '../api/users'

export interface AuthContextValue {
  user: ApiUser | null,
  loading: boolean,
  signIn: (username: string, password: string) => Promise<void>,
  signOut: () => Promise<void>,
}
