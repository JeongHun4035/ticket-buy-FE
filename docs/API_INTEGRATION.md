# 백엔드 API 연동

## 실행

1. 백엔드를 `http://localhost:8080`에서 실행합니다.
2. `pnpm dev`로 프론트를 실행합니다.
3. `http://localhost:5173`에 접속합니다.

개발 서버가 `/api` 요청을 8080으로 프록시하므로 `.env.local` 없이 사용할 수 있습니다.
API 경로에는 `/api/v1`이 이미 포함됩니다. 다른 서버를 직접 호출할 때는
`VITE_API_BASE_URL`에 origin만 입력합니다. 쿠키를 사용하는 직접 호출에는
백엔드의 credentials CORS 설정이 필요합니다.
운영 배포에서는 `/api` 리버스 프록시 또는 위 환경변수를 설정해야 합니다.

명세 원본: http://localhost:8080/swagger-ui/index.html
계약 확인: http://localhost:8080/v3/api-docs

## 연결된 기능

| 화면 | API |
| --- | --- |
| 로그인·사용자명·로그아웃 | auth/login, auth/refresh, auth/logout, users/me |
| 메인 | events, events/featured, categories, events/{id} |
| 회차 선택 | events/{id}/performances |
| 대기열 | POST performances/{id}/queue, GET/DELETE queue/me |
| 좌석 | performances/{id}/seats, POST holds, DELETE holds/{id} |
| 예매 확정 | POST reservations, X-Admission-Token, Idempotency-Key |
| 내 예매 `/reservations` | reservations/me, reservations/{id}, reservations/{id}/cancel |
| 고객센터·푸터 연락처 | support/info |
| FAQ·게시판 | faqs, posts, posts/{id} |
| 콘텐츠 관리 `/admin` | admin/posts 및 admin/faqs의 POST/PATCH/DELETE |

사용자 정보의 role이 ADMIN인 경우에만 콘텐츠 관리 메뉴를 표시하고 /admin 접근을 허용합니다. 일반 사용자와 알 수 없는 권한은 접근을 차단하며, 서버에서도 관리자 권한을 검증합니다.

## 회원가입

`/sign-up`에서 POST `/api/v1/auth/signup`을 호출합니다. 요청 타입은
`src/types/interfaces/api/auth.ts`에서 관리합니다. 아이디 4~80자,
영문·숫자·밑줄과 비밀번호 ASCII 8~72자(영문·숫자 포함), 이름 1~100자 조건을 검증합니다.
가입 성공은 자동 로그인이 아니며 로그인 화면으로 이동합니다.
중복 아이디 409 오류는 해당 안내로 표시합니다.
회원가입 E2E는 고유한 개발 계정을 생성합니다. 사용자 삭제 API가 없어 이 계정은 DB에 남습니다.

## 인증 및 예매

- accessToken은 메모리에만 보관합니다. refresh 쿠키는 `credentials: include`로 전달합니다.
- 로그인 이력 표시가 있는 세션만 최초 접속 시 갱신 쿠키로 복원합니다. 비로그인 방문이나 로그인 실패에는 refresh를 호출하지 않습니다. 갱신 실패 및 로그아웃 시 로그인 이력 표시도 제거합니다.
- 인증 요청이 401을 반환하면 하나의 공유 갱신 요청 후 원래 요청을 한 번 재시도합니다.
- 로그인 성공 후 `/users/me` 응답으로 사용자명을 표시합니다.
- 고객센터·내 예매·콘텐츠 관리는 로그인이 필요합니다. 비로그인 접근은 로그인 화면으로 이동하며 로그인 성공 후 원래 페이지로 돌아갑니다.
- 검색·정렬·페이지네이션·다국어는 서버 쿼리 파라미터를 사용합니다.
- 예매는 회차 선택 → 대기열 → 좌석 조회 → 임시 확보 → 예매 확정 순서입니다.
- 대기열은 서버가 제공한 `pollAfterSeconds`에 따라 중복 없이 폴링합니다.
- 서버가 바로 입장을 허용하면 대기 화면 없이 좌석 선택으로 이동합니다.
- 대기번호와 앞선 대기자 수는 구분해서 표시합니다. 예상 시간 null은 계산 중으로 표시합니다.
- 기존 30,000번 시뮬레이션과 시연용 입장 버튼은 실서비스 흐름에서 제거했습니다.
- 가격과 좌석 확보 만료는 서버 응답을 기준으로 표시합니다.
- 예매 재시도 시 같은 확보 내역에 같은 멱등 키를 사용합니다.
- 좌석 충돌은 서버 오류를 표시하고 좌석 목록을 새로 조회합니다.
- 닫기/좌석 다시 선택에서 임시 확보를 해제합니다. 연결이 끊긴 경우 서버 만료 정책이 적용됩니다.
- 결제 API는 명세에 없습니다. `paymentStatus: NOT_REQUIRED`를 그대로 표시하며 PG 결제는 수행하지 않습니다.

