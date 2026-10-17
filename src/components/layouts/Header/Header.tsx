import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { FiArrowUpRight, FiMoon, FiSun, FiUser } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'

import BrandLogo from '@/components/common/BrandLogo/BrandLogo'
import LanguageSwitcher from '@/components/common/LanguageSwitcher/LanguageSwitcher'
import { AuthContext } from '@/contexts/auth/AuthContext'
import useTheme from '@/hooks/useTheme'
import { ROUTE_PATHS } from '@/routes/route'

import AccountMenu from './AccountMenu'
import './Header.css'

const LayoutHeader: React.FC = () => {
  const { t } = useTranslation()
  const auth = useContext(AuthContext)
  const { theme, toggleTheme } = useTheme()
  const userName = auth?.user?.name.trim()

  return (
    <div className="header-area">
      <div className="ticket-header-inner">
        <BrandLogo />
        <nav className="ticket-header-nav" aria-label={t('주 메뉴')}>
          <NavLink to={ROUTE_PATHS.MAIN} end>{t('홈')}</NavLink>
          <Link to={`${ROUTE_PATHS.MAIN}#event-list`}>{t('공연 · 행사')}</Link>
          <NavLink to={ROUTE_PATHS.SUPPORT}>{t('고객센터')}</NavLink>
          <NavLink to={ROUTE_PATHS.BOARD}>{t('게시판')}</NavLink>
        </nav>
        <div className="ticket-header-account">
          {userName && auth ? <AccountMenu userName={userName} role={auth.user?.role ?? ''} onSignOut={auth.signOut} /> : <div className="ticket-header-user" role="status">
            <span className="ticket-header-avatar"><FiUser aria-hidden="true" /></span>
            <span className="ticket-header-user-copy"><small>{userName ? 'WELCOME BACK' : 'WELCOME TO TICKET BUY'}</small><span title={userName || undefined}>{userName ? <><strong>{t('{{name}}님', { name: userName })}</strong></> : t('로그인이 필요합니다.')}</span></span>
          </div>}
          {!userName && <Link className="ticket-header-login" to={ROUTE_PATHS.SIGN_IN}>{t('로그인')}<FiArrowUpRight aria-hidden="true" /></Link>}
          {!userName && <Link className="ticket-header-login" to={ROUTE_PATHS.SIGN_UP}>{t('회원가입')}</Link>}
          <LanguageSwitcher />
          <button className="ticket-header-theme" type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? t('라이트 모드로 전환') : t('다크 모드로 전환')} title={theme === 'dark' ? t('라이트 모드') : t('다크 모드')}>
            {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LayoutHeader

