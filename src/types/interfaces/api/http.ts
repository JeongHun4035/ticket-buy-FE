export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  params?: Record<string, string | number | boolean | null | undefined>,
  /** JSON 데이터 또는 multipart FormData */
  body?: unknown,
  headers?: Record<string, string>,
  signal?: AbortSignal,
  timeout?: number,
  retryAuth?: boolean,
}

