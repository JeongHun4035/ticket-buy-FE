import Pagination from '@/components/common/Pagination/Pagination.tsx'

import './Pagination.css'

const PaginationPage = () => (
  <section className="pagination-demo">
    <h1>Pagination</h1>
    <p>value에 전체 데이터 개수를 전달하면 페이지가 생성됩니다.</p>
    <div className="pagination-demo__card"><h2>전체 1,280개</h2><Pagination value={1280} /></div>
    <div className="pagination-demo__card"><h2>한 페이지 · 전체 7개</h2><Pagination value={7} /></div>
    <div className="pagination-demo__card"><h2>데이터 없음</h2><Pagination value={0} /></div>
    <div className="pagination-demo__card"><h2>로딩 중 · 비활성화</h2><Pagination value={1280} disabled /></div>
  </section>
)

export default PaginationPage
