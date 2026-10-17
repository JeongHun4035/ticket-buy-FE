import { useCallback, useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '@/api/client'

import type { ApiQueryRequest } from '@/types/interfaces/api/query'
import type { QueryState } from '@/types/interfaces/api/ticket'

const useApiQuery = <T = unknown>(load: (signal: AbortSignal) => Promise<T>) => {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: '',
  })
  const pending = useRef<ApiQueryRequest<T> | null>(null)
  const reload = useCallback(() => setVersion(value => value + 1), [])

  useEffect(() => {
    let active = true
    let entry = pending.current
    if (!entry || entry.load !== load || entry.version !== version || entry.controller.signal.aborted) {
      const controller = new AbortController()
      entry = {
        load,
        version,
        controller,
        promise: Promise.resolve().then(() => load(controller.signal)),
        abortTimer: null,
      }
      pending.current = entry
    }
    // StrictMode의 즉시 재구독은 같은 요청을 재사용합니다.
    if (entry.abortTimer !== null) {
      clearTimeout(entry.abortTimer)
      entry.abortTimer = null
    }
    const request = entry
    setState({
      data: null,
      loading: true,
      error: '',
    })
    void request.promise.then(data => {
      if (active && !request.controller.signal.aborted) setState({
        data,
        loading: false,
        error: '',
      })
    }).catch((error: unknown) => {
      if (active && !request.controller.signal.aborted) setState({
        data: null,
        loading: false,
        error: getErrorMessage(error),
      })
    })
    return () => {
      active = false
      // 재구독이 없는 실제 이탈과 조회 조건 변경은 다음 작업에서 취소합니다.
      request.abortTimer = setTimeout(() => request.controller.abort(), 0)
    }
  }, [load, version])

  return {
    ...state,
    reload,
  }
}
export default useApiQuery
