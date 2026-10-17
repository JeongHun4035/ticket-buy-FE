import dayjs from 'dayjs'

import type { ConfigType } from 'dayjs'

/* * 날짜를 지정한 형식으로 표시합니다. 빈 값이나 파싱할 수 없는 값은 빈 문자열을 반환합니다. */
export const formatDate = (value: ConfigType, format = 'YYYY-MM-DD'): string => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return ''

  const date = dayjs(value)
  return date.isValid() ? date.format(format) : ''
}
