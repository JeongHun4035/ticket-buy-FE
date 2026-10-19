import type { Performance } from '../api/events'
import type { QueueEntry } from '../api/queue'
import type { TicketEvent } from '../pages/main'

export interface WaitingRoomProps {
  event: TicketEvent,
  performance: Performance,
  initialQueue: QueueEntry,
  onAdmit: (entry: QueueEntry) => void,
  onCancel: () => void,
}
