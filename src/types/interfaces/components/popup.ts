import type {
  CSSProperties,
  ReactNode,
} from 'react'

export type PopupSize = 'sm' | 'md' | 'lg'

export interface PopupProps {
  isOpen: boolean,
  onClose: () => void,

  title?: ReactNode,
  children: ReactNode,
  footer?: ReactNode,

  size?: PopupSize,
  className?: string,
  contentClassName?: string,

  style?: CSSProperties,
  contentStyle?: CSSProperties,
}