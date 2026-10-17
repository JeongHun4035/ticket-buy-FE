import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from 'react-icons/fi'

import type { SliderProps } from '@/types/interfaces/components'

import './Slider.css'

const Slider = <T = unknown>({ items, getKey, renderItem, label = '추천 슬라이드', autoPlay = true, interval = 5000, className = '' }: SliderProps<T>) => {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const count = items.length
  const current = count > 0 ? Math.min(index, count - 1) : 0
  const playing = autoPlay && !paused && !hovered && !focused && !hidden && !reducedMotion && count > 1

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setReducedMotion(media.matches)
    const updateVisibility = () => setHidden(document.hidden)
    updateMotion()
    updateVisibility()
    media.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      media.removeEventListener('change', updateMotion)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setIndex(previous => (Math.min(previous, count - 1) + 1) % count), Math.max(1000, interval))
    return () => window.clearInterval(timer)
  }, [
    playing,
    count,
    interval,
  ])

  const move = (step: number) => setIndex((current + step + count) % count)

  if (count === 0) return null

  return (
    <section className={`common-slider ${className}`} aria-label={t(label)} aria-roledescription={t('캐러셀')} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
    }} onKeyDown={event => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(event.key === 'ArrowRight' ? 1 : -1)
      }
    }}>
      <div className="common-slider__viewport">
        <div className="common-slider__track" style={{ transform: `translateX(-${current * 100}%)` }} aria-live={playing ? 'off' : 'polite'}>
          {items.map((item, itemIndex) => (
            <div className="common-slider__slide" key={getKey(item)} role="group" aria-roledescription={t('슬라이드')} aria-label={`${itemIndex + 1} / ${count}`} aria-hidden={itemIndex !== current} inert={itemIndex !== current}>
              {renderItem(item, itemIndex)}
            </div>
          ))}
        </div>
      </div>
      {count > 1 && <div className="common-slider__controls">
        <div className="common-slider__dots" role="group" aria-label={t('슬라이드 선택')}>{items.map((item, itemIndex) => <button type="button" key={getKey(item)} aria-label={t('{{number}}번 슬라이드 보기', { number: itemIndex + 1 })} aria-current={itemIndex === current ? 'true' : undefined} onClick={() => setIndex(itemIndex)} />)}</div>
        <span className="common-slider__counter">{String(current + 1).padStart(2, '0')} <span>/ {String(count).padStart(2, '0')}</span></span>
        <button type="button" aria-label={t('이전 슬라이드')} onClick={() => move(-1)}><FiChevronLeft aria-hidden="true" /></button>
        <button type="button" aria-label={t('다음 슬라이드')} onClick={() => move(1)}><FiChevronRight aria-hidden="true" /></button>
        {autoPlay && !reducedMotion && <button type="button" aria-label={paused ? t('자동 재생 시작') : t('자동 재생 일시정지')} onClick={() => setPaused(!paused)}>{paused ? <FiPlay aria-hidden="true" /> : <FiPause aria-hidden="true" />}</button>}
      </div>}
    </section>
  )
}

export default Slider

