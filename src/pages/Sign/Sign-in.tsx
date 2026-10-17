import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiArrowRight, FiEye, FiEyeOff, FiLock } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import BrandLogo from '@/components/common/BrandLogo/BrandLogo'
import Input from '@/components/common/Input/Input'
import LanguageSwitcher from '@/components/common/LanguageSwitcher/LanguageSwitcher'
import useAuth from '@/hooks/useAuth'
import { ROUTE_PATHS } from '@/routes/route'

import './Sign-up.css'

import './Sign-in.css'

const SignIn: React.FC = () => {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state: unknown = location.state
  const returnTo = state && typeof state === 'object' && 'from' in state && typeof state.from === 'string' && state.from.startsWith('/') && !state.from.startsWith('//') ? state.from : '/'
  const [busy, setBusy] = useState(false)
  const [remember, setRemember] = useState(false)
  const [userId, setUserId] = useState(() => {
    try {
      if (state && typeof state === 'object' && 'username' in state && typeof state.username === 'string') return state.username
      return localStorage.getItem('ticket-buy-username') ?? ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div className="signin-page">
      <header className="signin-header">
        <BrandLogo />
        <div className="signin-header-actions"><span className="signin-header-caption">{t('공연의 시작, 티켓바이')}</span><LanguageSwitcher /></div>
      </header>

      <main className="signin-main">
        <section className="signin-intro" aria-labelledby="signin-intro-title">
          <p className="signin-eyebrow">YOUR NEXT EXPERIENCE</p>
          <h1 id="signin-intro-title">{t('기대하던 순간을,')}<br />{t('당신의 자리에서.')}</h1>
          <p className="signin-intro-description">{t('콘서트부터 뮤지컬, 전시까지.')}<br />{t('새로운 경험의 시작을 티켓바이와 함께하세요.')}</p>
          <div className="signin-stage" aria-hidden="true">
            <div className="signin-stage-beam signin-stage-beam-left" />
            <div className="signin-stage-beam signin-stage-beam-right" />
            <div className="signin-stage-title">LIVE THE MOMENT<span>EVERY SEAT HAS A STORY</span></div>
            <div className="signin-stage-platform" />
            <div className="signin-stage-seats" />
            <span className="signin-stage-caption">A NEW EXPERIENCE AWAITS</span>
          </div>
          <div className="signin-categories"><span>CONCERT</span><span>MUSICAL</span><span>EXHIBITION</span></div>
        </section>

        <section className="signin-panel" aria-labelledby="signin-title">
          <div className="signin-form-heading">
            <p className="signin-eyebrow">WELCOME TO TICKET BUY</p>
            <h2 id="signin-title">{t('로그인')}</h2>
            <p>{t('로그인하고 원하는 공연을 만나보세요.')}</p>
          </div>
          <form className="signin-form" onSubmit={event => {
            event.preventDefault()
            if (busy) return
            setBusy(true)
            setMessage('')
            void auth.signIn(userId, password).then(() => {
              try {
                if (remember) localStorage.setItem('ticket-buy-username', userId); else localStorage.removeItem('ticket-buy-username')
              } catch { /* Optional preference. */ }
              void navigate(returnTo, { replace: true })
            })
              .catch((error: unknown) => setMessage(getErrorMessage(error)))
              .finally(() => setBusy(false))
          }}>
            <Input id="userId" name="username" label={t('아이디')} type="text" value={userId} placeholder={t('아이디를 입력해주세요')} autoComplete="username" required onChange={setUserId} />
            <div className="signin-password">
              <Input id="password" name="password" label={t('비밀번호')} type={showPassword ? 'text' : 'password'} value={password} placeholder={t('비밀번호를 입력해주세요')} autoComplete="current-password" required onChange={setPassword} />
              <button className="signin-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? t('비밀번호 숨기기') : t('비밀번호 표시')} aria-pressed={showPassword}>
                {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            </div>
            <label className="signin-remember"><input type="checkbox" name="rememberId" checked={remember} onChange={event => setRemember(event.target.checked)} /> {t('아이디 저장')}</label>
            <button type="submit" disabled={busy || auth.loading} className="signin-submit">{t('로그인')}<FiArrowRight aria-hidden="true" /></button>
            {message && <p className="signin-message" role="status">{t(message)}</p>}
          </form>
          <p className="signin-signup">{t('아직 회원이 아니신가요?')} <Link to={ROUTE_PATHS.SIGN_UP} state={{ from: returnTo }}>{t('회원가입')}</Link></p>
          <div className="signin-security"><FiLock aria-hidden="true" /><span>{t('안전한 로그인으로 소중한 정보를 보호합니다.')}</span></div>
          <div className="signin-member-note"><strong>{t('관람의 설렘부터 예매까지')}</strong><p>{t('티켓바이에서 나만의 특별한 순간을 준비하세요.')}</p></div>
        </section>
      </main>
      <footer className="signin-footer"><span>© TICKET BUY. All rights reserved.</span><span>{t('당신의 다음 무대를 함께합니다.')}</span></footer>
    </div>
  )
}

export default SignIn


