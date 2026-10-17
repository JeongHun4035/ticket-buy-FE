import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import useAuth from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ROUTE_PATHS } from '@/routes/route'

const RequireAdmin = () => {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const notified = useRef<string | null>(null)
  const allowed = user?.role === 'ADMIN'

  useEffect(() => {
    if (loading || !user || allowed || notified.current === location.key) return
    notified.current = location.key
    toast(t('ACCESS_DENIED'), { variant: 'error' })
    void navigate(ROUTE_PATHS.MAIN, { replace: true })
  }, [
    loading,
    user,
    allowed,
    location.key,
    navigate,
    t,
    toast,
  ])

  return allowed ? <Outlet /> : null
}

export default RequireAdmin
