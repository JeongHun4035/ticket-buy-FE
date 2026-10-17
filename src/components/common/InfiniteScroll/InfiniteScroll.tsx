import { useCallback, useEffect, useRef, useState } from 'react'

import type { InfiniteScrollProps } from '@/types/interfaces/components'

import './InfiniteScroll.css'

const InfiniteScroll = ({ children, dataLength, hasMore, onLoadMore, threshold = 0.8, height = 480, disabled = false, loader = '불러오는 중입니다…', endMessage = '모든 데이터를 불러왔습니다.', className = '', label = '무한 스크롤 목록' }: InfiniteScrollProps) => {
  const viewport = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  const inFlight = useRef(false)
  const lastRequestedLength = useRef<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const ratio = Number.isFinite(threshold) ? Math.min(1, Math.max(0, threshold)) : 0.8

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const loadMore = useCallback(async (manual = false): Promise<void> => {
    if (!hasMore || disabled || inFlight.current) return
    if (!manual && (failed || lastRequestedLength.current === dataLength)) return
    inFlight.current = true
    lastRequestedLength.current = dataLength
    setLoading(true)
    setFailed(false)
    try {
      await onLoadMore()
    } catch {
      if (mounted.current) setFailed(true)
    } finally {
      inFlight.current = false
      if (mounted.current) setLoading(false)
    }
  }, [
    hasMore,
    disabled,
    failed,
    dataLength,
    onLoadMore,
  ])

  useEffect(() => {
    const scrollElement = viewport.current
    const contentElement = content.current
    if (!scrollElement || !contentElement) return
    let frame: number | null = null
    const measure = () => {
      frame = null
      if (scrollElement.clientHeight === 0) return
      if (scrollElement.scrollTop + scrollElement.clientHeight >= contentElement.offsetHeight * ratio) {
        void loadMore()
      }
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(scrollElement)
    observer.observe(contentElement)
    scrollElement.addEventListener('scroll', schedule, { passive: true })
    schedule()
    return () => {
      observer.disconnect()
      scrollElement.removeEventListener('scroll', schedule)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [
    loadMore,
    ratio,
    loading,
  ])

  return (
    <div className={`common-infinite-scroll ${className}`} style={{ height }}>
      <div ref={viewport} className="common-infinite-scroll__viewport" role="region" aria-label={label} aria-busy={loading} tabIndex={0}>
        <div ref={content} className="common-infinite-scroll__content">{children}</div>
        <div className="common-infinite-scroll__footer">
          <div role="status" aria-live="polite">
            {failed ? '데이터를 불러오지 못했습니다.' : !hasMore && !loading ? endMessage : null}
          </div>
          {hasMore && (
            <button type="button" disabled={disabled || loading} onClick={() => {
              void loadMore(true)
            }}>
              {failed ? '다시 시도' : '더 불러오기'}
            </button>
          )}
        </div>
      </div>
      <div className={`common-infinite-scroll__loading${loading ? ' common-infinite-scroll__loading--visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {loading && (
          <div className="common-infinite-scroll__loading-card">
            <span className="common-infinite-scroll__spinner" aria-hidden="true" />
            <div className="common-infinite-scroll__loading-text">{loader}</div>
            <span className="common-infinite-scroll__loading-dots" aria-hidden="true"><span /><span /><span /></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default InfiniteScroll
