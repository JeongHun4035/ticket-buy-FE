import type { Seat } from '@/types/interfaces/components'

// 실제 공연장 배치 및 점유 정보는 예매 API 연결 시 교체합니다.
export const createExampleSeats = (basePrice: number): Seat[] =>
  Array.from({ length: 8 }, (_, rowIndex) =>
    Array.from({ length: 12 }, (_, columnIndex): Seat => {
      const row = String.fromCharCode(65 + rowIndex)
      const grade = rowIndex < 2 ? 'VIP' : rowIndex < 5 ? 'R' : 'S'
      return {
        id: `${row}-${columnIndex + 1}`,
        row,
        number: columnIndex + 1,
        grade,
        price: basePrice + (grade === 'VIP' ? 40000 : grade === 'R' ? 20000 : 0),
        reserved: (rowIndex * 12 + columnIndex) % 7 === 3 || (rowIndex * 12 + columnIndex) % 11 === 5,
      }
    })).flat()

// Isolated preview data; never submit these IDs to booking APIs.
export const createVenueExampleSeats = (capacity: number): Seat[] =>
  Array.from({ length: capacity }, (_, index) => {
    const block = Math.floor(index / 200)
    const offset = index % 200
    const grade = block % 3 === 0 ? 'VIP' : block % 3 === 1 ? 'R' : 'S'
    return {
      id: 'preview-' + index,
      section: String(block + 1).padStart(3, '0'),
      row: String.fromCharCode(65 + Math.floor(offset / 20)),
      number: offset % 20 + 1,
      grade,
      price: grade === 'VIP' ? 150000 : grade === 'R' ? 120000 : 90000,
      reserved: index % 7 === 3,
    }
  })
