import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import { deleteContent, getContentInput, getContents, saveContent } from '@/api/ticket'
import Pagination from '@/components/common/Pagination/Pagination'
import useApiQuery from '@/hooks/useApiQuery'
import useAuth from '@/hooks/useAuth'

import type { ContentInput } from '@/types/interfaces/api/ticket'

import '../Support/Support.css'

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
const Admin = () => {
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
  return <div className="service-page"><header className="service-page-heading"><span>CONTENT MANAGEMENT</span><h1>{t('콘텐츠 관리')}</h1><p>{t('등록·수정·삭제는 관리자 권한이 필요합니다.')}</p></header>
    <Link className="api-secondary" to="/admin/events/new">{t('행사 등록')}</Link>
    {!auth.user ? <Link to="/sign-in">{t('로그인이 필요합니다.')}</Link> : <>
      <div className="service-section-heading"><select aria-label={t('분류')} value={kind} onChange={event => {
        setKind(event.target.value as 'posts' | 'faqs'); setPage(1)
      }}><option value="posts">{t('게시판')}</option><option value="faqs">FAQ</option></select><button className="api-secondary" type="button" disabled={busy} onClick={() => {
        void edit()
      }}>{t('새 글 작성')}</button></div>
      {(list.error || error) && <p className="api-error" role="alert">{list.error || error}</p>}
      {list.loading && <p>{t('불러오는 중')}</p>}
      {list.data?.items.map(item => <article className="reservation-card" key={item.id}><strong>{item.title}</strong><div><button className="api-secondary" type="button" disabled={busy} onClick={() => {
        void edit(item.id)
      }}>{t('수정')}</button><button className="api-secondary" type="button" disabled={busy} onClick={() => {
        void remove(item.id)
      }}>{t('삭제')}</button></div></article>)}
      <Pagination value={list.data?.total ?? 0} page={page} limit={limit} onChange={(next, size) => {
        setPage(next); setLimit(size)
      }} />
    </>}
    <dialog ref={dialog} className="service-post-dialog" aria-labelledby="editor-title" onCancel={event => {
      if (busy) event.preventDefault()
    }}><h2 id="editor-title">{t(id ? '수정' : '새 글 작성')}</h2><form className="content-editor" onSubmit={event => {
        event.preventDefault(); if (!busy) void save()
      }}>
        <label>{t('분류')}<select value={input.category} onChange={event => setInput({
          ...input,
          category: event.target.value as ContentInput['category'],
        })}>{([
            'NOTICE',
            'GUIDE',
            'UPDATE',
          ] as const).map(category => <option key={category} value={category}>{t(category)}</option>)}</select></label>
        {[
          'ko',
          'en',
          'zh-CN',
        ].map(lang => <fieldset key={lang} disabled={busy}><legend>{lang}</legend><label>{t('제목')}<input required maxLength={200} value={input.titles[lang] ?? ''} onChange={event => setInput({
          ...input,
          titles: {
            ...input.titles,
            [lang]: event.target.value,
          },
        })} /></label><label>{t('내용')}<textarea required value={input.bodies[lang] ?? ''} onChange={event => setInput({
          ...input,
          bodies: {
            ...input.bodies,
            [lang]: event.target.value,
          },
        })} /></label></fieldset>)}
        {error && <p className="api-error" role="alert">{error}</p>}
        <button className="event-detail-book" type="submit" disabled={busy}>{t(busy ? '처리 중' : '저장')}</button><button className="api-secondary" type="button" disabled={busy} onClick={() => dialog.current?.close()}>{t('닫기')}</button>
      </form></dialog>
  </div>
}
export default Admin
