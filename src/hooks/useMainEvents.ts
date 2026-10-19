import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { toTicketEvent } from '@/api/adapters'
import { getErrorMessage } from '@/api/client'
import { getCategories, getEvent, getEvents, getFeaturedEvents } from '@/api/events'

import useApiQuery from './useApiQuery'
import useAuth from './useAuth'
import useSearchQuery from './useSearchQuery'
import { useToast } from './useToast'

import type { TicketEvent } from '@/types/interfaces/pages/main'

const useMainEvents = () => {
  const { t, i18n } = useTranslation()
  const [category, setCategory] = useState('')
  const { input: query, setInput: setQuery, query: submittedQuery, submit } = useSearchQuery()
  const [sort, setSort] = useState('RECOMMENDED')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [selected, setSelected] = useState<TicketEvent | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [bookingEvent, setBookingEvent] = useState<TicketEvent | null>(null)
  const auth = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [actionError, setActionError] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const requestedEvent = searchParams.get('eventId')
  const language = i18n.resolvedLanguage ?? 'ko'
  const loadEvents = useCallback((signal: AbortSignal) => getEvents({
    q: submittedQuery.value,
    category,
    sort,
    page,
    pageSize: limit,
  }, signal, language), [
    submittedQuery,
    category,
    sort,
    page,
    limit,
    language,
  ])
  const list = useApiQuery(loadEvents)
  const loadFeatured = useCallback((signal: AbortSignal) => getFeaturedEvents(signal, language), [language])
  const featured = useApiQuery(loadFeatured)
  const categoryList = useApiQuery(getCategories)
  const categories = [
    {
      code: '',
      label: t('전체'),
    },
    ...(categoryList.data?.items ?? []).map(item => ({
      code: item.code,
      label: item.names[language] ?? item.names.ko ?? item.code,
    })),
  ]
  const rows = (list.data?.items ?? []).map(toTicketEvent)
  const featuredEvents = (featured.data?.items ?? []).map(toTicketEvent)
  const openEvent = async (event: TicketEvent) => {
    if (detailLoading) return
    setActionError('')
    setDetailLoading(true)
    try {
      setSelected(toTicketEvent(await getEvent(event.id)))
      dialog.current?.showModal()
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setDetailLoading(false)
    }
  }
  useEffect(() => {
    if (!requestedEvent || !/^\d+$/.test(requestedEvent) || !Number.isSafeInteger(Number(requestedEvent))) return undefined
    let active = true
    void getEvent(Number(requestedEvent)).then(event => {
      if (active) {
        setSelected(toTicketEvent(event)); dialog.current?.showModal()
      }
    })
      .catch((error: unknown) => {
        if (active) setActionError(getErrorMessage(error))
      })
    return () => {
      active = false
    }
  }, [requestedEvent, language])
  const reloadEvents = list.reload
  const reloadFeatured = featured.reload
  useEffect(() => {
    const reload = () => {
      reloadEvents(); reloadFeatured()
    }
    window.addEventListener('ticket-buy:events-updated', reload)
    return () => window.removeEventListener('ticket-buy:events-updated', reload)
  }, [reloadEvents, reloadFeatured])
  const startBooking = (event: TicketEvent) => {
    if (!auth.user) {
      toast(t('로그인이 필요합니다.'), { variant: 'info' })
      void navigate('/sign-in', { state: { from: '/' } }); return
    }
    setBookingEvent(event)
  }

  const submitSearch = () => {
    setPage(1)
    submit()
  }
  const retry = () => {
    list.reload()
    featured.reload()
    categoryList.reload()
    setActionError('')
  }
  return {
    category,
    setCategory,
    query,
    setQuery,
    submitSearch,
    sort,
    setSort,
    page,
    setPage,
    limit,
    setLimit,
    selected,
    setSelected,
    dialog,
    bookingEvent,
    setBookingEvent,
    actionError,
    language,
    list,
    featured,
    categoryList,
    categories,
    rows,
    featuredEvents,
    openEvent,
    startBooking,
    retry,
  }
}
export default useMainEvents
