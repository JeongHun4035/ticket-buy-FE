import { request } from './client'

import type { ApiUser } from '@/types/interfaces/api/users'

export const getCurrentUser = () => request<ApiUser>('/users/me', {}, true)
