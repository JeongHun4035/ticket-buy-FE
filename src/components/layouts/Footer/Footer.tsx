import { useTranslation } from 'react-i18next'
import { FiArrowUpRight, FiHeadphones, FiMapPin } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { getSupportInfo } from '@/api/ticket'
import BrandLogo from '@/components/common/BrandLogo/BrandLogo'
import useApiQuery from '@/hooks/useApiQuery'
import { ROUTE_PATHS } from '@/routes/route'

import './Footer.css'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const support = useApiQuery(getSupportInfo)

  return (
    <div className="footer-area">
      <div className="ticket-footer-inner">
        <div className="ticket-footer-partners">
          <div><span className="ticket-footer-eyebrow">OUR PARTNERS</span><h2>{t('문화의 다음 장을 함께 만듭니다.')}</h2></div>
          <ul aria-label={t('가상 파트너 및 스폰서')}>
            <li className="ticket-footer-sponsor ticket-footer-sponsor--nova"><span aria-hidden="true">✳</span><div>NOVA<small>CULTURE GROUP</small></div></li>
            <li className="ticket-footer-sponsor ticket-footer-sponsor--scene">SCENE<span>LAB.</span></li>
            <li className="ticket-footer-sponsor ticket-footer-sponsor--aurora"><span aria-hidden="true">◈</span>AURORA<small>ARTS FOUNDATION</small></li>
          </ul>
        </div>
        <div className="ticket-footer-company">
          <section className="ticket-footer-about" aria-label={t('회사 소개')}><BrandLogo /><p>{t('좋은 공연과 당신 사이, 티켓바이.')}<br />{t('설레는 발견부터 오래 남을 기억까지 함께합니다.')}</p><span className="ticket-footer-company-name">{t('주식회사 티켓바이컬처')}</span></section>
          <section className="ticket-footer-office" aria-labelledby="footer-office-title"><h2 id="footer-office-title"><FiMapPin aria-hidden="true" />{t('본사 안내')}</h2><address>{t('서울특별시 성동구 컬처로 24')}<br />{t('티켓바이 타워 8층, 컬처캠퍼스')}<span>04700 · SEOUL, KOREA</span></address><p>{t('대표이사')} <strong>{t('김티켓')}</strong><span>·</span>{t('사업자등록번호')} 000-00-00000</p></section>
          <section className="ticket-footer-support" aria-labelledby="footer-support-title"><h2 id="footer-support-title"><FiHeadphones aria-hidden="true" />{t('고객센터')}</h2><strong className="ticket-footer-phone">{support.data?.phone}</strong><p>{t('평일 09:00–18:00 · 점심 12:00–13:00')}<br />{t('주말 및 공휴일 휴무')}</p><span className="ticket-footer-email">{support.data?.email ?? support.data?.message}</span></section>
        </div>
        <div className="ticket-footer-bottom"><p>© {new Date().getFullYear()} TICKET BUY CULTURE. All rights reserved.</p><nav aria-label={t('푸터 메뉴')}><Link to={ROUTE_PATHS.MAIN}>{t('홈')}<FiArrowUpRight aria-hidden="true" /></Link><Link to={`${ROUTE_PATHS.MAIN}#event-list`}>{t('공연 · 행사')}<FiArrowUpRight aria-hidden="true" /></Link><Link to={ROUTE_PATHS.SIGN_IN}>{t('로그인')}<FiArrowUpRight aria-hidden="true" /></Link></nav></div>
        <p className="ticket-footer-demo">{t('본사 주소, 회사 정보, 고객센터 및 스폰서는 디자인을 위한 가상 정보입니다.')}</p>
      </div>
    </div>
  )
}

export default Footer
