import type { AdminVenue, AdminVenueSection, EventCreateInput } from '../api/adminEvents'

export interface SectionPriceDraft {
  section: AdminVenueSection,
  grade: 'VIP' | 'R' | 'S',
  price: string,
}
export interface PerformanceDraft {
  key: string,
  venue: AdminVenue | null,
  startsAt: string,
  opensAt: string,
  closesAt: string,
  sections: SectionPriceDraft[],
}
export interface EventDraft {
  titles: Record<string, string>,
  descriptions: Record<string, string>,
  category: EventCreateInput['category'],
  featuredRank: string,
  performances: PerformanceDraft[],
}
export interface PerformanceFieldsProps {
  value: PerformanceDraft,
  index: number,
  onChange: (value: PerformanceDraft) => void,
  onRemove: () => void,
  removable: boolean,
}
