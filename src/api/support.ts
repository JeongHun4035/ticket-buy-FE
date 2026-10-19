import { request } from './client'

import type { SupportInfo } from '@/types/interfaces/api/support'

export const getSupportInfo = (signal?: AbortSignal) => request<SupportInfo>('/support/info', signal ? { signal } : {})
