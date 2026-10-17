import type { BoardPost, FaqItem } from '@/types/interfaces/pages/support'

export const mockFaqs: readonly FaqItem[] = [
  {
    id: 1,
    question: '좌석은 어떻게 선택하나요?',
    answer: '행사 목록에서 예매하기를 누르면 무대와 좌석 배치를 확인할 수 있습니다. 현재는 최대 4석까지 선택하는 미리보기를 제공합니다.',
  },
  {
    id: 2,
    question: '실제 결제가 가능한가요?',
    answer: '현재는 예시 행사와 좌석을 이용한 화면 미리보기입니다. 실제 결제와 좌석 확보는 진행되지 않습니다.',
  },
  {
    id: 3,
    question: '언어와 테마는 어디서 바꾸나요?',
    answer: '헤더 오른쪽에서 한국어·영어·중국어와 라이트·다크 테마를 선택할 수 있습니다.',
  },
]

export const mockBoardPosts: readonly BoardPost[] = [
  {
    id: 3,
    category: '공지',
    title: '티켓바이 서비스 미리보기 안내',
    content: '티켓바이에 오신 것을 환영합니다. 현재 표시되는 행사와 좌석, 회사 정보는 서비스 디자인 확인을 위한 예시 데이터입니다.',
    date: '2026.10.18',
  },
  {
    id: 2,
    category: '이용안내',
    title: '좌석 선택 기능 이용 안내',
    content: '행사 목록의 예매하기 버튼으로 좌석 선택 화면을 열어보세요. 등급별 좌석을 선택하고 합계 금액을 확인할 수 있습니다.',
    date: '2026.10.17',
  },
  {
    id: 1,
    category: '업데이트',
    title: '다국어 및 다크 테마 지원 안내',
    content: '한국어, 영어, 중국어 간체와 다크 테마를 지원합니다. 선택한 언어와 테마는 다음 방문에도 유지됩니다.',
    date: '2026.10.16',
  },
]
