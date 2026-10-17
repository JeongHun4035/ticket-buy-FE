const numberFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 20,
})

/** 숫자를 세 자리마다 쉼표로 구분합니다. 빈 값이나 유한하지 않은 숫자는 빈 문자열을 반환합니다. */
export const formatNumber = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value)) return ''

  return numberFormatter.format(value)
}
