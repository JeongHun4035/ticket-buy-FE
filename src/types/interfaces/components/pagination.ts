export interface PaginationProps {
  /** Total record count, not the number of pages. */
  value: number,
  page?: number,
  limit?: number,
  pageLimitOptions?: readonly number[],
  /** Called once with page 1 and the new limit when the Select changes. */
  onChange?: (page: number, limit: number) => void,
  disabled?: boolean,
  className?: string,
}
