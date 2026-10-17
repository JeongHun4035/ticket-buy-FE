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
