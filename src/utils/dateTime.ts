export const formatDate = (date: string, language = 'ko') => {
  const value = new Date(date)
  return Number.isNaN(value.getTime()) ? date : new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
  }).format(value)
}

export const formatDateOnly = (date: string) => {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return date
  const parts = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).formatToParts(value)
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? ''
  return [
    part('year'),
    part('month'),
    part('day'),
  ].join('-')
}
