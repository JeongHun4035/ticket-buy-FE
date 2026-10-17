import { useEffect, useState } from 'react'

import { hasKnownSession, login, logout, refreshSession, subscribeSession } from '@/api/client'
import { getCurrentUser } from '@/api/ticket'

import { AuthContext } from './AuthContext'

import type { ApiUser } from '@/types/interfaces/api/ticket'
import type { ReactNode } from 'react'

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    const unsubscribe = subscribeSession(session => {
      if (active) setUser(session?.user ?? null)
    })
    if (!hasKnownSession()) {
      setLoading(false)
      return unsubscribe
    }
    void refreshSession().then(() => getCurrentUser())
      .then(current => {
        if (active) setUser(current)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false; unsubscribe()
    }
  }, [])
  const signIn = async (username: string, password: string) => {
    await login(username, password)
    setUser(await getCurrentUser())
  }
  const signOut = async () => {
    await logout(); setUser(null)
  }
  return <AuthContext.Provider value={{
    user,
    loading,
    signIn,
    signOut,
  }}>{children}</AuthContext.Provider>
}
export default AuthProvider
