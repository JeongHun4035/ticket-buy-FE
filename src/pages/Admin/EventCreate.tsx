import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { createAdminEvent } from '@/api/adminEvents'
import { getErrorMessage } from '@/api/client'
import { ApiError } from '@/api/http'
import { useToast } from '@/hooks/useToast'
import { buildEventPayload, newEventDraft, newPerformance, validatePosterFile } from '@/utils/adminEvents'

import PerformanceFields from './PerformanceFields'

import type { EventCreated } from '@/types/interfaces/api/adminEvents'

import '../Support/Support.css'
import './EventCreate.css'

const EventCreate = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [draft, setDraft] = useState(newEventDraft)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [validating, setValidating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EventCreated | null>(null)
  const [uncertain, setUncertain] = useState(false)
  const [retryAt, setRetryAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const pending = useRef(false)
  const imageRequest = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  useEffect(() => () => {
    imageRequest.current++
  }, [])
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])
  useEffect(() => {
    if (!retryAt) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [retryAt])
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])
  const chooseImage = async (file: File) => {
    const requestId = ++imageRequest.current
    setValidating(true); setError('')
    try {
      await validatePosterFile(file)
      if (requestId !== imageRequest.current) return
      setImage(file); setPreview(URL.createObjectURL(file))
    } catch (reason) {
      if (requestId === imageRequest.current) setError(t(reason instanceof Error ? reason.message : 'INVALID_IMAGE'))
    } finally {
      if (requestId === imageRequest.current) setValidating(false)
    }
  }
  const submit = async () => {
    if (pending.current || validating || uncertain || Date.now() < retryAt || result) return
    pending.current = true; setBusy(true); setError('')
    let submitted = false
    try {
      if (!image) throw new Error('IMAGE_REQUIRED')
      const payload = buildEventPayload(draft)
      submitted = true
      const created = await createAdminEvent(payload, image)
      setResult(created)
      window.dispatchEvent(new Event('ticket-buy:events-updated'))
      toast(t('행사가 등록되었습니다.'), { variant: 'success' })
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 429) {
          setRetryAt(Date.now() + Math.max(1, reason.retryAfterSeconds ?? 3) * 1000); setNow(Date.now())
        }
        const data = reason.data as { traceId?: string } | null
        const message = reason.status >= 500 ? t('서버 오류가 발생했습니다. 잠시 후 다시 시도하거나 문의해주세요.') : getErrorMessage(reason)
        setError(message + (typeof data?.traceId === 'string' ? ' · ' + t('문의 번호') + ': ' + data.traceId : ''))
      } else if (submitted) {
        setUncertain(true); setError(t('등록 결과를 확인하지 못했습니다. 행사 목록에서 등록 여부를 먼저 확인해주세요. 다시 제출하면 중복 등록될 수 있습니다.'))
      } else setError(t(reason instanceof Error ? reason.message : 'INVALID_REQUEST'))
    } finally {
      pending.current = false; setBusy(false)
    }
  }
  if (result) return <div className="service-page admin-event-create"><section className="admin-event-panel" role="status"><h1>{t('행사가 등록되었습니다.')}</h1><h2>{result.event.title}</h2><p>{t('행사 번호')}: {result.event.id}</p><p>{t('생성된 회차')}: {result.performances.map(item => item.id).join(', ')}</p><Link className="api-secondary" to={'/?eventId=' + result.event.id}>{t('등록한 행사 상세 보기')}</Link><Link className="api-secondary" to="/">{t('행사 목록 확인')}</Link></section></div>
  return <div className="service-page admin-event-create"><header className="service-page-heading"><span>EVENT MANAGEMENT</span><h1>{t('행사 등록')}</h1><p>{t('행사 정보, 포스터와 판매할 회차·구역을 등록하세요.')}</p><Link to="/admin">{t('콘텐츠 관리')}</Link></header>
    <form onSubmit={event => {
      event.preventDefault(); void submit()
    }}>
      <fieldset className="admin-event-form" disabled={busy}>
        <section className="admin-event-panel"><h2>{t('행사 기본 정보')}</h2>
          {[
            'ko',
            'en',
            'zh-CN',
          ].map(language => <fieldset key={language}><legend>{language} · {t(language === 'ko' ? '필수' : '선택 입력')}</legend><label>{t('제목')}<input required={language === 'ko'} maxLength={200} value={draft.titles[language] ?? ''} onChange={event => setDraft({
            ...draft,
            titles: {
              ...draft.titles,
              [language]: event.target.value,
            },
          })} /></label><label>{t('설명')}<textarea required={language === 'ko'} maxLength={20000} value={draft.descriptions[language] ?? ''} onChange={event => setDraft({
            ...draft,
            descriptions: {
              ...draft.descriptions,
              [language]: event.target.value,
            },
          })} /></label></fieldset>)}
          <div className="admin-event-dates"><label>{t('행사 장르')}<select value={draft.category} onChange={event => setDraft({
            ...draft,
            category: event.target.value as typeof draft.category,
          })}>{[
              'CONCERT',
              'MUSICAL',
              'THEATER',
              'EXHIBITION',
              'CLASSICAL',
            ].map(category => <option key={category} value={category}>{t(category)}</option>)}</select></label><label>{t('추천 순위')}<input type="number" required min={0} max={100000} step={1} value={draft.featuredRank} onChange={event => setDraft({
            ...draft,
            featuredRank: event.target.value,
          })} /></label></div>
          <p className="admin-event-help">{t('0은 추천 제외이며 값이 클수록 추천 우선순위가 높습니다.')}</p>
        </section>
        <section className="admin-event-panel"><h2>{t('포스터 이미지')}</h2><p className="admin-event-help">{t('PNG/JPEG · 최대 5MiB · 각 변 6000px 이하 · 총 2000만 픽셀 이하')}</p>
          <label>{t('이미지 선택')}<input ref={fileInput} type="file" accept="image/png,image/jpeg" onChange={event => {
            const file = event.target.files?.[0]; event.target.value = ''; if (file) void chooseImage(file)
          }} /></label>
          {validating && <p role="status">{t('이미지 확인 중')}</p>}
          {preview && <div className="admin-event-preview"><img src={preview} alt={draft.titles.ko || t('포스터 미리보기')} /><div><p>{image?.name}</p><button type="button" className="api-secondary" onClick={() => fileInput.current?.click()}>{t('이미지 다시 선택')}</button><button type="button" className="api-secondary" onClick={() => {
            imageRequest.current++; setImage(null); setPreview(''); setValidating(false)
          }}>{t('이미지 제거')}</button></div></div>}
        </section>
        <section className="admin-event-panel"><h2>{t('공연 회차')}</h2><p className="admin-event-help">{t('입력 시간대: 한국 표준시 (Asia/Seoul, UTC+09:00)')}</p><p className="admin-event-help">{t('예매 오픈 < 예매 마감 ≤ 공연 시작. 공연 시작과 예매 마감은 미래여야 합니다.')}</p>
          {draft.performances.map((performance, index) => <PerformanceFields key={performance.key} value={performance} index={index} removable={draft.performances.length > 1} onRemove={() => setDraft(previous => ({
            ...previous,
            performances: previous.performances.filter(item => item.key !== performance.key),
          }))} onChange={value => setDraft(previous => ({
            ...previous,
            performances: previous.performances.map(item => item.key === value.key ? value : item),
          }))} />)}
          <div className="admin-event-performance-actions"><button type="button" className="api-secondary" disabled={draft.performances.length >= 20} onClick={() => setDraft(previous => ({
            ...previous,
            performances: [...previous.performances, newPerformance()],
          }))}>{t('회차 추가')}</button><p className="admin-event-help">{t('회차는 1~20개까지 등록할 수 있습니다.')}</p></div>
        </section>
      </fieldset>
      {error && <div ref={errorRef} tabIndex={-1} className="api-error" role="alert">{error}</div>}
      {uncertain && <div className="admin-event-panel"><Link to="/" target="_blank">{t('행사 목록 확인')}</Link><button type="button" className="api-secondary" onClick={() => {
        setUncertain(false); setError('')
      }}>{t('미등록 확인 후 다시 제출 허용')}</button></div>}
      {retryAt > now && <p role="status">{t('{{seconds}}초 후 다시 시도할 수 있습니다.', { seconds: Math.ceil((retryAt - now) / 1000) })}</p>}
      <button type="submit" className="event-detail-book" disabled={busy || validating || uncertain || retryAt > now}>{t(busy ? '등록 중' : '행사 등록')}</button>
    </form>
  </div>
}
export default EventCreate
