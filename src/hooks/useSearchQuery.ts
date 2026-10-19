import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Typing is local; only an explicit submission changes API query dependencies. */
const useSearchQuery = (defaultLimit = 10) => {
  const [params, setParams] = useSearchParams()
  const value = params.get('q') ?? ''
  const query = useMemo(() => ({ value }), [value])
  const [draft, setDraft] = useState({
    value,
    input: value,
  })
  const input = draft.value === value ? draft.input : value
  const setInput = (next: string) => setDraft({
    value,
    input: next,
  })
  const positiveInteger = (key: string, fallback: number) => {
    const raw = params.get(key) ?? ''
    const number = Number(raw)
    return /^\d+$/.test(raw) && Number.isSafeInteger(number) && number > 0 ? number : fallback
  }
  const update = (changes: Record<string, string | number>) => {
    const next = new URLSearchParams(params)
    for (const [key, item] of Object.entries(changes)) {
      if (item === '' || (key === 'page' && item === 1) || (key === 'pageSize' && item === defaultLimit) || (key === 'sort' && item === 'RECOMMENDED')) next.delete(key)
      else next.set(key, String(item))
    }
    setParams(next)
  }

  const submit = () => {
    const trimmed = input.trim()
    setDraft({
      value: trimmed,
      input: trimmed,
    })
    update({
      q: trimmed,
      page: 1,
    })
  }

  return {
    input,
    setInput,
    query,
    submit,
    page: positiveInteger('page', 1),
    limit: positiveInteger('pageSize', defaultLimit),
    category: params.get('category') ?? '',
    sort: [
      'RECOMMENDED',
      'DATE_ASC',
      'PRICE_ASC',
    ].includes(params.get('sort') ?? '') ? params.get('sort') as string : 'RECOMMENDED',
    setPage: (page: number) => update({ page }),
    setCategory: (category: string) => update({
      category,
      page: 1,
    }),
    setSort: (sort: string) => update({
      sort,
      page: 1,
    }),
    setPagination: (page: number, limit: number) => update({
      page: limit !== positiveInteger('pageSize', defaultLimit) ? 1 : page,
      pageSize: limit,
    }),
  }
}

export default useSearchQuery
