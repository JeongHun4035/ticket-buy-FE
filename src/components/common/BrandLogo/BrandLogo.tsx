import { useTranslation } from 'react-i18next'
import { FiGrid } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/routes/route'

import './BrandLogo.css'

const BrandLogo = () => {
  const { t } = useTranslation()
  return (
    <Link className="brand-logo" to={ROUTE_PATHS.MAIN} aria-label={t('티켓바이 홈')}>
      <span className="brand-logo__icon"><FiGrid aria-hidden="true" /></span>
      <span className="brand-logo__name">TICKET<span>BUY</span></span>
    </Link>
  )
}

export default BrandLogo
