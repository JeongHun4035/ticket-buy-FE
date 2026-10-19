# API 호출

서비스 화면에서는 영역별 API를 사용합니다. `events.ts`, `queue.ts`, `seats.ts`, `reservations.ts`, `contents.ts`, `users.ts`, `support.ts`, `adminEvents.ts`가 엔드포인트를 담당하고, `client.ts`가 인증과 갱신을 처리합니다. 기존 `ticket.ts` 가져오기 경로는 호환성을 위해 유지합니다.

```tsx
import { getEvents } from '@/api/events'
import { joinQueue } from '@/api/queue'
import { getSeats } from '@/api/seats'
```

API 응답 타입은 `types/interfaces/api`의 같은 영역 파일에 있습니다. 화면 상태는 `hooks`, 순수한 날짜 표시는 `utils/dateTime.ts`, 서버 행사 데이터를 화면 형태로 바꾸는 매핑은 `adapters.ts`에서 관리합니다. 전체 구조는 [소스 구조와 책임](../../docs/ARCHITECTURE.md)을 참고하세요.

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

## 동일 주소 배포

프론트와 API를 http://34.64.146.19 에서 함께 제공하면 VITE_API_BASE_URL을 비워두고 배포 서버에서 /api를 백엔드로 전달합니다. 서비스 클라이언트가 /api/v1을 자동으로 붙이므로 환경변수에 /api/v1을 넣으면 경로가 중복됩니다. 환경변수를 변경하면 pnpm build 후 새 빌드를 배포해야 합니다. Vite의 로컬 8080 프록시는 개발 서버에서만 동작합니다.

Fetch와 Axios 유틸리티는 쿠키 전달을 사용합니다. 실제 서비스 인증·Bearer 토큰·갱신 처리는 client.ts의 request를 통해 사용하세요. Origin 헤더는 브라우저가 설정하며 프론트에서 지정하지 않습니다. 다른 origin의 API에 연결할 때는 백엔드에서 실제 프론트 origin과 credentials를 허용해야 합니다.
