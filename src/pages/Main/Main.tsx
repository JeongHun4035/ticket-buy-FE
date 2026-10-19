import { useTranslation } from 'react-i18next'
import { FiArrowDown, FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi'

import BookingFlow from '@/components/booking/BookingFlow'
import EventImage from '@/components/common/EventImage/EventImage'
import Grid from '@/components/common/Grid/Grid'
import Pagination from '@/components/common/Pagination/Pagination'
import SearchField from '@/components/common/SearchField/SearchField'
import Slider from '@/components/common/Slider/Slider'
import useMainEvents from '@/hooks/useMainEvents'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/dateTime'

import EventDetail from './children/EventDetail/EventDetail'
import EventPoster from './children/EventPoster/EventPoster'

import './Main.css'

import type { GridColumn } from '@/types/interfaces/components'
import type { TicketEvent } from '@/types/interfaces/pages/main'

const Main: React.FC = () => {
  const { t, i18n } = useTranslation()
  const money = (value: number) => formatCurrency(value, i18n.resolvedLanguage)
  const {
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
  } = useMainEvents()
  const columns: GridColumn<TicketEvent>[] = [
    {
      key: 'event',
      header: t('공연 / 행사'),
      width: '48%',
      render: event => (
        <button className="event-info" type="button" onClick={() => {
          void openEvent(event)
        }}>
          <EventPoster event={event} />
          <span className="event-info-copy"><span className="event-category">{t(event.category)}</span><strong>{t(event.title)}</strong><span className="event-venue"><FiMapPin aria-hidden="true" />{t(event.venue)}</span></span>
        </button>
      ),
    },
    {
      key: 'date',
      header: t('관람 일정'),
      render: event => <span className="event-date">{formatDate(event.date, language)}</span>,
    },
    {
      key: 'price',
      header: t('티켓 가격'),
      render: event => <span className="event-price">{money(event.price)}<small>{t('부터')}</small></span>,
    },
    {
      key: 'booking',
      header: t('예매'),
      align: 'center',
      render: event => <button className={`event-book ${event.status !== '예매중' ? 'event-book--soon' : ''}`} type="button" disabled={event.status !== '예매중'} onClick={() => startBooking(event)}>{event.status === '예매중' ? t('예매하기') : t(event.status)}<FiArrowRight aria-hidden="true" /></button>,
    },
  ]

  return (
    <div className="ticket-main">
      {(list.error || actionError || featured.error || categoryList.error) && <div className="api-error" role="alert">{list.error || actionError || featured.error || categoryList.error}<button type="button" onClick={retry}>{t('다시 시도')}</button></div>}
      <section className="ticket-hero" aria-labelledby="hero-title">
        <div className="ticket-hero-copy"><span className="ticket-kicker">CURATED FOR YOUR NEXT MOMENT</span><h1 id="hero-title">{t('일상 너머의 설렘,')}<br />{t('다음 무대를 만나세요.')}</h1><p>{t('좋아하는 아티스트의 무대부터 새로운 영감의 전시까지.')}<br />{t('당신을 기다리는 특별한 순간을 발견하세요.')}</p><a href="#event-list">{t('행사 둘러보기')}<FiArrowDown aria-hidden="true" /></a><span className="ticket-hero-number">01 / YOUR NEXT EXPERIENCE</span></div>
        <Slider items={featuredEvents} getKey={event => event.id} label={t('핵심 추천 행사')} renderItem={event => (
          <button className="ticket-feature" type="button" onClick={() => {
            void openEvent(event)
          }} aria-label={t('{{title}} 상세 보기', { title: t(event.title) })}>
            <EventImage className="ticket-feature-image" src={event.posterUrl} title={event.title} />
            <span className="ticket-feature-badge">EDITOR’S PICK · {t(event.category)}</span>
            <span className="ticket-feature-title">{event.headline}<small>{t(event.title)}</small></span>
            <span className="ticket-feature-bottom"><span>{formatDate(event.date, language)}<br /><small>{t(event.venue)}</small></span><span className="ticket-feature-arrow"><FiArrowRight aria-hidden="true" /></span></span>
          </button>
        )} />
      </section>
      <section className="ticket-discovery" id="event-list" aria-labelledby="event-list-title">
        <div className="ticket-section-heading"><div><span className="ticket-kicker">FIND YOUR TICKET</span><h2 id="event-list-title">{t('어떤 순간을 찾고 있나요?')}</h2><p>{t('취향에 맞는 공연과 행사를 한곳에서 만나보세요.')}</p></div></div>
        <div className="ticket-toolbar"><div className="ticket-categories" role="group" aria-label={t('행사 장르')}>{categories.map(item => <button type="button" key={item.code} aria-pressed={category === item.code} onClick={() => {
          setCategory(item.code); setPage(1)
        }}>{item.label}</button>)}</div><SearchField className="ticket-search" value={query} onChange={setQuery} onSearch={submitSearch} label={t('공연명 또는 장소 검색')} placeholder={t('공연명, 장소 검색')} /></div>
        <div className="ticket-results"><p>{t('전체 {{count}}개의 행사', { count: list.data?.total ?? 0 })}</p><label>{t('정렬')}<select value={sort} onChange={event => {
          setSort(event.target.value); setPage(1)
        }}><option value="RECOMMENDED">{t('추천순')}</option><option value="DATE_ASC">{t('공연일순')}</option><option value="PRICE_ASC">{t('낮은 가격순')}</option></select></label></div>
        <Grid loading={list.loading} columns={columns} data={rows} rowKey={event => event.id} caption={t('예매 가능한 공연 및 행사 목록')} emptyMessage={t('검색 결과가 없습니다. 다른 검색어나 장르를 선택해주세요.')} className="ticket-event-grid" footer={<Pagination value={list.data?.total ?? 0} page={page} limit={limit} pageLimitOptions={[
          6,
          12,
          24,
        ]} onChange={(nextPage, nextLimit) => {
          setPage(nextPage); setLimit(nextLimit)
        }} />} />
        <p className="ticket-data-note">{t('행사 정보와 좌석은 서버에서 실시간으로 조회합니다.')}</p>
      </section>
      <aside className="ticket-bottom-note"><FiCalendar aria-hidden="true" /><div><strong>{t('기다리는 순간이, 특별한 기억이 되도록.')}</strong><p>{t('티켓바이와 함께 나만의 관람 일정을 만들어보세요.')}</p></div><span>TICKET BUY</span></aside>
      {bookingEvent && <BookingFlow key={bookingEvent.id} event={bookingEvent} onClose={() => setBookingEvent(null)} />}
      <EventDetail selected={selected} dialog={dialog} onClose={() => setSelected(null)} onBook={startBooking} />
    </div>
  )
}

export default Main
