import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { getErrorMessage, signUp } from '@/api/client'
import BrandLogo from '@/components/common/BrandLogo/BrandLogo'
import Input from '@/components/common/Input/Input'
import LanguageSwitcher from '@/components/common/LanguageSwitcher/LanguageSwitcher'
import { useToast } from '@/hooks/useToast'
import { ROUTE_PATHS } from '@/routes/route'

import type { SignUpForm } from '@/types/interfaces/pages/sign'

import './Sign-in.css'
import './Sign-up.css'

const SignUp = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const navigationState: unknown = location.state
  const returnTo = navigationState && typeof navigationState === 'object' && 'from' in navigationState && typeof navigationState.from === 'string' && navigationState.from.startsWith('/') && !navigationState.from.startsWith('//') ? navigationState.from : '/'
  const [form, setForm] = useState<SignUpForm>({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
  })
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (busy) return
    if (!/^[A-Za-z0-9_]{4,80}$/.test(form.username)) {
      setError(t('아이디는 영문·숫자·밑줄 4~80자로 입력해주세요.')); return
    }
    if (!/^(?=.*[A-Za-z])(?=.*[0-9])[!-~]{8,72}$/.test(form.password)) {
      setError(t('비밀번호는 영문과 숫자를 포함한 공백 없는 8~72자로 입력해주세요.')); return
    }
    if (form.password !== form.passwordConfirm) {
      setError(t('비밀번호가 일치하지 않습니다.')); return
    }
    const name = form.name.trim()
    if (!name || name.length > 100 || /\p{Cc}/u.test(name)) {
      setError(t('이름은 제어문자 없이 1~100자로 입력해주세요.')); return
    }
    setBusy(true); setError('')
    try {
      await signUp({
        username: form.username,
        password: form.password,
        name,
      })
      toast(t('회원가입이 완료되었습니다. 로그인해주세요.'), { variant: 'success' })
      await navigate(ROUTE_PATHS.SIGN_IN, {
        replace: true,
        state: {
          from: returnTo,
          username: form.username,
        },
      })
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return <div className="signin-page">
    <header className="signin-header"><BrandLogo /><LanguageSwitcher /></header>
    <main className="signup-main">
      <div className="signin-form-heading"><p className="signin-eyebrow">JOIN TICKET BUY</p><h1>{t('회원가입')}</h1><p>{t('새로운 공연의 순간을 함께 시작하세요.')}</p></div>
      <form className="signin-form signup-form" noValidate onSubmit={event => {
        event.preventDefault(); void submit()
      }}>
        <Input id="signup-username" name="username" label={t('아이디')} value={form.username} autoComplete="username" maxLength={80} disabled={busy} required onChange={username => setForm({
          ...form,
          username,
        })} aria-describedby="signup-username-help" />
        <p className="signup-help" id="signup-username-help">{t('영문·숫자·밑줄 4~80자, 대소문자를 구분합니다.')}</p>
        <Input id="signup-name" name="name" label={t('이름')} value={form.name} autoComplete="name" maxLength={100} disabled={busy} required onChange={name => setForm({
          ...form,
          name,
        })} />
        <div className="signin-password"><Input id="signup-password" name="password" label={t('비밀번호')} type={showPassword ? 'text' : 'password'} value={form.password} autoComplete="new-password" maxLength={72} disabled={busy} required onChange={password => setForm({
          ...form,
          password,
        })} aria-describedby="signup-password-help" /><button className="signin-password-toggle" type="button" aria-label={t(showPassword ? '비밀번호 숨기기' : '비밀번호 표시')} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
        <p className="signup-help" id="signup-password-help">{t('영문과 숫자 포함 8~72자, 공백 없이 입력해주세요.')}</p>
        <Input id="signup-password-confirm" name="passwordConfirm" label={t('비밀번호 확인')} type={showPassword ? 'text' : 'password'} value={form.passwordConfirm} autoComplete="new-password" maxLength={72} disabled={busy} required onChange={passwordConfirm => setForm({
          ...form,
          passwordConfirm,
        })} />
        {error && <p className="signup-error" role="alert">{error}</p>}
        <button className="signin-submit" type="submit" disabled={busy}>{t(busy ? '처리 중' : '회원가입')}<FiArrowRight aria-hidden="true" /></button>
      </form>
      <p className="signup-login">{t('이미 계정이 있으신가요?')} <Link to={ROUTE_PATHS.SIGN_IN} state={{ from: returnTo }}>{t('로그인')}</Link></p>
    </main>
  </div>
}

export default SignUp
