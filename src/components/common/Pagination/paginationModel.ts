const positiveInteger = (value: number, fallback: number) =>
  Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback

export const getPagination = (value: number, page: number, limit: number) => {
  const total = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  const pageLimit = positiveInteger(limit, 10)
  const pageCount = Math.max(1, Math.ceil(total / pageLimit))
  const currentPage = Math.min(positiveInteger(page, 1), pageCount)
  return {
    total,
    pageLimit,
    pageCount,
    currentPage,
    start: total === 0 ? 0 : (currentPage - 1) * pageLimit + 1,
    end: Math.min(currentPage * pageLimit, total),
  }
}

export const getPageItems = (page: number, count: number): (number | string)[] => {
  const visible = new Set([1, count])
  const start = Math.max(1, Math.min(page - 1, count - 3))
  const end = Math.min(count, Math.max(page + 1, 4))
  for (let item = start; item <= end; item++) visible.add(item)
  const pages = [...visible].sort((a, b) => a - b)
  const result: (number | string)[] = []
  pages.forEach((item, index) => {
    const previous = pages[index - 1]
    if (previous && item - previous === 2) result.push(previous + 1)
    else if (previous && item - previous > 2) result.push(`gap-${previous}`)
    result.push(item)
  })
  return result
}
