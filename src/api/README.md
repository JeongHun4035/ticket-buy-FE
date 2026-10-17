# API 호출

`.env.local`에 `VITE_API_BASE_URL=https://api.example.com`을 설정한 후 개발 서버를 재시작합니다. 비워두면 현재 사이트로 요청합니다.

두 함수는 동일한 옵션과 응답 본문 반환 방식을 제공합니다. `T`는 TypeScript 타입 지정이며 런타임 응답 검증은 별도로 필요합니다.

```tsx
import { axiosRequest } from '@/api/axios'
import { fetchRequest } from '@/api/fetch'
import { ApiError } from '@/api/http'

interface Item {
  id: number
  title: string
}

const items = await axiosRequest<Item[]>('/items', {
  params: { page: 1, limit: 10 },
})
const sameItems = await fetchRequest<Item[]>('/items', {
  params: { page: 1, limit: 10 },
})

await fetchRequest<Item>('/items', {
  method: 'POST',
  body: { title: '새 항목' },
})
```

HTTP 실패는 두 함수 모두 `ApiError`로 전달합니다. `status`와 `data`를 확인할 수 있습니다. 네트워크 오류와 취소는 각 라이브러리의 원래 오류를 전달합니다. 기본 타임아웃은 15초이며 `timeout: 0`은 제한을 해제합니다. `signal`로 요청을 취소할 수 있습니다.

InfiniteScroll의 `onLoadMore`에서 원하는 함수를 호출하고 데이터 추가를 완료한 후 반환하면 로딩 dim이 자동으로 해제됩니다. 실패 시 예외를 그대로 전달하면 컴포넌트의 재시도 버튼이 표시됩니다.

```tsx
const loadMore = async () => {
  const nextItems = await fetchRequest<Item[]>('/items', {
    params: { offset: items.length, limit: 10 },
  })
  setItems(current => [...current, ...nextItems])
  setHasMore(nextItems.length === 10)
}
```

여기의 `/items`는 사용 예시입니다. 실제 서버 주소, 엔드포인트와 응답 형식에 맞춰 변경합니다. 인증 헤더는 `headers`로 전달하며, 파일 업로드나 Axios 인터셉터가 필요하면 `axiosInstance`를 직접 사용합니다.
