import { useContext } from 'react'

import { AuthContext } from '@/contexts/auth/AuthContext'

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthProvider is required')
  return context
}
export default useAuth
