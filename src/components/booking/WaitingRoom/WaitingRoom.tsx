import { useTranslation } from 'react-i18next'
import { FiClock, FiUsers, FiX } from 'react-icons/fi'

import useModalDialog from '@/hooks/useModalDialog'
import useWaitingQueue from '@/hooks/useWaitingQueue'

import type { WaitingRoomProps } from '@/types/interfaces/components/waitingRoom'

import './WaitingRoom.css'

const WaitingRoom = ({ event, performance, initialQueue, onAdmit, onCancel }: WaitingRoomProps) => {
  const { t, i18n } = useTranslation()
  const dialog = useModalDialog()
  const { entry, error, busy, cancel, retry } = useWaitingQueue({
    performance,
    initialQueue,
    onAdmit,
    onCancel,
  })
  return <dialog ref={dialog} className="waiting-room" aria-labelledby="waiting-title" onCancel={event => {
    event.preventDefault(); void cancel()
  }}>
    <button className="waiting-room__close" type="button" disabled={busy} aria-label={t('대기 취소')} onClick={() => {
      void cancel()
    }}><FiX aria-hidden="true" /></button>
    <div className="waiting-room__icon"><FiUsers aria-hidden="true" /></div><p className="waiting-room__eyebrow">TICKET BUY · WAITING ROOM</p><h2 id="waiting-title">{t('잠시만 기다려주세요.')}</h2><p className="waiting-room__description">{t('접속자가 많아 순서대로 입장하고 있습니다.')}</p><div className="waiting-room__event">{event.title}</div>
    <div className="waiting-room__position"><span>{t('현재 대기순서')}</span><strong>{new Intl.NumberFormat(i18n.resolvedLanguage).format(entry.position)}<small>{t('번')}</small></strong></div>
    <p>{t('앞선 대기자 {{count}}명', { count: entry.aheadCount })}</p><div className="waiting-room__estimate"><FiClock aria-hidden="true" /><span>{entry.estimatedWaitSeconds === null ? t('예상 대기시간을 계산 중입니다.') : t('예상 대기시간 약 {{seconds}}초', { seconds: entry.estimatedWaitSeconds })}</span></div>
    <p className="waiting-room__notice" role="status">{t(entry.state === 'WAITING' ? '순서가 되면 좌석 선택 화면으로 자동 이동합니다.' : '대기가 만료되거나 취소되었습니다. 다시 예매해주세요.')}</p>
    {error && <div className="api-error" role="alert">{error}<button type="button" onClick={retry}>{t('다시 시도')}</button></div>}
    <footer className="dialog-actions"><button className="dialog-button dialog-button--danger" type="button" disabled={busy} onClick={() => {
      void cancel()
    }}>{t('대기 취소')}</button></footer>
  </dialog>
}
export default WaitingRoom
