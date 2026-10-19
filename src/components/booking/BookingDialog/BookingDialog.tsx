import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import SeatMap from '@/components/common/SeatMap/SeatMap'
import useModalDialog from '@/hooks/useModalDialog'
import useSeatBooking from '@/hooks/useSeatBooking'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/dateTime'

import type { SeatBookingProps } from '@/types/interfaces/components/bookingDialog'

import './BookingDialog.css'

const BookingDialog = ({ event, performance, admission, onClose }: SeatBookingProps) => {
  const { t, i18n } = useTranslation()
  const dialog = useModalDialog()
  const {
    query,
    seats,
    selectedIds,
    setSelectedIds,
    hold,
    reservation,
    busy,
    error,
    chosen,
    total,
    seconds,
    admissionExpired,
    expired,
    close,
    secure,
    reset,
    confirm,
  } = useSeatBooking({
    performance,
    admission,
    onClose,
  })
  const money = (value: number) => formatCurrency(value, i18n.resolvedLanguage)

  return <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-title" onCancel={event => {
    event.preventDefault(); void close()
  }}>
    <header className="booking-dialog__header"><div><span>BOOK YOUR MOMENT</span><h2 id="booking-title">{t(reservation ? '예매 완료' : '좌석 선택')}</h2></div><button type="button" className="booking-dialog__close" disabled={busy} aria-label={t('닫기')} onClick={() => {
      void close()
    }}><FiX aria-hidden="true" /></button></header>
    <div className="booking-dialog__content">
      <div className="booking-dialog__event"><strong>{event.title}</strong><p>{performance.venue} · {formatDate(performance.startsAt, i18n.resolvedLanguage)}</p></div>
      {(error || query.error) && <div className="api-error" role="alert">{error || query.error}<button type="button" onClick={query.reload}>{t('새로고침')}</button></div>}
      {reservation ? <section className="reservation-success"><h3>{t('예매가 확정되었습니다.')}</h3><p>{t('예매번호')}: {reservation.id}</p><p>{reservation.seats.map(seat => `${seat.row}-${seat.number}`).join(', ')}</p><strong>{money(reservation.total)}</strong><p>{t('결제 상태')}: {t('별도 결제 없음')}</p><footer className="dialog-actions"><Link className="dialog-button dialog-button--primary" to="/reservations" onClick={() => {
        void close()
      }}>{t('내 예매')}</Link></footer></section> : <div className="booking-dialog__body"><section className="booking-dialog__map" aria-label={t('공연장 좌석 선택')}>
        {query.loading ? <p role="status">{t('불러오는 중')}</p> : <SeatMap seats={seats} {...(query.data ? {
          totalSeats: query.data.total,
          availableSeats: query.data.availableSeats,
        } : {})} selectedIds={selectedIds} onChange={setSelectedIds} disabled={busy || !!hold || admissionExpired} />}
        <p className="booking-dialog__sample">{t('최대 4석까지 선택할 수 있습니다.')}</p>
      </section><aside className="booking-dialog__summary"><h3>{t('선택한 좌석')} <span>{chosen.length} / 4</span></h3>
        <ul className="booking-dialog__selected">{chosen.map(seat => <li key={seat.id}><div><strong>{t('{{row}}열 {{number}}번', {
          row: seat.row,
          number: seat.number,
        })}</strong><small>{seat.grade} · {money(seat.price)}</small></div>{!hold && <button type="button" disabled={busy} aria-label={t('선택 해제')} onClick={() => setSelectedIds(selectedIds.filter(id => id !== seat.id))}><FiX /></button>}</li>)}</ul>
        {seconds !== null && <p role="status">{t('좌석 확보 남은 시간 {{seconds}}초', { seconds })}</p>}
        {expired && <p className="api-error" role="alert">{t('입장 또는 좌석 확보 시간이 만료되었습니다.')}</p>}
        <div className="booking-dialog__total"><span>{t('선택 좌석 합계')}</span><strong>{money(total)}</strong></div>
        <p className="booking-dialog__notice">{t('좌석 확보 후 서버에서 확인한 금액으로 예매를 확정합니다.')}</p>
        <footer className="dialog-actions">{hold && <button className="dialog-button dialog-button--secondary" type="button" disabled={busy} onClick={() => {
          void reset()
        }}>{t('좌석 다시 선택')}</button>}<button className="dialog-button dialog-button--primary" type="button" disabled={busy || expired || !chosen.length} onClick={() => {
          void (hold ? confirm() : secure())
        }}>{t(busy ? '처리 중' : hold ? '예매 확정' : '좌석 확보')}</button></footer>
      </aside></div>}
    </div>
  </dialog>
}
export default BookingDialog
