import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const useScrollToTop = () => {
  const { key } = useLocation()

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const reset = () => window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
    reset()
    const frame = window.requestAnimationFrame(reset)
    return () => {
      window.cancelAnimationFrame(frame)
      window.history.scrollRestoration = previous
    }
  }, [key])
}

export default useScrollToTop
