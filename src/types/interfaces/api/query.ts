export interface ApiQueryRequest<T> {
  load: (signal: AbortSignal) => Promise<T>,
  version: number,
  controller: AbortController,
  promise: Promise<T>,
  abortTimer: ReturnType<typeof setTimeout> | null,
}

export interface QueryState<T> {
  data: T | null,
  loading: boolean,
  error: string,
  failure?: unknown,
}
