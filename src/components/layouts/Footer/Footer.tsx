import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { getSupportInfo } from '@/api/ticket'
import BrandLogo from '@/components/common/BrandLogo/BrandLogo'
import useApiQuery from '@/hooks/useApiQuery'
import { ROUTE_PATHS } from '@/routes/route'

import './Footer.css'

const Footer = () => {
  const { t } = useTranslation()
  const support = useApiQuery(getSupportInfo)

  return <div className="footer-area">
    <div className="ticket-footer-inner">
      <div className="ticket-footer-company">
        <section className="ticket-footer-about" aria-label={t('회사 소개')}>
          <BrandLogo />
          <p>{t('주식회사 티켓바이컬처')}</p>
          <address>{t('서울특별시 성동구 컬처로 24')} · {t('티켓바이 타워 8층, 컬처캠퍼스')}</address>
        </section>
        <section className="ticket-footer-support" aria-labelledby="footer-support-title">
          <h2 id="footer-support-title">{t('고객센터')}</h2>
          {support.data?.phone && <strong className="ticket-footer-phone">{support.data.phone}</strong>}
          <span className="ticket-footer-email">{support.data?.email ?? support.data?.message}</span>
          <p>{t('평일 09:00–18:00 · 점심 12:00–13:00')}</p>
        </section>
      </div>
      <div className="ticket-footer-bottom">
        <p>© {new Date().getFullYear()} TICKET BUY CULTURE.</p>
        <nav aria-label={t('푸터 메뉴')}>
          <Link to={ROUTE_PATHS.MAIN}>{t('홈')}</Link>
          <Link to={`${ROUTE_PATHS.MAIN}#event-list`}>{t('공연 · 행사')}</Link>
        </nav>
      </div>
      <div className="ticket-footer-meta">
        <p aria-label={t('가상 파트너 및 스폰서')}>NOVA · SCENE LAB. · AURORA</p>
        <p>{t('본사 주소, 회사 정보, 고객센터 및 스폰서는 디자인을 위한 가상 정보입니다.')}</p>
      </div>
    </div>
  </div>
}

export default Footer