## 데이터와 UI

- API 인터페이스: `src/types/interfaces/api/ticket.ts`
- API 호출: `src/api/ticket.ts`
- 인증·갱신·오류 처리: `src/api/client.ts`
- 서버 행사 → UI 어댑터: `src/api/adapters.ts`
- 조회·로딩·오류·취소 처리: `src/hooks/useApiQuery.ts`
- 이전 목 데이터는 fixtures로만 남아 있으며 서비스 화면에서 import하지 않습니다.
- posterUrl이 없으면 기존 로컬 배너 그래픽을 사용합니다.
- support/info의 phone/email이 null이면 가짜 연락처를 보충하지 않습니다.
- 본사 및 스폰서는 대응 API가 없어 기존의 가상 디자인 정보를 유지합니다.

## 검증

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:i18n`
- `pnpm test:e2e`
- `pnpm build`

브라우저 테스트는 Chrome, 백엔드 8080, Swagger에 명시된 개발용 demo/admin 계정을 사용합니다.
게시글/FAQ 테스트 데이터는 테스트 내에서 삭제하고, 테스트 예매는 취소합니다.
서버의 즉시 입장 응답을 활용하면서 WAITING 화면과 폴링 전환도 검증하기 위해
해당 테스트의 최초 응답 상태만 WAITING으로 바꿉니다. 입장 토큰과 이후 조회는 실제 서버를 사용합니다.
만료 토큰·좌석 충돌 오류는 브라우저 응답 주입으로 재현하며 복구 요청은 실제 서버로 보냅니다.
`tests/api-endpoints.json`은 구현 시 확인한 Swagger의 30개 operation 목록이며,
전체 브라우저 테스트에서 각 API의 성공 응답이 확인됐는지 대조합니다.

## 데모 결제 정보

로그인 후 `/payments`에서 카드사·끝 4자리·별칭을 등록하고 기본 결제수단 지정 및 삭제를 할 수 있습니다. 사용자별로 현재 브라우저에만 저장하며 실제 카드번호나 CVC는 수집하지 않습니다. 결제 API 연동이나 실제 결제에는 사용되지 않습니다.

## 대규모 공연장 좌석

좌석 컴포넌트는 전달받은 좌석 수에 맞춰 구역을 구성하고 구역당 최대 200석을 렌더링합니다. 구역을 바꿔도 선택한 좌석 ID는 유지됩니다. 서버 구역 정보가 없는 현재 API에서는 표시용 블록으로 분할하며 실제 공연장 도면을 의미하지 않습니다.

현재 Swagger의 좌석 API는 전체 좌석을 한 페이지로 반환합니다. 실제 공연에 수천~수만 석을 제공하려면 백엔드에서 공연장별 좌석 재고를 생성해야 합니다. 향후 층·구역 식별자와 배치 좌표, 구역별 잔여 수 조회 및 구역별 좌석 조회 API를 제공하면 전체 좌석 전송도 줄일 수 있습니다. 좌석 수 확대 자체로 동시 접속 처리 성능이 검증되지는 않으며 대기열·재고 경합·부하 검증은 별도로 필요합니다.

예제 경로: `/examples/seats`에서 500·5,000·30,000석을 확인할 수 있습니다. 예제 ID는 실제 예매 API에 제출하지 않습니다.

관리자 행사 등록·포스터 기능은 [행사 등록 안내](ADMIN_EVENTS.md)를 참고하세요. 관리자 공연장 목록·구역 조회 및 multipart 행사 등록 API를 사용합니다.
