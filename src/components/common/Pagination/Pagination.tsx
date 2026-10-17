import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'

import Select from '@/components/common/Select/Select'


import { getPageItems, getPagination } from './paginationModel'

import type { PaginationProps } from '@/types/interfaces/components'

import './Pagination.css'

const Pagination = ({
  value, page, limit, pageLimitOptions = [
    10,
    20,
    50,
    100,
  ], onChange, disabled = false, className = '',
}: PaginationProps) => {
  const { t } = useTranslation()
  const [internalPage, setInternalPage] = useState(1)
  const [internalLimit, setInternalLimit] = useState(10)
  const { total, pageLimit, pageCount, currentPage, start, end } = getPagination(value, page ?? internalPage, limit ?? internalLimit)
  const limits = [...new Set([...pageLimitOptions, pageLimit])]
    .filter(item => Number.isSafeInteger(item) && item > 0)
    .sort((a, b) => a - b)

  const change = (nextPage: number, nextLimit = pageLimit) => {
    if (disabled) return
    if (page === undefined) setInternalPage(nextPage)
    if (limit === undefined) setInternalLimit(nextLimit)
    onChange?.(nextPage, nextLimit)
  }

  return (
    <div className={`common-pagination ${className}`}>
      <p className="common-pagination__summary" aria-live="polite">
        {t('전체 {{total}}개 · {{start}}–{{end}} 표시', {
          total,
          start,
          end,
        })}
      </p>
      <div className="common-pagination__controls">
        <Select
          label={t('페이지당')}
          className="common-pagination__limit"
          value={pageLimit}
          disabled={disabled}
          options={limits.map(item => ({
            value: item,
            label: t('{{count}}개', { count: item }),
          }))}
          onChange={next => change(1, Number(next))}
        />
        <nav className="common-pagination__pages" aria-label={t('페이지 이동')}>
          <button type="button" aria-label={t('이전 페이지')} disabled={disabled || currentPage === 1} onClick={() => change(currentPage - 1)}><HiOutlineChevronLeft aria-hidden="true" /></button>
          {getPageItems(currentPage, pageCount).map(item => typeof item === 'number' ? (
            <button key={item} type="button" aria-label={t('{{page}}페이지', { page: item })} aria-current={item === currentPage ? 'page' : undefined} disabled={disabled || total === 0} onClick={() => change(item)}>{item}</button>
          ) : <span className="common-pagination__ellipsis" key={item} aria-hidden="true">…</span>)}
          <button type="button" aria-label={t('다음 페이지')} disabled={disabled || currentPage === pageCount} onClick={() => change(currentPage + 1)}><HiOutlineChevronRight aria-hidden="true" /></button>
        </nav>
      </div>
    </div>
  )
}

export default Pagination
