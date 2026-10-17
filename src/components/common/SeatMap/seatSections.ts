import type { Seat, SeatSection } from '@/types/interfaces/components/seatMap'

export const SEATS_PER_SECTION = 200

// Preserve server IDs. Chunks are display blocks, not invented bookable seats.
export const groupSeatSections = (seats: readonly Seat[]): SeatSection[] => {
  const groups = new Map<string, Seat[]>()
  seats.forEach(seat => {
    const name = seat.section ?? ''
    const group = groups.get(name) ?? []
    group.push(seat)
    groups.set(name, group)
  })
  return [...groups].flatMap(([name, group], groupIndex) => {
    const sorted = [...group].sort((a, b) => a.row.localeCompare(b.row, undefined, { numeric: true }) || a.number - b.number)
    return Array.from({ length: Math.ceil(sorted.length / SEATS_PER_SECTION) }, (_, index) => {
      const items = sorted.slice(index * SEATS_PER_SECTION, (index + 1) * SEATS_PER_SECTION)
      return {
        id: JSON.stringify([name, index]),
        name: name ? (sorted.length > SEATS_PER_SECTION ? name + ' / ' + (index + 1) : name) : String(groupIndex + 1) + '-' + String(index + 1).padStart(2, '0'),
        seats: items,
        available: items.filter(seat => !seat.reserved).length,
      }
    })
  })
}
