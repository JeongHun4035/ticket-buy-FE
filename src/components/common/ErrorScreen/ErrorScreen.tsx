import { useEffect, useState } from 'react'
import { FiAlertCircle, FiArrowLeft, FiClock, FiHome, FiRefreshCw } from 'react-icons/fi'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'


import type { ErrorPageState } from '@/api/errorNavigation'

import './ErrorScreen.css'

const messages: Record<number, [string, string]> = {
  400: ['요청을 확인해주세요', '입력한 정보나 요청이 올바르지 않습니다. 내용을 확인한 후 다시 시도해주세요.'],
  401: ['로그인이 필요합니다', '로그인 시간이 만료되었거나 인증이 필요합니다. 다시 로그인해주세요.'],
  403: ['접근 권한이 없습니다', '이 페이지를 이용할 권한이 없습니다. 로그인한 계정을 확인해주세요.'],
  404: ['페이지를 찾을 수 없습니다', '주소가 변경되었거나 더 이상 제공하지 않는 페이지입니다. 주소를 확인해주세요.'],
  408: ['요청 시간이 초과되었습니다', '응답을 기다리는 시간이 길어졌습니다. 잠시 후 다시 시도해주세요.'],
  409: ['요청을 완료할 수 없습니다', '정보가 변경되었거나 이미 처리된 요청입니다. 최신 상태를 확인해주세요.'],
  422: ['입력 내용을 확인해주세요', '처리할 수 없는 정보가 포함되어 있습니다. 입력 내용을 확인해주세요.'],
  429: ['잠시만 기다려주세요', '짧은 시간에 요청이 많이 발생했습니다. 잠시 기다린 후 다시 시도해주세요.'],
  500: ['서비스에 문제가 발생했습니다', '요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'],
  502: ['서버에 연결할 수 없습니다', '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.'],
  503: ['서비스를 잠시 이용할 수 없습니다', '서비스 점검 또는 일시적인 과부하로 이용이 어렵습니다. 잠시 후 다시 시도해주세요.'],
  504: ['서버 응답이 늦어지고 있습니다', '서버에서 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.'],
  0: ['연결 상태를 확인해주세요', '서버와 연결하지 못했습니다. 인터넷 연결을 확인한 후 다시 시도해주세요.'],
}

interface ErrorScreenProps {
  status?: number,
  fullPage?: boolean,
}

const ErrorScreen = ({ status, fullPage = false }: ErrorScreenProps) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const pageState = location.state as ErrorPageState | null
  const from = pageState?.from?.startsWith('/') && !pageState.from.startsWith('//') && !pageState.from.startsWith('/error/') ? pageState.from : '/'
  const retryAt = pageState?.retryAt ?? 0
  const code = status ?? Number(params.status ?? 500)
  const [title, description] = messages[code] ?? ['요청을 처리하지 못했습니다', '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.']
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const deadline = code === 429 || code === 503 ? retryAt : 0
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    update()
    if (deadline <= Date.now()) return
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [code, retryAt])

  const retry = () => {
    void navigate(from, { replace: true })
  }
  return <section className={`error-screen${fullPage ? ' error-screen--page' : ''}`} aria-label="오류 안내" role="alert">
    <div className="error-screen__card">
      <span className="error-screen__brand">TICKET BUY · 안내</span>
      <div className="error-screen__icon" aria-hidden="true">{code === 429 ? <FiClock /> : <FiAlertCircle />}</div>
      <span className="error-screen__code">{code ? `ERROR ${code}` : 'CONNECTION ERROR'}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {remaining > 0 && <p className="error-screen__wait" role="status">{remaining}초 후 다시 시도할 수 있습니다.</p>}
      <div className="error-screen__actions">
        {code === 401 ? <Link className="error-screen__primary" to="/sign-in">로그인하기</Link> : code === 400 || code === 403 || code === 404 || code === 422 ? <button type="button" onClick={() => {
          const historyState = window.history.state as { idx?: number } | null
          if (typeof historyState?.idx === 'number' && historyState.idx > 0) window.history.back()
          else window.location.assign('/')
        }}><FiArrowLeft aria-hidden="true" />이전 페이지</button> : <button className="error-screen__primary" type="button" onClick={retry} disabled={remaining > 0}><FiRefreshCw aria-hidden="true" />다시 시도</button>}
        <Link to="/"><FiHome aria-hidden="true" />홈으로 이동</Link>
      </div>
    </div>
  </section>
}

export default ErrorScreen
