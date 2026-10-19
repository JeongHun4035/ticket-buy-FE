import i18n from '@/i18n'

import { request } from './client'

import type { ApiPage } from '@/types/interfaces/api/common'
import type { ApiContent, ContentInput } from '@/types/interfaces/api/contents'

const lang = () => i18n.resolvedLanguage ?? 'ko'

export const getContents = (kind: 'posts' | 'faqs', q: string, page: number, pageSize: number, signal?: AbortSignal, language = lang()) => request<ApiPage<ApiContent>>(`/${kind}`, {
  params: {
    q,
    page,
    pageSize,
    lang: language,
  },
  ...(signal ? { signal } : {}),
})

export const getPost = (id: number) => request<ApiContent>(`/posts/${id}`, { params: { lang: lang() } })

export const saveContent = (kind: 'posts' | 'faqs', input: ContentInput, id?: number) => request<ApiContent>(`/admin/${kind}${id ? `/${id}` : ''}`, {
  method: id ? 'PATCH' : 'POST',
  body: input,
}, true)

export const deleteContent = (kind: 'posts' | 'faqs', id: number) => request<void>(`/admin/${kind}/${id}`, { method: 'DELETE' }, true)

export const getContentInput = async (kind: 'posts' | 'faqs', id: number): Promise<ContentInput> => {
  const input: ContentInput = {
    category: 'NOTICE',
    titles: {},
    bodies: {},
  }
  for (const language of [
    'ko',
    'en',
    'zh-CN',
  ]) {
    let item: ApiContent | undefined
    if (kind === 'posts') item = await request<ApiContent>(`/posts/${id}`, { params: { lang: language } })
    else {
      let page = 1
      let result: ApiPage<ApiContent>
      do {
        result = await request<ApiPage<ApiContent>>('/faqs', {
          params: {
            page,
            pageSize: 100,
            lang: language,
          },
        })
        item = result.items.find(entry => entry.id === id)
        page++
      } while (!item && result.items.length > 0 && (page - 1) * 100 < result.total)
    }
    if (!item) throw new Error('콘텐츠를 찾을 수 없습니다.')
    if (item.category === 'NOTICE' || item.category === 'GUIDE' || item.category === 'UPDATE') input.category = item.category
    input.titles[language] = item.title
    input.bodies[language] = item.content
  }
  return input
}
