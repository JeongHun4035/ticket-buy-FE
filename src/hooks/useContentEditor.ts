import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getErrorMessage } from '@/api/client'
import { deleteContent, getContentInput, getContents, saveContent } from '@/api/contents'

import useApiQuery from './useApiQuery'
import useAuth from './useAuth'

import type { ContentInput } from '@/types/interfaces/api/contents'

const emptyInput = (): ContentInput => ({
  category: 'NOTICE',
  titles: {
    ko: '',
    en: '',
    'zh-CN': '',
  },
  bodies: {
    ko: '',
    en: '',
    'zh-CN': '',
  },
})
const useContentEditor = () => {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const [kind, setKind] = useState<'posts' | 'faqs'>('posts')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [id, setId] = useState<number | undefined>()
  const [input, setInput] = useState<ContentInput>(emptyInput)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const language = i18n.resolvedLanguage
  const load = useCallback((signal: AbortSignal) => getContents(kind, '', page, limit, signal, language ?? 'ko'), [
    kind,
    page,
    limit,
    language,
  ])
  const list = useApiQuery(load)
  const edit = async (itemId?: number) => {
    if (busy) return
    setBusy(true); setError('')
    try {
      setId(itemId); setInput(itemId ? await getContentInput(kind, itemId) : emptyInput()); dialog.current?.showModal()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const save = async () => {
    setBusy(true); setError('')
    try {
      await saveContent(kind, input, id); dialog.current?.close(); list.reload()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const remove = async (itemId: number) => {
    if (!window.confirm(t('선택한 콘텐츠를 삭제하시겠습니까?'))) return
    setBusy(true); setError('')
    try {
      await deleteContent(kind, itemId); setPage(1); list.reload()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return {
    auth,
    kind,
    setKind,
    page,
    setPage,
    limit,
    setLimit,
    id,
    input,
    setInput,
    busy,
    error,
    dialog,
    list,
    edit,
    save,
    remove,
  }
}
export default useContentEditor
