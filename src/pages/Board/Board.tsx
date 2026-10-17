import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiSearch, FiX } from 'react-icons/fi'

import { formatDate } from '@/api/adapters'
import { getErrorMessage } from '@/api/client'
import { getContents, getPost } from '@/api/ticket'
import Grid from '@/components/common/Grid/Grid'
import Pagination from '@/components/common/Pagination/Pagination'
import useApiQuery from '@/hooks/useApiQuery'

import type { ApiContent } from '@/types/interfaces/api/ticket'
import type { GridColumn } from '@/types/interfaces/components'

import '../Support/Support.css'

const Board = () => {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<ApiContent | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const language = i18n.resolvedLanguage
  const load = useCallback((signal: AbortSignal) => getContents('posts', query, page, limit, signal, language ?? 'ko'), [
    query,
    page,
    limit,
    language,
  ])
  const posts = useApiQuery(load)
  const open = async (id: number) => {
    if (busy) return
    setBusy(true); setError('')
    try {
      setSelected(await getPost(id)); dialog.current?.showModal()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const columns: GridColumn<ApiContent>[] = [
    {
      key: 'id',
      header: t('번호'),
      width: 70,
      render: post => post.id,
    },
    {
      key: 'category',
      header: t('분류'),
      width: 110,
      render: post => <span className="service-post-category">{t(post.category)}</span>,
    },
    {
      key: 'title',
      header: t('제목'),
      render: post => <button disabled={busy} className="service-post-title" type="button" onClick={() => {
        void open(post.id)
      }}>{post.title}</button>,
    },
    {
      key: 'date',
      header: t('등록일'),
      width: 180,
      render: post => formatDate(post.date, language),
    },
  ]
  return <div className="service-page">
    <header className="service-page-heading"><span>NEWS & NOTICE</span><h1>{t('게시판')}</h1><p>{t('티켓바이의 새로운 소식과 이용 안내를 확인하세요.')}</p></header>
    <div className="service-section-heading"><h2>{t('공지 및 소식')}</h2><label className="service-search"><FiSearch aria-hidden="true" /><input maxLength={100} value={query} onChange={event => {
      setQuery(event.target.value); setPage(1)
    }} placeholder={t('게시글 검색')} aria-label={t('게시글 검색')} /></label></div>
    {(posts.error || error) && <div className="api-error" role="alert">{posts.error || error}<button type="button" onClick={posts.reload}>{t('다시 시도')}</button></div>}
    <Grid loading={posts.loading} className="service-board" columns={columns} data={posts.data?.items ?? []} rowKey={post => post.id} caption={t('게시판')} emptyMessage={t('검색 결과가 없습니다.')} footer={<Pagination value={posts.data?.total ?? 0} page={page} limit={limit} onChange={(next, size) => {
      setPage(next); setLimit(size)
    }} />} />
    <dialog ref={dialog} className="service-post-dialog" aria-labelledby="post-title" onClose={() => setSelected(null)}><button className="service-dialog-close" type="button" aria-label={t('닫기')} onClick={() => dialog.current?.close()}><FiX /></button>{selected && <><span className="service-post-category">{t(selected.category)} · {formatDate(selected.date, language)}</span><h2 id="post-title">{selected.title}</h2><p>{selected.content}</p></>}</dialog>
  </div>
}
export default Board
