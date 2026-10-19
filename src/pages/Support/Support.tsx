import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FiHeadphones } from 'react-icons/fi'

import { getContents } from '@/api/contents'
import { getSupportInfo } from '@/api/support'
import Pagination from '@/components/common/Pagination/Pagination'
import SearchField from '@/components/common/SearchField/SearchField'
import useApiQuery from '@/hooks/useApiQuery'
import useSearchQuery from '@/hooks/useSearchQuery'

import './Support.css'

const Support = () => {
  const { t, i18n } = useTranslation()
  const { input: query, setInput: setQuery, query: submittedQuery, submit, page, limit, setPagination } = useSearchQuery()
  const language = i18n.resolvedLanguage
  const load = useCallback((signal: AbortSignal) => getContents('faqs', submittedQuery.value, page, limit, signal, language ?? 'ko'), [
    submittedQuery,
    page,
    limit,
    language,
  ])
  const faqs = useApiQuery(load)
  const support = useApiQuery(getSupportInfo)
  return <div className="service-page">
    <header className="service-page-heading"><span>HELP CENTER</span><h1>{t('고객센터')}</h1><p>{t('궁금한 내용을 빠르게 찾아보세요.')}</p></header>
    <section className="service-contact"><FiHeadphones aria-hidden="true" /><div><h2>{support.data?.serviceName ?? t('고객센터')}</h2>{support.data?.phone && <strong>{support.data.phone}</strong>}<p>{support.data?.message}</p></div>{support.data?.email && <span>{support.data.email}</span>}</section>
    <div className="service-section-heading"><h2>{t('자주 묻는 질문')}</h2><SearchField className="service-search" value={query} onChange={setQuery} onSearch={() => {
      submit()
    }} label={t('질문 검색')} placeholder={t('질문 검색')} /></div>
    {(faqs.error || support.error) && <div className="api-error" role="alert">{faqs.error || support.error}<button type="button" onClick={() => {
      faqs.reload(); support.reload()
    }}>{t('다시 시도')}</button></div>}
    {faqs.loading ? <p role="status">{t('불러오는 중')}</p> : <div className="service-faqs">{faqs.data?.items.map(item => <details key={item.id}><summary>{item.title}</summary><p>{item.content}</p></details>)}{faqs.data?.total === 0 && <p className="service-empty" role="status">{t('검색 결과가 없습니다.')}</p>}</div>}
    <div className="api-pagination"><Pagination value={faqs.data?.total ?? 0} page={page} limit={limit} onChange={(next, size) => {
      setPagination(next, size)
    }} /></div>
  </div>
}
export default Support
