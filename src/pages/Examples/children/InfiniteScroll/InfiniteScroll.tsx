import { useState } from 'react'

import InfiniteScroll from '@/components/common/InfiniteScroll/InfiniteScroll'

import './InfiniteScroll.css'

const total = 80
const InfiniteScrollPage = () => {
  const [items, setItems] = useState<number[]>(Array.from({ length: 10 }, (_, index) => index + 1))
  const loadMore = async (): Promise<void> => {
    await new Promise<void>(resolve => setTimeout(resolve, 600))
    setItems(current => [...current, ...Array.from({ length: Math.min(10, total - current.length) }, (_, index) => current.length + index + 1)])
  }

  return (
    <section className="infinite-scroll-demo">
      <h1>Infinite Scroll</h1>
      <p>목록 높이의 80% 지점이 보이면 10개씩 추가합니다. 현재 {items.length} / {total}개</p>
      <InfiniteScroll dataLength={items.length} hasMore={items.length < total} onLoadMore={loadMore} threshold={0.8} height={480}>
        <ul className="infinite-scroll-demo__list">
          {items.map(item => <li key={item}><strong>항목 {String(item).padStart(2, '0')}</strong><p>자식 콘텐츠의 높이를 자동으로 측정합니다.</p>{item % 3 === 0 && <p>항목마다 높이가 달라도 스크롤 기준이 다시 계산됩니다.</p>}</li>)}
        </ul>
      </InfiniteScroll>
    </section>
  )
}

export default InfiniteScrollPage
