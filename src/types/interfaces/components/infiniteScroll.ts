import type { CSSProperties, ReactNode } from 'react'

export interface InfiniteScrollProps {
  children: ReactNode,
  /** 현재까지 로드한 항목 수. 새 데이터가 추가되어야 다음 자동 요청이 허용됩니다. */
  dataLength: number,
  hasMore: boolean,
  /** 데이터 추가가 완료되면 resolve, 실패하면 reject하는 비동기 함수입니다. */
  onLoadMore: () => Promise<void>,
  /** 보이는 영역 하단이 콘텐츠 높이의 어느 비율에 도달하면 요청할지 지정합니다. */
  threshold?: number,
  height?: CSSProperties['height'],
  disabled?: boolean,
  loader?: ReactNode,
  endMessage?: ReactNode,
  className?: string,
  label?: string,
}
