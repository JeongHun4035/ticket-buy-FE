export const formatCurrency = (value: number, language = 'ko') =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
