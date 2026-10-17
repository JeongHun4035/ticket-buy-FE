import type { Key, ReactNode } from 'react'

export interface SliderProps<T> {
  items: readonly T[],
  getKey: (item: T) => Key,
  renderItem: (item: T, index: number) => ReactNode,
  label?: string,
  autoPlay?: boolean,
  interval?: number,
  className?: string,
}
