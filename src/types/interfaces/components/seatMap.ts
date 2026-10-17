export interface Seat {
  id: string,
  row: string,
  number: number,
  grade: 'VIP' | 'R' | 'S',
  price: number,
  reserved: boolean,
  section?: string,
}

export interface SeatMapProps {
  seats: readonly Seat[],
  selectedIds: readonly string[],
  onChange: (selectedIds: string[]) => void,
  maxSelection?: number,
  disabled?: boolean,
}

export interface SeatMapFeedback {
  key: string,
  seat: Seat | null,
}

export interface SeatSection {
  id: string,
  name: string,
  seats: Seat[],
  available: number,
}
