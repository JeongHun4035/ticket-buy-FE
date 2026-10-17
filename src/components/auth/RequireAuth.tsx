import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import useAuth from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { ROUTE_PATHS } from '@/routes/route'

const RequireAuth = () => {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const notifiedFor = useRef<string | null>(null)

  useEffect(() => {
    if (loading || user || notifiedFor.current === location.key) return
    notifiedFor.current = location.key
    toast(t('로그인이 필요합니다.'), { variant: 'info' })
    void navigate(ROUTE_PATHS.SIGN_IN, {
      replace: true,
      state: { from: `${location.pathname}${location.search}${location.hash}` },
    })
  }, [
    loading,
    user,
    location.key,
    location.pathname,
    location.search,
    location.hash,
    navigate,
    t,
    toast,
  ])

  if (loading) return <p role="status">{t('불러오는 중')}</p>
  return user ? <Outlet /> : null
}

export default RequireAuth
