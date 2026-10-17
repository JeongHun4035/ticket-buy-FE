# 관리자 행사 등록과 포스터

관리자 계정으로 로그인한 뒤 사용자 메뉴의 **행사 등록** 또는 콘텐츠 관리의 **행사 등록**을 선택합니다. 직접 경로는 `/admin/events/new`입니다. 비로그인 사용자는 로그인으로 안내하며 ADMIN 이외의 권한은 접근을 차단합니다.

## 등록 절차

1. 한국어 제목·설명을 입력합니다. 영어·중국어 간체는 선택입니다.
2. 장르와 추천 순위를 지정합니다. 0은 추천 제외이며 큰 값이 먼저 표시됩니다.
3. PNG/JPEG 포스터를 선택합니다. 5MiB, 각 변 6000px, 총 2000만 픽셀 제한을 검사합니다.
4. 회차마다 공연장을 선택하고 층별 판매 구역의 등급·가격을 지정합니다. 공연장 목록은 페이지네이션을 지원합니다.
5. 한국 표준시(Asia/Seoul)로 시작·예매 오픈·마감 시각을 입력합니다. 전송 시 UTC ISO 8601로 변환합니다.
6. 각 회차의 판매 구역 수·편성 좌석 수·구역별 가격을 확인하고 등록합니다. 공연장의 전체 수용 인원은 별도로 표시합니다.
7. 성공 화면에서 서버가 발급한 행사·회차 ID를 확인하고 행사 상세로 이동합니다.

공연장을 바꾸면 해당 회차의 이전 구역 선택은 제거됩니다. 선택 구역 전체 좌석이 편성되므로 일부 구역만 선택할 때는 판매 좌석 수를 확인해야 합니다.

## 구현 파일

- `src/pages/Admin/EventCreate.tsx`: 등록 폼, 이미지 선택·미리보기, 전송·성공·실패 처리
- `src/pages/Admin/PerformanceFields.tsx`: 공연장 페이지네이션, 층별 구역·등급·가격, 판매 요약
- `src/types/interfaces/api/adminEvents.ts`: API 요청·응답 인터페이스
- `src/types/interfaces/pages/adminEvents.ts`: 폼 상태 인터페이스
- `src/api/adminEvents.ts`: 관리자 공연장·구역 조회, multipart 등록
- `src/utils/adminEvents.ts`: 일정·정수 가격·구역 ID·이미지 검증
- `src/components/common/EventImage/EventImage.tsx`: 공개 포스터 URL, 로딩 상태 및 공통 fallback
- `src/api/fetch.ts`, `src/api/http.ts`: FormData 처리와 Retry-After 정보

## API 및 요청 정책

로컬 백엔드의 Swagger와 `../ticket-buy-be/docs/admin-events.md`를 확인해 연결했습니다.

- GET `/api/v1/admin/venues?page=1&pageSize=20`
- GET `/api/v1/admin/venues/{venueId}/sections`
- POST `/api/v1/admin/events`

등록 요청은 FormData의 `event` JSON Blob과 `image` File을 보냅니다. 전체 Content-Type은 브라우저가 boundary와 함께 설정합니다. 신규 등록은 자동 재전송하지 않으며 401도 POST를 재생하지 않고 오류를 표시합니다. 네트워크 실패·타임아웃 등으로 결과가 불명확하면 수동으로 목록에서 미등록을 확인하기 전까지 재제출을 막습니다. 429는 Retry-After 동안 제출을 막고, 서버의 traceId는 문의 번호로 표시합니다. 실패 시 폼과 유효한 선택 이미지를 유지합니다.

기존 조회 훅은 페이지 단위 상태이며 전역 행사 캐시가 없습니다. 등록 후 메인으로 이동하면 행사·추천 목록을 새로 조회합니다. 추가로 `ticket-buy:events-updated` 이벤트를 통해 마운트된 메인 목록도 다시 조회합니다.

메인 카드·추천 슬라이더·상세는 API가 반환한 posterUrl을 그대로 사용합니다. 이미지 요청에는 Bearer를 넣지 않으며 URL에 토큰이나 API 기본 주소를 추가하지 않습니다. 없거나 실패한 이미지는 `/images/poster-fallback.svg`로 대체합니다. 정적 개발 SVG 포스터 표시는 허용하지만 업로드는 PNG/JPEG만 가능합니다.

## 검증

```sh
pnpm typecheck
pnpm lint
pnpm test:i18n
node --test tests/admin-events.test.mjs
pnpm exec playwright test tests/admin-events.spec.mjs
pnpm build
```

단위 테스트는 한국 표준시 변환, 선택 번역 생략, 구역 ID 정밀도, 중복 구역, 가격·날짜 및 이미지 검증을 확인합니다. 브라우저 테스트의 기본 실행은 API 응답을 모킹하여 권한, 폼·구역·페이지네이션, 이전 요청 경쟁, multipart, 중복 제출 방지, 오류·Retry-After, 다국어·다크 테마, 포스터 fallback을 확인합니다.

실제 백엔드 등록 테스트는 별도 선택 실행입니다. **행사 삭제 API가 없어 테스트 행사가 개발 DB에 남습니다.**

```powershell
$env:TICKET_BUY_LIVE_EVENT_TEST='1'
pnpm exec playwright test tests/admin-events.spec.mjs --grep 'live backend'
Remove-Item Env:TICKET_BUY_LIVE_EVENT_TEST
```

이번 실제 연결 확인에서 행사 ID `100000`, 회차 ID `100000`이 생성되었고 공개 포스터 표시까지 확인했습니다. 실제 생성 ID는 실행마다 달라집니다.

## 범위

행사 수정·삭제·기존 포스터 교체 API 및 실제 PG 결제는 제공하지 않습니다. 공연장·구역의 서버 표시명은 현재 API가 제공한 명칭을 사용합니다. 배포 시 posterUrl의 호스트는 브라우저에서 접근 가능한 공개 주소여야 합니다.

좌석 충돌 후 재조회가 서버의 최소 조회 간격에 걸리는 경우에는 Retry-After를 지켜 좌석 조회만 한 번 재시도합니다. 대기 중 화면을 닫으면 재시도 대기도 취소하며 좌석 확보·예매 쓰기는 자동 재전송하지 않습니다.
