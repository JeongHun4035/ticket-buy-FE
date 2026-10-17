import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatDate } from '@/api/adapters'
import { getErrorMessage } from '@/api/client'
import { cancelReservation, getReservation, getReservations } from '@/api/ticket'
import Grid from '@/components/common/Grid/Grid'
import Pagination from '@/components/common/Pagination/Pagination'
import useApiQuery from '@/hooks/useApiQuery'
import useAuth from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/currency'

import type { Reservation } from '@/types/interfaces/api/ticket'
import type { GridColumn } from '@/types/interfaces/components'

import '../Support/Support.css'

const Reservations = () => {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const load = useCallback((signal: AbortSignal) => auth.user ? getReservations(page, limit, signal) : Promise.resolve(null), [
    auth.user,
    page,
    limit,
  ])
  const list = useApiQuery(load)
  const open = async (id: string) => {
    if (busy) return
    setBusy(true); setError('')
    try {
      setSelected(await getReservation(id)); dialog.current?.showModal()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const cancel = async () => {
    if (!selected || busy) return
    setBusy(true); setError('')
    try {
      setSelected(await cancelReservation(selected.id)); list.reload()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const columns: GridColumn<Reservation>[] = [
    {
      key: 'id',
      header: t('예매번호'),
      width: '24%',
      render: item => item.id,
    },
    {
      key: 'status',
      header: t('예매 상태'),
      render: item => <span className="reservation-status" data-status={item.status}>{t(item.status)}</span>,
    },
    {
      key: 'date',
      header: t('예매일'),
      render: item => formatDate(item.createdAt, i18n.resolvedLanguage),
    },
    {
      key: 'seats',
      header: t('선택한 좌석'),
      render: item => item.seats.map(seat => `${seat.row}-${seat.number}`).join(', '),
    },
    {
      key: 'total',
      header: t('선택 좌석 합계'),
      render: item => formatCurrency(item.total, i18n.resolvedLanguage),
    },
    {
      key: 'detail',
      header: t('예매 상세'),
      align: 'center',
      render: item => <button className="api-secondary" type="button" disabled={busy} onClick={() => {
        void open(item.id)
      }}>{t('상세 보기')}</button>,
    },
  ]
  return <div className="service-page"><header className="service-page-heading"><span>MY TICKETS</span><h1>{t('내 예매')}</h1></header>
    {(list.error || error) && <p className="api-error" role="alert">{list.error || error}<button type="button" onClick={list.reload}>{t('다시 시도')}</button></p>}
    <Grid className="reservations-grid" columns={columns} data={list.data?.items ?? []} rowKey={item => item.id} loading={list.loading} caption={t('내 예매')} emptyMessage={t('예매 내역이 없습니다.')} emptyDescription={t('관심 있는 공연을 찾아 첫 예매를 시작해보세요.')} footer={<Pagination value={list.data?.total ?? 0} page={page} limit={limit} onChange={(next, size) => {
      setPage(next); setLimit(size)
    }} />} />
    <dialog className="service-post-dialog" ref={dialog} aria-labelledby="reservation-title" onCancel={event => {
      if (busy) event.preventDefault()
    }} onClose={() => setSelected(null)}>{selected && <><h2 id="reservation-title">{t('예매 상세')}</h2><p>{selected.id}</p><p>{t(selected.status)} · {t(selected.paymentStatus)}</p><p>{selected.seats.map(seat => `${seat.row}-${seat.number}`).join(', ')}</p><strong>{formatCurrency(selected.total, i18n.resolvedLanguage)}</strong><p>{t('취소하면 예매 좌석이 해제됩니다.')}</p>{error && <p className="api-error" role="alert">{error}</p>}<button className="api-secondary" type="button" disabled={busy || selected.status === 'CANCELLED'} onClick={() => {
        void cancel()
      }}>{t('예매 취소')}</button></>}<button className="api-secondary" type="button" disabled={busy} onClick={() => dialog.current?.close()}>{t('닫기')}</button></dialog>
  </div>
}
export default Reservations
