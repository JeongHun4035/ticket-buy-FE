import { useTranslation } from 'react-i18next'
import { FiCalendar, FiMapPin, FiX } from 'react-icons/fi'

import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/dateTime'

import EventPoster from '../EventPoster/EventPoster'

import type { EventDetailProps } from '@/types/interfaces/pages/main'

const EventDetail = ({ selected, dialog, onClose, onBook }: EventDetailProps) => {
  const { t, i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const money = (value: number) => formatCurrency(value, language)
  return (
    <dialog ref={dialog} aria-label={t('행사 상세 정보')} className="event-dialog" onClose={() => onClose()}><button className="event-dialog-close" type="button" aria-label={t('행사 상세 닫기')} onClick={() => dialog.current?.close()}><FiX /></button>{selected && <><EventPoster event={selected} /><span className="event-category">{t(selected.category)} · {t(selected.status)}</span><h2>{t(selected.title)}</h2><p><FiMapPin aria-hidden="true" /> {t(selected.venue)}</p><p><FiCalendar aria-hidden="true" /> {formatDate(selected.date, language)}</p><strong>{t('가격 시작 {{price}}', { price: money(selected.price) })}</strong><div className="event-dialog-notice">{selected.description}</div><footer className="dialog-actions"><button className="dialog-button dialog-button--primary" type="button" disabled={selected.status !== '예매중'} onClick={() => {
      dialog.current?.close(); onBook(selected)
    }}>{selected.status === '예매중' ? t('예매하기') : t(selected.status)}</button></footer></>}</dialog>
  )
}
export default EventDetail
