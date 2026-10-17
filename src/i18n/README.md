# 다국어 관리

- `index.ts`: i18next 초기화, 언어 저장, HTML lang 동기화
- `locales/ko.json`, `en.json`, `zh-CN.json`: 한국어, 영어, 중국어 간체 번역
- `LanguageSwitcher`: 메인 헤더와 로그인 화면에서 공유하는 언어 선택 UI

기본 언어는 한국어입니다. 선택한 언어는 `ticket-buy-language` 키에 저장합니다.
컴포넌트에서는 `const { t } = useTranslation()`으로 문구를 출력합니다.
번역 키는 한국어 원문이며, 새 문구는 세 JSON 파일에 같은 키로 추가합니다.
동적 값은 `{{name}}`, `{{count}}` 등으로 전달합니다. 사용자명과 행사 상태 값은 원본 그대로 유지하고 표시할 때 번역합니다.
가격은 통화 변환 없이 KRW를 선택 언어 형식으로 표시합니다.

검증: `pnpm test:i18n`
