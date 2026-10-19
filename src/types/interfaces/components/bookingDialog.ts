import type { Performance } from '../api/events'
import type { QueueEntry } from '../api/queue'
import type { TicketEvent } from '../pages/main'

export interface BookingDialogProps {
  event: TicketEvent,
  onClose: () => void,
}
export interface SeatBookingProps extends BookingDialogProps {
  performance: Performance,
  admission: QueueEntry,
}
