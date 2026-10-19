export interface ApiPage<T> {
  items: T[],
  total: number,
  page: number,
  pageSize: number,
}
