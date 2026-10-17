import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiChevronDown, FiCreditCard, FiFileText, FiLogOut, FiSettings, FiUser } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

import { getErrorMessage } from '@/api/client'
import { ROUTE_PATHS } from '@/routes/route'

import type { AccountMenuProps } from '@/types/interfaces/components/accountMenu'

const AccountMenu = ({ userName, role, onSignOut }: AccountMenuProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const id = useId()
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setOpen(false)
  }, [location.key])
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false); trigger.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const position = () => {
      const panel = container.current?.querySelector<HTMLElement>('.account-popover')
      if (!panel) return
      panel.style.transform = ''
      const bounds = panel.getBoundingClientRect()
      const shift = bounds.left < 16 ? 16 - bounds.left : bounds.right > window.innerWidth - 16 ? window.innerWidth - 16 - bounds.right : 0
      panel.style.transform = 'translateX(' + shift + 'px)'
    }
    position()
    window.addEventListener('resize', position)
    return () => window.removeEventListener('resize', position)
  }, [open])

  const logout = async () => {
    if (busy) return
    setBusy(true); setError('')
    try {
      await onSignOut(); setOpen(false)
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return <div className="account-menu" ref={container} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <button className="ticket-header-user is-signed-in account-menu-trigger" ref={trigger} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
      <span className="ticket-header-avatar"><FiUser aria-hidden="true" /></span><span className="ticket-header-user-copy"><small>WELCOME BACK</small><span title={userName}><strong>{t('{{name}}님', { name: userName })}</strong></span></span><FiChevronDown className="account-menu-chevron" aria-hidden="true" />
    </button>
    {open && <nav className="account-popover" id={id} aria-label={t('사용자 메뉴')}>
      <div className="account-popover-heading"><strong>{t('{{name}}님', { name: userName })}</strong><span className="account-role" data-admin={role === 'ADMIN'}>{t(role === 'ADMIN' ? '관리자' : '일반 회원')}</span></div>
      <Link to={ROUTE_PATHS.RESERVATIONS} onClick={() => setOpen(false)}><FiFileText aria-hidden="true" />{t('내 예매')}</Link>
      {role === 'ADMIN' && <Link to={ROUTE_PATHS.ADMIN} onClick={() => setOpen(false)}><FiSettings aria-hidden="true" />{t('콘텐츠 관리')}</Link>}
      {role === 'ADMIN' && <Link to={ROUTE_PATHS.ADMIN_EVENT_NEW} onClick={() => setOpen(false)}><FiSettings aria-hidden="true" />{t('행사 등록')}</Link>}
      <Link to={ROUTE_PATHS.PAYMENTS} onClick={() => setOpen(false)}><FiCreditCard aria-hidden="true" />{t('결제 정보')}</Link>
      <div className="account-popover-divider" />
      <button type="button" className="account-popover-logout" disabled={busy} onClick={() => {
        void logout()
      }}><FiLogOut aria-hidden="true" />{t(busy ? '처리 중' : '로그아웃')}</button>
      {error && <p className="account-popover-error" role="alert">{error}</p>}
    </nav>}
  </div>
}

export default AccountMenu
