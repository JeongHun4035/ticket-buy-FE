import type { ApiEvent, ApiPage, Performance } from './ticket'

export interface AdminVenue {
  id: number,
  name: string,
  capacity: number,
  mapWidth: number,
  mapHeight: number,
}
export interface AdminVenueSection {
  id: string,
  name: string,
  floor: string,
  floorId: string,
  totalSeats: number,
  x: number,
  y: number,
  width: number,
  height: number,
  sortOrder: number,
}
export interface AdminVenueLayout extends ApiPage<AdminVenueSection> {
  venue: AdminVenue,
  floors: {
    id: string,
    name: string,
    level: number,
  }[],
}
export interface EventCreateInput {
  titles: Record<string, string>,
  descriptions: Record<string, string>,
  category: 'CONCERT' | 'MUSICAL' | 'THEATER' | 'EXHIBITION' | 'CLASSICAL',
  featuredRank: number,
  performances: {
    venueId: number,
    startsAt: string,
    opensAt: string,
    closesAt: string,
    sectionPrices: {
      sectionId: number,
      grade: 'VIP' | 'R' | 'S',
      price: number,
    }[],
  }[],
}
export interface EventCreated {
  event: ApiEvent,
  performances: Performance[],
}
