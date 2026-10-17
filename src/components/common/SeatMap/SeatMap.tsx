import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatCurrency } from '@/utils/currency'

import { groupSeatSections } from './seatSections'

import type { Seat, SeatMapProps } from '@/types/interfaces/components'
import type { SeatMapFeedback } from '@/types/interfaces/components/seatMap'


import './SeatMap.css'

const SeatMap = ({ seats, selectedIds, onChange, maxSelection = 4, disabled = false }: SeatMapProps) => {
  const { t, i18n } = useTranslation()
  const [feedback, setFeedback] = useState<SeatMapFeedback | null>(null)
  const [sectionId, setSectionId] = useState('')
  const sections = useMemo(() => groupSeatSections(seats), [seats])
  const activeSection = sections.find(section => section.id === sectionId) ?? sections[0]
  const visibleSeats = activeSection?.seats ?? []
  const rows = new Map<string, Seat[]>()
  visibleSeats.forEach(seat => {
    const row = rows.get(seat.row) ?? []
    row.push(seat)
    rows.set(seat.row, row)
  })
  const toggle = (seat: Seat) => {
    if (seat.reserved || disabled) return
    if (selectedIds.includes(seat.id)) {
      onChange(selectedIds.filter(id => id !== seat.id))
      setFeedback({
        key: '{{seat}} 선택을 해제했습니다.',
        seat,
      })
    } else if (selectedIds.length >= maxSelection) {
      setFeedback({
        key: '좌석은 최대 {{count}}개까지 선택할 수 있습니다.',
        seat: null,
      })
    } else {
      onChange([...selectedIds, seat.id])
      setFeedback({
        key: '{{seat}}을 선택했습니다.',
        seat,
      })
    }
  }

  return (
    <div className="seat-map">
      <div className="seat-map__capacity"><strong>{t('전체 {{count}}석', { count: seats.length })}</strong><span>{t('선택 {{count}}석', { count: selectedIds.length })}</span></div>
      {sections.length > 1 && <>
        <p className="seat-map__section-help">{t('구역을 선택한 뒤 좌석을 선택해주세요.')}</p>
        <div className="seat-map__overview-stage">STAGE</div>
        <div className="seat-map__sections" role="group" aria-label={t('구역 선택')}>
          {sections.map(section => <button type="button" key={section.id} aria-pressed={section.id === activeSection?.id} onClick={() => setSectionId(section.id)}>
            <strong>{t('{{section}} 구역', { section: section.name })}</strong>
            <span>{t('잔여 {{available}} / {{total}}석', {
              available: section.available,
              total: section.seats.length,
            })}</span>
            {section.seats.some(seat => selectedIds.includes(seat.id)) && <small>{t('선택한 좌석 있음')}</small>}
          </button>)}
        </div>
        <h3 className="seat-map__section-title">{t('{{section}} 구역', { section: activeSection?.name })}</h3>
        <p className="seat-map__section-help">{t('구역을 변경해도 선택한 좌석은 유지됩니다.')}</p>
      </>}
      {!seats.length && <p role="status">{t('좌석 정보가 없습니다.')}</p>}
      <div className="seat-map__legend" aria-label={t('좌석 범례')}><span><i className="seat-map__swatch--VIP" />VIP</span><span><i className="seat-map__swatch--R" />R</span><span><i className="seat-map__swatch--S" />S</span><span><i className="seat-map__swatch--selected" />{t('선택')}</span><span><i className="seat-map__swatch--reserved" />{t('선택 불가')}</span></div>
      <div className="seat-map__scroll" role="region" aria-label={t('좌석 배치도, 가로로 스크롤할 수 있습니다')} tabIndex={0}>
        <div className="seat-map__layout">
          <div className="seat-map__stage">STAGE<span>{t('무대')}</span></div>
          <p className="seat-map__direction">{t('좌석의 열과 번호를 확인해주세요.')}</p>
          <div className="seat-map__rows">{[...rows].map(([row, rowSeats]) => <div className="seat-map__row" key={row} role="group" aria-label={t('{{row}}열', { row })}><span className="seat-map__row-label" aria-hidden="true">{row}</span>{rowSeats.map(seat => {
            const selected = selectedIds.includes(seat.id)
            return <button type="button" key={seat.id} className={`seat-map__seat seat-map__seat--${seat.grade} ${selected ? 'is-selected' : ''} ${seat.reserved ? 'is-reserved' : ''}`} disabled={seat.reserved || disabled} aria-pressed={selected} aria-label={[
              t('{{row}}열 {{number}}번', {
                row: seat.row,
                number: seat.number,
              }),
              t('{{grade}}석', { grade: seat.grade }),
              formatCurrency(seat.price, i18n.resolvedLanguage),
              seat.reserved ? t('선택 불가') : '',
            ].filter(Boolean).join(', ')} onClick={() => toggle(seat)}>{seat.reserved ? '×' : seat.number}</button>
          })}<span className="seat-map__row-label" aria-hidden="true">{row}</span></div>)}</div>
        </div>
      </div>
      <p className="seat-map__feedback" role="status">{feedback ? t(feedback.key, {
        count: maxSelection,
        seat: feedback.seat ? t('{{row}}열 {{number}}번', {
          row: feedback.seat.row,
          number: feedback.seat.number,
        }) : '',
      }) : t('원하는 좌석을 선택해주세요. 최대 {{count}}개 선택 가능합니다.', { count: maxSelection })}</p>
    </div>
  )
}

export default SeatMap
