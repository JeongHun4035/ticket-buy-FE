import { useTranslation } from 'react-i18next'
import { FiCreditCard, FiPlus, FiShield, FiTrash2, FiX } from 'react-icons/fi'

import Grid from '@/components/common/Grid/Grid'
import useDemoPayments from '@/hooks/useDemoPayments'
import { demoCardIssuers } from '@/services/demoPayments'

import type { GridColumn } from '@/types/interfaces/components'
import type { DemoPaymentMethod } from '@/types/interfaces/pages/payments'

import './Payments.css'

const Payments = () => {
  const { t } = useTranslation()
  const {
    dialog,
    methods,
    form,
    setForm,
    error,
    formError,
    open,
    add,
    makeDefault,
    remove,
  } = useDemoPayments()
  const columns: GridColumn<DemoPaymentMethod>[] = [
    {
      key: 'card',
      header: t('카드사'),
      render: item => <span className="payment-card-name"><FiCreditCard aria-hidden="true" />{t(item.issuer)}</span>,
    },
    {
      key: 'number',
      header: t('카드 정보'),
      render: item => <span className="payment-last4">•••• {item.last4}</span>,
    },
    {
      key: 'nickname',
      header: t('별칭'),
      render: item => item.nickname,
    },
    {
      key: 'default',
      header: t('기본 수단'),
      render: item => item.isDefault ? <span className="payment-default">{t('기본')}</span> : <button className="api-secondary" type="button" onClick={() => makeDefault(item.id)}>{t('기본으로 지정')}</button>,
    },
    {
      key: 'action',
      header: t('관리'),
      align: 'center',
      render: item => <button className="api-secondary" type="button" aria-label={`${item.nickname} ${t('삭제')}`} onClick={() => remove(item)}><FiTrash2 aria-hidden="true" /> {t('삭제')}</button>,
    },
  ]
  return <div className="service-page">
    <header className="service-page-heading"><span>PAYMENT SETTINGS</span><h1>{t('결제 정보')}</h1><p>{t('자주 사용하는 결제 정보를 데모로 관리하세요.')}</p></header>
    <aside className="payment-demo-note"><FiShield aria-hidden="true" /><p>{t('이 기능은 데모입니다. 카드사·끝 4자리·별칭만 현재 브라우저에 사용자별로 저장하며, 실제 결제나 예매 결제수단으로 사용되지 않습니다.')}</p></aside>
    <div className="service-section-heading"><h2>{t('등록한 결제 정보')}</h2><button className="api-secondary" type="button" onClick={open}><FiPlus aria-hidden="true" /> {t('결제 정보 추가')}</button></div>
    {error && <p className="api-error" role="alert">{error}</p>}
    <Grid className="payment-grid" columns={columns} data={methods} rowKey={item => item.id} caption={t('결제 정보')} emptyMessage={t('등록된 결제 정보가 없습니다.')} emptyDescription={t('카드사와 끝 4자리로 데모 결제 정보를 추가해보세요.')} emptyAction={<button className="api-secondary" type="button" onClick={open}>{t('결제 정보 추가')}</button>} />
    <dialog ref={dialog} className="service-post-dialog" aria-labelledby="payment-title"><button className="service-dialog-close" type="button" aria-label={t('닫기')} onClick={() => dialog.current?.close()}><FiX /></button><h2 id="payment-title">{t('결제 정보 추가')}</h2><p>{t('실제 카드번호, CVC, 비밀번호를 입력하지 마세요.')}</p>
      <form className="content-editor" noValidate onSubmit={event => {
        event.preventDefault(); add()
      }}><label>{t('카드사')}<select value={form.issuer} onChange={event => setForm({
          ...form,
          issuer: event.target.value,
        })}>{demoCardIssuers.map(issuer => <option key={issuer} value={issuer}>{t(issuer)}</option>)}</select></label><label>{t('카드 끝 4자리')}<input inputMode="numeric" autoComplete="off" maxLength={4} value={form.last4} onChange={event => setForm({
          ...form,
          last4: event.target.value.replace(/\D/g, ''),
        })} /></label><label>{t('별칭')}<input maxLength={30} autoComplete="off" value={form.nickname} onChange={event => setForm({
          ...form,
          nickname: event.target.value,
        })} placeholder={t('예: 공연 예매용')} /></label>{formError && <p className="api-error" role="alert">{formError}</p>}<footer className="dialog-actions"><button className="dialog-button dialog-button--secondary" type="button" onClick={() => dialog.current?.close()}>{t('닫기')}</button><button type="submit" className="dialog-button dialog-button--primary">{t('추가')}</button></footer></form>
    </dialog>
  </div>
}
export default Payments
