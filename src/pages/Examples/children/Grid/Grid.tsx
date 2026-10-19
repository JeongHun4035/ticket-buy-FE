import { useState } from 'react'

import Grid from '@/components/common/Grid/Grid'
import Pagination from '@/components/common/Pagination/Pagination.tsx'
import { getPagination } from '@/components/common/Pagination/paginationModel'
import { formatNumber } from '@/utils/number'

import type { GridColumn } from '@/types/interfaces/components'
import type { Member } from '@/types/interfaces/pages/exampleGrid'

import './Grid.css'

const names = [
  '김민준',
  '이서연',
  '박지호',
  '최수빈',
  '정하윤',
  '강도현',
]
const teams = [
  '디자인',
  '개발',
  '운영',
]
const members: Member[] = Array.from({ length: 128 }, (_, index) => ({
  id: index + 1,
  name: names[index % names.length] ?? '이름 없음',
  email: `member${index + 1}@example.com`,
  team: teams[index % teams.length] ?? '미배정',
  active: index % 4 !== 0,
  amount: (index + 1) * 12500,
}))

const columns: GridColumn<Member>[] = [
  {
    key: 'id',
    header: '번호',
    width: 70,
    render: row => <span className="grid-demo__muted">{String(row.id).padStart(3, '0')}</span>,
  },
  {
    key: 'name',
    header: '이름 / 이메일',
    render: row => (
      <div className="grid-demo__member">
        <span className="grid-demo__avatar" aria-hidden="true">{row.name.slice(0, 1)}</span>
        <div><strong>{row.name}</strong><span className="grid-demo__email">{row.email}</span></div>
      </div>
    ),
  },
  {
    key: 'team',
    header: '팀',
    render: row => row.team,
  },
  {
    key: 'status',
    header: '상태',
    render: row => <span className={`grid-demo__status${row.active ? ' grid-demo__status--active' : ''}`}><span aria-hidden="true">●</span> {row.active ? '활성' : '대기'}</span>,
  },
  {
    key: 'amount',
    header: '이용 금액',
    align: 'right',
    render: row => <span className="grid-demo__amount">{formatNumber(row.amount)}원</span>,
  },
]

const GridPage = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const { currentPage, pageLimit } = getPagination(members.length, page, limit)
  const rows = members.slice((currentPage - 1) * pageLimit, currentPage * pageLimit)

  return (
    <section className="grid-demo">
      <header className="grid-demo__header">
        <div><p className="grid-demo__eyebrow">COMPONENTS / DATA DISPLAY</p><h1>멤버 목록 <span>{members.length}</span></h1><p>Grid와 Pagination을 연결한 예제입니다. 페이지와 표시 개수를 변경해 보세요.</p></div>
        <span className="grid-demo__sample">샘플 데이터</span>
      </header>
      <Grid
        caption="멤버 목록"
        columns={columns}
        data={rows}
        rowKey={row => row.id}
        footer={<Pagination value={members.length} page={currentPage} limit={limit} onChange={(nextPage, nextLimit) => {
          setPage(nextPage); setLimit(nextLimit)
        }} />}
      />
    </section>
  )
}

export default GridPage
