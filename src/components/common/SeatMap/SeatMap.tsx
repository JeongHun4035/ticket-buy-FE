import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatCurrency } from '@/utils/currency'

import type { Seat, SeatMapProps } from '@/types/interfaces/components'
import type { SeatMapFeedback } from '@/types/interfaces/components/seatMap'

import './SeatMap.css'

const SeatMap = ({ seats, selectedIds, onChange, maxSelection = 4, disabled = false }: SeatMapProps) => {
  const { t, i18n } = useTranslation()
  const [feedback, setFeedback] = useState<SeatMapFeedback | null>(null)
  const rows = [...new Set(seats.map(seat => seat.row))]
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
      <div className="seat-map__legend" aria-label={t('좌석 범례')}><span><i className="seat-map__swatch--VIP" />VIP</span><span><i className="seat-map__swatch--R" />R</span><span><i className="seat-map__swatch--S" />S</span><span><i className="seat-map__swatch--selected" />{t('선택')}</span><span><i className="seat-map__swatch--reserved" />{t('선택 불가')}</span></div>
      <div className="seat-map__scroll" role="region" aria-label={t('좌석 배치도, 가로로 스크롤할 수 있습니다')} tabIndex={0}>
        <div className="seat-map__layout">
          <div className="seat-map__stage">STAGE<span>{t('무대')}</span></div>
          <p className="seat-map__direction">{t('무대와 가까운 좌석부터 A열입니다.')}</p>
          <div className="seat-map__rows">{rows.map(row => <div className="seat-map__row" key={row} role="group" aria-label={t('{{row}}열', { row })}><span className="seat-map__row-label" aria-hidden="true">{row}</span>{seats.filter(seat => seat.row === row).map(seat => {
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
