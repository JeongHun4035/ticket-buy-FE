import type { EventCreateInput } from '@/types/interfaces/api/adminEvents'
import type { EventDraft, PerformanceDraft } from '@/types/interfaces/pages/adminEvents'

export const newPerformance = (): PerformanceDraft => ({
  key: crypto.randomUUID(),
  venue: null,
  startsAt: '',
  opensAt: '',
  closesAt: '',
  sections: [],
})
export const newEventDraft = (): EventDraft => ({
  titles: {
    ko: '',
    en: '',
    'zh-CN': '',
  },
  descriptions: {
    ko: '',
    en: '',
    'zh-CN': '',
  },
  category: 'CONCERT',
  featuredRank: '0',
  performances: [newPerformance()],
})
export const safeSectionId = (id: string) => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) throw new Error('INVALID_SECTION')
  return Number(id)
}
// The form explicitly uses Asia/Seoul, independent of the browser's timezone.
export const seoulDateToISO = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error('INVALID_SCHEDULE')
  const date = new Date(value + ':00+09:00')
  if (!Number.isFinite(date.getTime()) || new Date(date.getTime() + 9 * 3600000).toISOString()
    .slice(0, 16) !== value) throw new Error('INVALID_SCHEDULE')
  return date.toISOString()
}
const integer = (value: string, max: number) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= max
const translations = (values: Record<string, string>, max: number) => {
  if (!values.ko?.trim() || Object.values(values).some(value => value.trim().length > max)) throw new Error('행사 제목과 설명을 확인해주세요.')
  const result: Record<string, string> = {}
  Object.entries(values).forEach(([key, value]) => {
    if (value.trim()) result[key] = value.trim()
  })
  return result
}
export const buildEventPayload = (draft: EventDraft, now = Date.now()): EventCreateInput => {
  if (!integer(draft.featuredRank, 100000)) throw new Error('추천 순위는 0~100000의 정수여야 합니다.')
  if (!draft.performances.length || draft.performances.length > 20) throw new Error('회차는 1~20개까지 등록할 수 있습니다.')
  return {
    titles: translations(draft.titles, 200),
    descriptions: translations(draft.descriptions, 20000),
    category: draft.category,
    featuredRank: Number(draft.featuredRank),
    performances: draft.performances.map(performance => {
      if (!performance.venue || !performance.sections.length) throw new Error('공연장과 판매 구역을 선택해주세요.')
      const startsAt = seoulDateToISO(performance.startsAt)
      const opensAt = seoulDateToISO(performance.opensAt)
      const closesAt = seoulDateToISO(performance.closesAt)
      if (!(Date.parse(opensAt) < Date.parse(closesAt) && Date.parse(closesAt) <= Date.parse(startsAt) && Date.parse(closesAt) > now && Date.parse(startsAt) > now)) throw new Error('INVALID_SCHEDULE')
      const seen = new Set<number>()
      return {
        venueId: performance.venue.id,
        startsAt,
        opensAt,
        closesAt,
        sectionPrices: performance.sections.map(item => {
          const sectionId = safeSectionId(item.section.id)
          if (seen.has(sectionId)) throw new Error('DUPLICATE_SECTION')
          seen.add(sectionId)
          if (!integer(item.price, 100000000)) throw new Error('가격은 0~100000000원의 정수여야 합니다.')
          return {
            sectionId,
            grade: item.grade,
            price: Number(item.price),
          }
        }),
      }
    }),
  }
}
export const validatePosterFile = async (file: File) => {
  if (!['image/png', 'image/jpeg'].includes(file.type)) throw new Error('UNSUPPORTED_IMAGE_TYPE')
  if (file.size > 5 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE')
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const png = [
    137,
    80,
    78,
    71,
    13,
    10,
    26,
    10,
  ].every((value, index) => bytes[index] === value)
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  if (!(file.type === 'image/png' ? png : jpeg)) throw new Error('INVALID_IMAGE')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('INVALID_IMAGE')
  }
  try {
    if (bitmap.width > 6000 || bitmap.height > 6000 || bitmap.width * bitmap.height > 20000000) throw new Error('IMAGE_DIMENSIONS_EXCEEDED')
  } finally {
    bitmap.close()
  }
}
