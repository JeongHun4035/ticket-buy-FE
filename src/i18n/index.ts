import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ko from './locales/ko.json'
import zhCN from './locales/zh-CN.json'

const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem('ticket-buy-language')
    return saved && [
      'ko',
      'en',
      'zh-CN',
    ].includes(saved) ? saved : 'ko'
  } catch {
    return 'ko'
  }
}

const syncLanguage = (language: string) => {
  document.documentElement.lang = language
  try {
    localStorage.setItem('ticket-buy-language', language)
  } catch {
    // 언어 전환은 저장소를 사용할 수 없는 환경에서도 동작합니다.
  }
}

i18n.on('languageChanged', syncLanguage)
void i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    'zh-CN': { translation: zhCN },
  },
  lng: getSavedLanguage(),
  fallbackLng: 'ko',
  supportedLngs: [
    'ko',
    'en',
    'zh-CN',
  ],
  keySeparator: false,
  nsSeparator: false,
  initAsync: false,
  interpolation: { escapeValue: false },
})

export default i18n
