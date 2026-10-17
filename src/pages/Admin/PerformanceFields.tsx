import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAdminVenueLayout, getAdminVenues } from '@/api/adminEvents'
import Pagination from '@/components/common/Pagination/Pagination'
import useApiQuery from '@/hooks/useApiQuery'
import { formatCurrency } from '@/utils/currency'

import type { PerformanceFieldsProps } from '@/types/interfaces/pages/adminEvents'

const PerformanceFields = ({ value, index, onChange, onRemove, removable }: PerformanceFieldsProps) => {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const venueId = value.venue?.id
  const loadVenues = useCallback((signal: AbortSignal) => getAdminVenues(page, limit, signal), [page, limit])
  const venues = useApiQuery(loadVenues)
  const loadLayout = useCallback((signal: AbortSignal) => venueId ? getAdminVenueLayout(venueId, signal) : Promise.resolve(null), [venueId])
  const layout = useApiQuery(loadLayout)
  // useApiQuery aborts obsolete requests; guard the render before its effect resets old data.
  const current = layout.data?.venue.id === venueId ? layout.data : null
  const selectedSeats = value.sections.reduce((sum, item) => sum + item.section.totalSeats, 0)
  return <section className="admin-event-performance" aria-label={t('회차 {{number}}', { number: index + 1 })}>
    <div className="admin-event-section-heading"><h2>{t('회차 {{number}}', { number: index + 1 })}</h2><button type="button" className="api-secondary" disabled={!removable} onClick={onRemove}>{t('회차 제거')}</button></div>
    <label>{t('공연장')}<select aria-label={t('공연장')} required value={value.venue?.id ?? ''} onChange={event => {
      const venue = venues.data?.items.find(item => item.id === Number(event.target.value)) ?? null
      onChange({
        ...value,
        venue,
        sections: [],
      })
    }}>
      <option value="">{t('공연장 선택')}</option>
      {value.venue && !venues.data?.items.some(item => item.id === venueId) && <option value={venueId}>{value.venue.name}</option>}
      {venues.data?.items.map(venue => <option key={venue.id} value={venue.id}>{venue.name} · {t('수용 {{count}}석', { count: venue.capacity })}</option>)}
    </select></label>
    {venues.loading && <p role="status">{t('불러오는 중')}</p>}
    {venues.error && <p className="api-error" role="alert">{venues.error}<button type="button" onClick={venues.reload}>{t('다시 시도')}</button></p>}
    {(venues.data?.total ?? 0) > 20 && <Pagination className="admin-event-venue-pagination" value={venues.data?.total ?? 0} page={page} limit={limit} onChange={(next, size) => {
      setPage(next); setLimit(size)
    }} />}
    <div className="admin-event-dates">{([
      'startsAt',
      'opensAt',
      'closesAt',
    ] as const).map((key, dateIndex) => <label key={key}>{t([
      '공연 시작 시각',
      '예매 오픈 시각',
      '예매 마감 시각',
    ][dateIndex] ?? '')}<input type="datetime-local" required value={value[key]} onChange={event => onChange({
      ...value,
      [key]: event.target.value,
    })} /></label>)}</div>
    {venueId && <>
      <h3>{t('판매 구역 및 가격')}</h3><p className="admin-event-help">{t('선택한 구역의 전체 좌석이 판매됩니다. 가격은 정수 KRW입니다.')}</p>
      {layout.loading && <p role="status">{t('불러오는 중')}</p>}
      {layout.error && <p className="api-error" role="alert">{layout.error}<button type="button" onClick={layout.reload}>{t('다시 시도')}</button></p>}
      {current && <div className="admin-event-floors">{current.floors.map(floor => <fieldset key={floor.id}><legend>{floor.name}</legend>
        {current.items.filter(section => section.floorId === floor.id).sort((a, b) => a.sortOrder - b.sortOrder)
          .map(section => {
            const selected = value.sections.find(item => item.section.id === section.id)
            return <div className="admin-event-section" key={section.id}>
              <label className="admin-event-checkbox"><input type="checkbox" checked={!!selected} onChange={event => onChange({
                ...value,
                sections: event.target.checked ? [
                  ...value.sections,
                  {
                    section,
                    grade: 'R',
                    price: '100000',
                  },
                ] : value.sections.filter(item => item.section.id !== section.id),
              })} /><span>{section.name}<small>{t('전체 {{count}}석', { count: section.totalSeats })}</small></span></label>
              {selected && <><label>{t('등급')}<select aria-label={t('{{section}} 등급', { section: section.name })} value={selected.grade} onChange={event => onChange({
                ...value,
                sections: value.sections.map(item => item.section.id === section.id ? {
                  ...item,
                  grade: event.target.value as 'VIP' | 'R' | 'S',
                } : item),
              })}>{[
                  'VIP',
                  'R',
                  'S',
                ].map(grade => <option key={grade}>{grade}</option>)}</select></label>
              <label>{t('가격 (KRW)')}<input type="number" required min={0} max={100000000} step={1} aria-label={t('{{section}} 가격', { section: section.name })} value={selected.price} onChange={event => onChange({
                ...value,
                sections: value.sections.map(item => item.section.id === section.id ? {
                  ...item,
                  price: event.target.value,
                } : item),
              })} /></label></>}
            </div>
          })}
      </fieldset>)}</div>}
      {current && !current.items.length && <p>{t('등록된 구역이 없습니다.')}</p>}
      <div className="admin-event-summary" aria-live="polite"><strong>{t('판매 구역 {{count}}개', { count: value.sections.length })} · {t('판매 좌석 {{count}}석', { count: selectedSeats })}</strong><span>{t('공연장 전체 수용 {{count}}석', { count: value.venue?.capacity ?? 0 })}</span>
        {value.sections.map(item => <span key={item.section.id}>{item.section.floor} / {item.section.name} · {item.grade} · {formatCurrency(Number(item.price), i18n.resolvedLanguage)}</span>)}
      </div>
    </>}
  </section>
}
export default PerformanceFields
