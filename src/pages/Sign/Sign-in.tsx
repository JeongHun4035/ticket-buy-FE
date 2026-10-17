import { useState } from 'react'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiGrid } from 'react-icons/fi'

import Input from '@/components/common/Input/Input'

import './Sign-in.css'

const SignIn: React.FC = () => {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div className="signin-page">
      <header className="signin-header">
        <a className="signin-brand" href="/" aria-label="TICKET BUY 홈">
          <span className="signin-brand-icon"><FiGrid aria-hidden="true" /></span>
          TICKET<span className="signin-brand-accent">BUY</span>
        </a>
        <span className="signin-header-caption">공연의 시작, 티켓바이</span>
      </header>

      <main className="signin-main">
        <section className="signin-intro" aria-labelledby="signin-intro-title">
          <p className="signin-eyebrow">YOUR NEXT EXPERIENCE</p>
          <h1 id="signin-intro-title">기대하던 순간을,<br />당신의 자리에서.</h1>
          <p className="signin-intro-description">콘서트부터 뮤지컬, 전시까지.<br />새로운 경험의 시작을 티켓바이와 함께하세요.</p>
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
            <h2 id="signin-title">로그인</h2>
            <p>로그인하고 원하는 공연을 만나보세요.</p>
          </div>
          <form className="signin-form" onSubmit={event => {
            event.preventDefault()
            setMessage('로그인 서비스 연결 준비 중입니다.')
          }}>
            <Input id="userId" name="username" label="아이디" type="text" value={userId} placeholder="아이디를 입력해주세요" autoComplete="username" required onChange={setUserId} />
            <div className="signin-password">
              <Input id="password" name="password" label="비밀번호" type={showPassword ? 'text' : 'password'} value={password} placeholder="비밀번호를 입력해주세요" autoComplete="current-password" required onChange={setPassword} />
              <button className="signin-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'} aria-pressed={showPassword}>
                {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            </div>
            <label className="signin-remember"><input type="checkbox" name="rememberId" /> 아이디 저장</label>
            <button type="submit" className="signin-submit">로그인<FiArrowRight aria-hidden="true" /></button>
            {message && <p className="signin-message" role="status">{message}</p>}
          </form>
          <div className="signin-security"><FiLock aria-hidden="true" /><span>안전한 로그인으로 소중한 정보를 보호합니다.</span></div>
          <div className="signin-member-note"><strong>관람의 설렘부터 예매까지</strong><p>티켓바이에서 나만의 특별한 순간을 준비하세요.</p></div>
        </section>
      </main>
      <footer className="signin-footer"><span>© TICKET BUY. All rights reserved.</span><span>당신의 다음 무대를 함께합니다.</span></footer>
    </div>
  )
}

export default SignIn

