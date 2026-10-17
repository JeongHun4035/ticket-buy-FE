/** 국내 휴대폰 번호에 하이픈을 추가합니다. 빈 값은 빈 문자열, 지원하지 않는 형식은 원문을 반환합니다. */
export const formatPhoneNumber = (value: string | null | undefined): string => {
  if (value == null || value.trim() === '') return ''

  const trimmed = value.trim()
  const digits = trimmed.replace(/[\s-]/g, '')

  const match = digits.match(/^(01[016789])(\d{3,4})(\d{4})$/)
  return match ? `${match[1]}-${match[2]}-${match[3]}` : trimmed
}
