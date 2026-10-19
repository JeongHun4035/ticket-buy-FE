import { useTranslation } from 'react-i18next'

import Grid from '@/components/common/Grid/Grid'
import Pagination from '@/components/common/Pagination/Pagination'
import useReservations from '@/hooks/useReservations'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/dateTime'

import ReservationDetail from './children/ReservationDetail/ReservationDetail'

import type { Reservation } from '@/types/interfaces/api/reservations'
import type { GridColumn } from '@/types/interfaces/components'

const Reservations = () => {
  const { t, i18n } = useTranslation()
  const {
    page,
    setPage,
    limit,
    setLimit,
    selected,
    setSelected,
    busy,
    error,
    dialog,
    list,
    open,
    cancel,
  } = useReservations()
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
    <ReservationDetail dialog={dialog} selected={selected} busy={busy} error={error} onClose={() => setSelected(null)} onCancel={cancel} />
  </div>
}
export default Reservations
