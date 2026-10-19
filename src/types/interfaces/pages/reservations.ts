import type { Reservation } from '../api/reservations'
import type { RefObject } from 'react'

export interface ReservationDetailProps {
  dialog: RefObject<HTMLDialogElement | null>,
  selected: Reservation | null,
  busy: boolean,
  error: string,
  onClose: () => void,
  onCancel: () => Promise<void>,
}
