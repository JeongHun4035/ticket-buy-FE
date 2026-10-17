import type { Performance, QueueEntry } from '../api/ticket'
import type { TicketEvent } from '../pages/main'

export interface BookingDialogProps {
  event: TicketEvent,
  onClose: () => void,
}
export interface SeatBookingProps extends BookingDialogProps {
  performance: Performance,
  admission: QueueEntry,
}
