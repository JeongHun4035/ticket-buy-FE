import { useTranslation } from 'react-i18next'
import { FiGlobe } from 'react-icons/fi'

import './LanguageSwitcher.css'

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation()

  return (
    <label className="language-switcher">
      <FiGlobe aria-hidden="true" />
      <select aria-label={t('언어 변경')} value={i18n.resolvedLanguage ?? 'ko'} onChange={event => {
        void i18n.changeLanguage(event.target.value)
      }}>
        <option value="ko" lang="ko">한국어</option>
        <option value="en" lang="en">English</option>
        <option value="zh-CN" lang="zh-CN">简体中文</option>
      </select>
    </label>
  )
}

export default LanguageSwitcher
