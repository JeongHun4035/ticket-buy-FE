import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiCreditCard, FiPlus, FiShield, FiTrash2, FiX } from 'react-icons/fi'

import Grid from '@/components/common/Grid/Grid'
import useAuth from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { demoCardIssuers, loadDemoPayments, saveDemoPayments } from '@/services/demoPayments'

import type { GridColumn } from '@/types/interfaces/components'
import type { DemoPaymentForm, DemoPaymentMethod } from '@/types/interfaces/pages/payments'

import '../Support/Support.css'
import './Payments.css'

const Payments = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const userId = user?.id
  const { toast } = useToast()
  const dialog = useRef<HTMLDialogElement>(null)
  const [methods, setMethods] = useState<DemoPaymentMethod[]>([])
  const [form, setForm] = useState<DemoPaymentForm>({
    issuer: demoCardIssuers[0],
    last4: '',
    nickname: '',
  })
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setMethods([])
    if (!userId) return
    try {
      setMethods(loadDemoPayments(userId)); setError('')
    } catch {
      setError(t('브라우저 저장소의 결제 정보를 불러올 수 없습니다.'))
    }
  }, [userId, t])

  const persist = (next: DemoPaymentMethod[]) => {
    if (!user) return false
    try {
      saveDemoPayments(user.id, next); setMethods(next); setError(''); return true
    } catch {
      setError(t('브라우저 저장소에 저장할 수 없습니다.')); return false
    }
  }
  const open = () => {
    setForm({
      issuer: demoCardIssuers[0],
      last4: '',
      nickname: '',
    })
    setFormError('')
    dialog.current?.showModal()
  }
  const add = () => {
    if (!/^\d{4}$/.test(form.last4)) {
      setFormError(t('카드 끝 4자리를 숫자로 입력해주세요.')); return
    }
    const nickname = form.nickname.trim()
    if (!nickname || nickname.length > 30) {
      setFormError(t('별칭을 1~30자로 입력해주세요.')); return
    }
    if (methods.some(item => item.issuer === form.issuer && item.last4 === form.last4)) {
      setFormError(t('같은 카드사와 끝 4자리의 데모 정보가 이미 있습니다.')); return
    }
    const next: DemoPaymentMethod = {
      id: crypto.randomUUID(),
      issuer: form.issuer,
      last4: form.last4,
      nickname,
      isDefault: methods.length === 0,
      createdAt: new Date().toISOString(),
    }
    if (persist([...methods, next])) {
      dialog.current?.close(); toast(t('데모 결제 정보가 추가되었습니다.'), { variant: 'success' })
    } else setFormError(t('브라우저 저장소에 저장할 수 없습니다.'))
  }
  const makeDefault = (id: string) => {
    if (persist(methods.map(item => ({
      ...item,
      isDefault: item.id === id,
    })))) toast(t('기본 결제 정보가 변경되었습니다.'), { variant: 'success' })
  }
  const remove = (method: DemoPaymentMethod) => {
    if (!window.confirm(t('데모 결제 정보를 삭제하시겠습니까?'))) return
    const next = methods.filter(item => item.id !== method.id)
    if (method.isDefault && next[0]) next[0] = {
      ...next[0],
      isDefault: true,
    }
    if (persist(next)) toast(t('데모 결제 정보가 삭제되었습니다.'), { variant: 'success' })
  }
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
        })} placeholder={t('예: 공연 예매용')} /></label>{formError && <p className="api-error" role="alert">{formError}</p>}<button type="submit" className="event-detail-book">{t('추가')}</button><button className="api-secondary" type="button" onClick={() => dialog.current?.close()}>{t('닫기')}</button></form>
    </dialog>
  </div>
}
export default Payments
