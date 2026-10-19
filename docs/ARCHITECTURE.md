# 소스 구조와 책임

기존 `pages`, `components`, `hooks`, `types/interfaces`, `api`, `utils` 구조를 기준으로 기능을 배치합니다.

| 위치 | 책임 |
| --- | --- |
| `pages/<화면>/` | 경로별 화면 구성, 입력과 이벤트 연결 |
| `pages/<화면>/children/<컴포넌트>/` | 해당 화면에서 사용하는 상세 UI |
| `components/common/<컴포넌트>/` | 화면 간 재사용하는 UI와 스타일 |
| `components/booking/` | 회차 선택 → 대기열 → 좌석 선택의 화면 조합 |
| `hooks/` | React 상태, 조회 조건, API 호출과 요청 취소, 타이머 및 리소스 정리 |
| `api/` | 영역별 엔드포인트 호출과 응답 타입 지정 |
| `contexts/` | 인증, 테마, 토스트 Provider와 Context |
| `types/interfaces/` | API·컴포넌트·페이지·Context별 타입 |
| `utils/` | 날짜·금액·숫자 표시와 입력 검증 등 유틸리티 |
| `services/` | 브라우저 저장소 등 UI와 독립적인 서비스 |
| `styles/` | 테마와 여러 화면이 공유하는 스타일 |

## API 영역

- `events.ts`: 행사·추천 행사·장르·회차 조회
- `queue.ts`: 대기열 진입·현재 상태 조회·이탈
- `seats.ts`: 전체·구역별 좌석 조회, 임시 확보·해제, 조회 제한 재시도
- `reservations.ts`: 예매 확정·조회·취소
- `contents.ts`: 게시판·FAQ 조회 및 관리자 편집
- `users.ts`, `support.ts`, `adminEvents.ts`: 사용자·고객센터·행사 등록

서비스 API는 `client.ts`의 `request`를 사용합니다. 인증 토큰, 갱신, HTTP 오류 처리는 기존 공통 클라이언트에 유지합니다. Fetch와 Axios 유틸리티의 공개 사용법도 유지합니다.

내부 코드에서는 해당 영역 파일에서 직접 가져옵니다. 기존 `api/ticket.ts`와 `types/interfaces/api/ticket.ts`는 호환성을 위한 재내보내기 진입점으로 남겨둡니다. 날짜 표시 함수는 `utils/dateTime.ts`에 두며 기존 `api/adapters.ts`에서도 재내보냅니다. `utils/date.ts`의 날짜 형식 지정 함수는 기존 용도로 유지합니다.

## 상태와 화면 분리

- `useMainEvents`: 검색·필터·정렬·페이지, 추천 행사, 상세 조회, 예매 진입
- `useSeatBooking`: 좌석 조회·선택, 임시 확보와 만료, 해제, 멱등 키를 이용한 예매 확정
- `useWaitingQueue`: 서버 응답 간격에 따른 폴링, 입장 전환, 대기 취소
- `useReservations`: 예매 내역·상세 조회 및 취소 후 목록 갱신
- `useContentEditor`: 게시판·FAQ의 다국어 편집과 등록·삭제
- `useEventCreate`: 행사 입력·이미지 검증·등록·재시도 대기·응답 유실 시 중복 제출 방지
- `useDemoPayments`: 사용자별 데모 결제 정보 상태와 저장 서비스 연결
- `useModalDialog`: 마운트 시 native dialog 열기와 배경 스크롤 복원

검색 결과와 페이지네이션은 서버 응답을 사용합니다. 대기순서는 `position`, 잔여좌석은 `availableSeats`를 사용합니다. 예매 확보·확정 요청을 읽기 요청처럼 자동 재시도하지 않습니다. 이미지 URL, 타이머, 진행 중인 조회 등 정리 동작은 해당 상태를 소유하는 훅에서 관리합니다.

`styles/service.css`는 게시판·관리자·예매 내역 등에서 공유하는 레이아웃과 상세 팝업 스타일입니다. 고객센터 전용 연락처·FAQ 스타일은 `pages/Support/Support.css`에 둡니다. 다른 화면은 고객센터 CSS를 가져오지 않습니다.

## 변경 검증

```bash
pnpm lint
pnpm typecheck
node --test tests/*.test.mjs
pnpm build
pnpm test:e2e
```

브라우저 통합 테스트는 Chrome 및 실행 중인 백엔드가 필요합니다. 관리자 행사 등록의 실제 서버 테스트는 기존 환경변수 조건에 따라 선택적으로 실행됩니다. 계약 응답을 사용하는 테스트와 실제 백엔드 예매 테스트를 구분해 유지합니다.
