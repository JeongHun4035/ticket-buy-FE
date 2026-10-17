import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { formatDate } from '@/api/adapters'
import { getErrorMessage } from '@/api/client'
import { createHold, createReservation, getSeats, releaseHold } from '@/api/ticket'
import SeatMap from '@/components/common/SeatMap/SeatMap'
import useApiQuery from '@/hooks/useApiQuery'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/utils/currency'

import type { Reservation, SeatHold } from '@/types/interfaces/api/ticket'
import type { SeatBookingProps } from '@/types/interfaces/components/bookingDialog'

import './BookingDialog.css'

const BookingDialog = ({ event, performance, admission, onClose }: SeatBookingProps) => {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()
  const dialog = useRef<HTMLDialogElement>(null)
  const holdRef = useRef<SeatHold | null>(null)
  const idempotencyKey = useRef('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [hold, setHold] = useState<SeatHold | null>(null)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(Date.now())
  const token = admission.admissionToken ?? ''
  const load = useCallback((signal: AbortSignal) => getSeats(performance.id, token, signal), [performance.id, token])
  const query = useApiQuery(load)
  const money = (value: number) => formatCurrency(value, i18n.resolvedLanguage)
  const seats = (query.data?.items ?? []).map(seat => ({
    ...seat,
    reserved: seat.status !== 'AVAILABLE',
  }))
  const chosen = hold?.seats ?? seats.filter(seat => selectedIds.includes(seat.id))
  const total = hold?.total ?? chosen.reduce((sum, seat) => sum + seat.price, 0)
  const seconds = hold ? Math.max(0, Math.ceil((Date.parse(hold.expiresAt) - now) / 1000)) : null
  const admissionExpired = !!admission.admissionExpiresAt && Date.parse(admission.admissionExpiresAt) <= now
  const expired = seconds === 0 || admissionExpired

  useEffect(() => {
    const element = dialog.current
    if (element && !element.open) element.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearInterval(timer)
      document.body.style.overflow = oldOverflow
      if (holdRef.current) void releaseHold(holdRef.current.id).catch(() => { /* Server expiry releases disconnected holds. */ })
    }
  }, [])

  const close = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (holdRef.current) await releaseHold(holdRef.current.id)
    } catch (reason) {
      toast(getErrorMessage(reason), { variant: 'error' })
    } finally {
      holdRef.current = null; onClose()
    }
  }
  const secure = async () => {
    if (busy || selectedIds.length === 0 || expired) return
    setBusy(true); setError('')
    try {
      const result = await createHold(performance.id, token, selectedIds)
      holdRef.current = result
      setHold(result)
      idempotencyKey.current = crypto.randomUUID()
    } catch (reason) {
      setError(getErrorMessage(reason)); setSelectedIds([]); query.reload()
    } finally {
      setBusy(false)
    }
  }
  const reset = async () => {
    if (!hold || busy) return
    setBusy(true); setError('')
    try {
      await releaseHold(hold.id); holdRef.current = null; setHold(null); setSelectedIds([]); query.reload()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const confirm = async () => {
    if (!hold || busy || expired) return
    setBusy(true); setError('')
    try {
      const result = await createReservation(hold.id, token, idempotencyKey.current)
      holdRef.current = null
      setReservation(result)
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return <dialog ref={dialog} className="booking-dialog" aria-labelledby="booking-title" onCancel={event => {
    event.preventDefault(); void close()
  }}>
    <header className="booking-dialog__header"><div><span>BOOK YOUR MOMENT</span><h2 id="booking-title">{t(reservation ? '예매 완료' : '좌석 선택')}</h2></div><button type="button" className="booking-dialog__close" disabled={busy} aria-label={t('닫기')} onClick={() => {
      void close()
    }}><FiX aria-hidden="true" /></button></header>
    <div className="booking-dialog__event"><strong>{event.title}</strong><p>{performance.venue} · {formatDate(performance.startsAt, i18n.resolvedLanguage)}</p></div>
    {(error || query.error) && <div className="api-error" role="alert">{error || query.error}<button type="button" onClick={query.reload}>{t('새로고침')}</button></div>}
    {reservation ? <section className="reservation-success"><h3>{t('예매가 확정되었습니다.')}</h3><p>{t('예매번호')}: {reservation.id}</p><p>{reservation.seats.map(seat => `${seat.row}-${seat.number}`).join(', ')}</p><strong>{money(reservation.total)}</strong><p>{t('결제 상태')}: {t('별도 결제 없음')}</p><Link to="/reservations" onClick={() => {
      void close()
    }}>{t('내 예매')}</Link></section> : <div className="booking-dialog__body"><section className="booking-dialog__map" aria-label={t('공연장 좌석 선택')}>
      {query.loading ? <p role="status">{t('불러오는 중')}</p> : <SeatMap seats={seats} selectedIds={selectedIds} onChange={setSelectedIds} disabled={busy || !!hold || admissionExpired} />}
      <p className="booking-dialog__sample">{t('최대 4석까지 선택할 수 있습니다.')}</p>
    </section><aside className="booking-dialog__summary"><h3>{t('선택한 좌석')} <span>{chosen.length} / 4</span></h3>
      <ul className="booking-dialog__selected">{chosen.map(seat => <li key={seat.id}><div><strong>{t('{{row}}열 {{number}}번', {
        row: seat.row,
        number: seat.number,
      })}</strong><small>{seat.grade} · {money(seat.price)}</small></div>{!hold && <button type="button" disabled={busy} aria-label={t('선택 해제')} onClick={() => setSelectedIds(selectedIds.filter(id => id !== seat.id))}><FiX /></button>}</li>)}</ul>
      {seconds !== null && <p role="status">{t('좌석 확보 남은 시간 {{seconds}}초', { seconds })}</p>}
      {expired && <p className="api-error" role="alert">{t('입장 또는 좌석 확보 시간이 만료되었습니다.')}</p>}
      <div className="booking-dialog__total"><span>{t('선택 좌석 합계')}</span><strong>{money(total)}</strong></div>
      <button className="booking-dialog__done" type="button" disabled={busy || expired || !chosen.length} onClick={() => {
        void (hold ? confirm() : secure())
      }}>{t(busy ? '처리 중' : hold ? '예매 확정' : '좌석 확보')}</button>
      {hold && <button className="api-secondary" type="button" disabled={busy} onClick={() => {
        void reset()
      }}>{t('좌석 다시 선택')}</button>}
      <p className="booking-dialog__notice">{t('좌석 확보 후 서버에서 확인한 금액으로 예매를 확정합니다.')}</p>
    </aside></div>}
  </dialog>
}
export default BookingDialog
