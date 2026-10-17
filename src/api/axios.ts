import axios from 'axios'

import { ApiError, apiConfig, getRequestURL } from './http'

import type { RequestOptions } from './http'

/** 인터셉터, 파일 업로드 등 Axios 고유 기능이 필요할 때 사용합니다. */
export const axiosInstance = axios.create({ timeout: apiConfig.timeout })

/** 응답 본문을 반환합니다. HTTP 오류는 ApiError, 취소/네트워크 오류는 Axios 오류입니다. */
export async function axiosRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    const response = await axiosInstance.request<unknown>({
      url: getRequestURL(path, options.params),
      method: options.method ?? 'GET',
      data: options.body,
      ...(options.headers ? { headers: options.headers } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
      timeout: options.timeout ?? apiConfig.timeout,
    })
    return (response.status === 204 || response.status === 205 ? undefined : response.data) as T
  } catch (error) {
    if (axios.isAxiosError<unknown>(error) && error.response) {
      throw new ApiError(error.response.status, error.response.data)
    }
    throw error
  }
}
