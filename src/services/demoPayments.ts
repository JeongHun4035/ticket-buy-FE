import type { DemoPaymentMethod } from '@/types/interfaces/pages/payments'

export const demoCardIssuers = [
  '신한카드',
  '삼성카드',
  '현대카드',
  'KB국민카드',
  '롯데카드',
  '하나카드',
  '우리카드',
  'BC카드',
  '기타',
] as const
const keyFor = (userId: string) => `ticket-buy-demo-payments:${encodeURIComponent(userId)}`
const isPaymentMethod = (item: unknown): item is DemoPaymentMethod => {
  if (!item || typeof item !== 'object') return false
  return 'id' in item && typeof item.id === 'string' && 'issuer' in item && typeof item.issuer === 'string' && 'last4' in item && typeof item.last4 === 'string' && /^\d{4}$/.test(item.last4) && 'nickname' in item && typeof item.nickname === 'string' && 'isDefault' in item && typeof item.isDefault === 'boolean' && 'createdAt' in item && typeof item.createdAt === 'string'
}
export const loadDemoPayments = (userId: string): DemoPaymentMethod[] => {
  const saved = localStorage.getItem(keyFor(userId))
  if (!saved) return []
  const parsed: unknown = JSON.parse(saved)
  if (!Array.isArray(parsed) || !parsed.every(isPaymentMethod)) throw new Error('저장된 결제 정보 형식을 확인해주세요.')
  return parsed
}
export const saveDemoPayments = (userId: string, methods: DemoPaymentMethod[]) => {
  if (!userId) throw new Error('로그인이 필요합니다.')
  localStorage.setItem(keyFor(userId), JSON.stringify(methods))
}
