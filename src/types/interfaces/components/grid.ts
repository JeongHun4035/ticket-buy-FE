import type { CSSProperties, Key, ReactNode } from 'react'

export interface GridColumn<T> {
  key: string,
  header: ReactNode,
  render: (row: T, index: number) => ReactNode,
  width?: CSSProperties['width'],
  align?: 'left' | 'center' | 'right',
}

export interface GridProps<T> {
  columns: readonly GridColumn<T>[],
  data: readonly T[],
  rowKey: (row: T) => Key,
  caption?: string,
  loading?: boolean,
  emptyMessage?: string,
  footer?: ReactNode,
  className?: string,
}
