import type { Performance, QueueEntry } from '../api/ticket'
import type { TicketEvent } from '../pages/main'

export interface WaitingRoomProps {
  event: TicketEvent,
  performance: Performance,
  initialQueue: QueueEntry,
  onAdmit: (entry: QueueEntry) => void,
  onCancel: () => void,
}
