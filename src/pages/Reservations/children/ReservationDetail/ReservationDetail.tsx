import { useTranslation } from 'react-i18next'

import { formatCurrency } from '@/utils/currency'

import type { ReservationDetailProps } from '@/types/interfaces/pages/reservations'

const ReservationDetail = ({ dialog, selected, busy, error, onClose, onCancel }: ReservationDetailProps) => {
  const { t, i18n } = useTranslation()

  return (
    <dialog
      className="service-post-dialog"
      ref={dialog}
      aria-labelledby="reservation-title"
      onCancel={event => {
        if (busy) event.preventDefault()
      }}
      onClose={onClose}
    >
      {selected && (
        <>
          <h2 id="reservation-title">{t('예매 상세')}</h2>
          <p>{selected.id}</p>
          <p>{t(selected.status)} · {t(selected.paymentStatus)}</p>
          <p>{selected.seats.map(seat => `${seat.row}-${seat.number}`).join(', ')}</p>
          <strong>{formatCurrency(selected.total, i18n.resolvedLanguage)}</strong>
          <p>{t('취소하면 예매 좌석이 해제됩니다.')}</p>
          {error && <p className="api-error" role="alert">{error}</p>}
        </>
      )}
      <footer className="dialog-actions">
        {selected && (
          <button
            className="dialog-button dialog-button--danger"
            type="button"
            disabled={busy || selected.status === 'CANCELLED'}
            onClick={() => {
              void onCancel()
            }}
          >
            {t('예매 취소')}
          </button>
        )}
        <button
          className="dialog-button dialog-button--secondary"
          type="button"
          disabled={busy}
          onClick={() => dialog.current?.close()}
        >
          {t('닫기')}
        </button>
      </footer>
    </dialog>
  )
}

export default ReservationDetail
