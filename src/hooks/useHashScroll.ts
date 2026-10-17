import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router의 해시 변경은 브라우저 기본 앵커 스크롤을 실행하지 않으므로 직접 처리합니다.
const useHashScroll = () => {
  const { hash, key, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      target?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    hash,
    key,
    pathname,
  ])
}

export default useHashScroll
