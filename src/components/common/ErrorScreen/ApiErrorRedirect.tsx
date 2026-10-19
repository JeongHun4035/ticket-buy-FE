import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { API_ERROR_EVENT } from '@/api/errorNavigation'

const ApiErrorRedirect = () => {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    let redirected = false
    const handleError = (event: Event) => {
      if (redirected || location.pathname.startsWith('/error/')) return
      const { status, retryAt } = (event as CustomEvent<{
        status: number,
        retryAt: number,
      }>).detail
      redirected = true
      void navigate(`/error/${status}`, {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
          retryAt,
        },
      })
    }
    window.addEventListener(API_ERROR_EVENT, handleError)
    return () => window.removeEventListener(API_ERROR_EVENT, handleError)
  }, [location, navigate])
  return null
}
export default ApiErrorRedirect
