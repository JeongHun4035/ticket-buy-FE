import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { demoCardIssuers, loadDemoPayments, saveDemoPayments } from '@/services/demoPayments'

import useAuth from './useAuth'
import { useToast } from './useToast'

import type { DemoPaymentForm, DemoPaymentMethod } from '@/types/interfaces/pages/payments'

const useDemoPayments = () => {
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

  return {
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
  }
}
export default useDemoPayments
