import type { PopupSize } from '../components/popup'
import type { CSSProperties } from 'react'

export type PopupSampleId = PopupSize | 'custom'

export interface PopupSample {
  id: PopupSampleId,
  title: string,
  size?: PopupSize,
  className?: string,
  style?: CSSProperties,
}
