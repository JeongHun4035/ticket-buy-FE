export interface ApiQueryRequest<T> {
  load: (signal: AbortSignal) => Promise<T>,
  version: number,
  controller: AbortController,
  promise: Promise<T>,
  abortTimer: ReturnType<typeof setTimeout> | null,
}
