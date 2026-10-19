import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getErrorMessage } from '@/api/client'
import { getPerformances } from '@/api/events'
import { joinQueue, leaveQueue } from '@/api/queue'
import useApiQuery from '@/hooks/useApiQuery'
import useModalDialog from '@/hooks/useModalDialog'
import { useToast } from '@/hooks/useToast'
import { formatDate } from '@/utils/dateTime'

import BookingDialog from './BookingDialog/BookingDialog'
import WaitingRoom from './WaitingRoom/WaitingRoom'

import type { Performance } from '@/types/interfaces/api/events'
import type { QueueEntry } from '@/types/interfaces/api/queue'
import type { BookingDialogProps } from '@/types/interfaces/components'

const BookingFlow = ({ event, onClose }: BookingDialogProps) => {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()
  const dialog = useModalDialog(false)
  const [performance, setPerformance] = useState<Performance | null>(null)
  const [entry, setEntry] = useState<QueueEntry | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const load = useCallback((signal: AbortSignal) => getPerformances(event.id, signal), [event.id])
  const performances = useApiQuery(load)
  const admit = useCallback((queue: QueueEntry) => setEntry(queue), [])

  const start = async () => {
    const selected = performances.data?.find(item => item.id === Number(selectedId))
    if (!selected || busy) return
    setBusy(true)
    setError('')
    try {
      const queue = await joinQueue(selected.id)
      setPerformance(selected)
      setEntry(queue)
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const close = () => {
    if (!performance) {
      onClose(); return
    }
    setBusy(true)
    void leaveQueue(performance.id).catch((reason: unknown) => {
      toast(getErrorMessage(reason), { variant: 'error' })
    })
      .finally(onClose)
  }

  if (performance && entry) {
    if (entry.state === 'ADMITTED' && entry.admissionToken) return <BookingDialog event={event} performance={performance} admission={entry} onClose={close} />
    return <WaitingRoom event={event} performance={performance} initialQueue={entry} onAdmit={admit} onCancel={onClose} />
  }
  return <dialog ref={dialog} className="event-dialog performance-dialog" aria-labelledby="performance-title" onCancel={event => {
    if (busy) event.preventDefault()
  }} onClose={onClose}>
    <h2 id="performance-title">{t('회차 선택')}</h2><p>{event.title}</p>
    {performances.loading && <p role="status">{t('불러오는 중')}</p>}
    {(performances.error || error) && <p className="api-error" role="alert">{performances.error || error}<button type="button" onClick={performances.reload}>{t('다시 시도')}</button></p>}
    <label className="performance-select">{t('공연 일시')}<select value={selectedId} disabled={busy} onChange={event => setSelectedId(event.target.value)}><option value="">{t('회차를 선택해주세요.')}</option>{performances.data?.map(item => <option key={item.id} value={item.id} disabled={item.status !== 'ON_SALE'}>{formatDate(item.startsAt, i18n.resolvedLanguage)} · {item.venue}{item.status !== 'ON_SALE' ? ` (${item.status})` : ''}</option>)}</select></label>
    {!performances.loading && performances.data?.length === 0 && <p>{t('예매 가능한 회차가 없습니다.')}</p>}
    <footer className="dialog-actions"><button className="dialog-button dialog-button--secondary" type="button" disabled={busy} onClick={() => dialog.current?.close()}>{t('닫기')}</button><button className="dialog-button dialog-button--primary" type="button" disabled={!selectedId || busy} onClick={() => {
      void start()
    }}>{t(busy ? '처리 중' : '대기열 입장')}</button></footer>
  </dialog>
}
export default BookingFlow
