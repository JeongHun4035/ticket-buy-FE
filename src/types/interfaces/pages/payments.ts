export interface DemoPaymentMethod {
  id: string,
  issuer: string,
  last4: string,
  nickname: string,
  isDefault: boolean,
  createdAt: string,
}
export interface DemoPaymentForm {
  issuer: string,
  last4: string,
  nickname: string,
}
