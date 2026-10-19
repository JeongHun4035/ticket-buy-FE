export interface QueueEntry {
  state: 'WAITING' | 'ADMITTED' | 'EXPIRED' | 'CANCELLED',
  ticketNumber: number,
  position: number,
  aheadCount: number,
  estimatedWaitSeconds: number | null,
  admissionToken: string | null,
  admissionExpiresAt: string | null,
  pollAfterSeconds: number,
}
