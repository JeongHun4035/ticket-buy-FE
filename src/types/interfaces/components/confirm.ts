import type {
  CSSProperties,
  ReactNode,
} from 'react'


export interface ConfirmProps {
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,

  title?: ReactNode,
  contents?: ReactNode,
  footer?: ReactNode,

  className?: string,
  contentClassName?: string,

  style?: CSSProperties,
  contentStyle?: CSSProperties,
}