import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import SeatMap from '@/components/common/SeatMap/SeatMap'
import { createVenueExampleSeats } from '@/components/common/SeatMap/seatModel'

const SeatMapExample = () => {
  const { t } = useTranslation()
  const [capacity, setCapacity] = useState(5000)
  const [selected, setSelected] = useState<string[]>([])
  const seats = useMemo(() => createVenueExampleSeats(capacity), [capacity])
  return <section className="service-page">
    <h1>{t('공연장 규모 미리보기')}</h1>
    <p>{t('예제 좌석이며 실제 예매에는 사용되지 않습니다.')}</p>
    <label>{t('공연장 규모')} <select value={capacity} onChange={event => {
      setCapacity(Number(event.target.value)); setSelected([])
    }}>{[
        500,
        5000,
        30000,
      ].map(value => <option key={value} value={value}>{t('전체 {{count}}석', { count: value })}</option>)}</select></label>
    <SeatMap seats={seats} selectedIds={selected} onChange={setSelected} />
  </section>
}
export default SeatMapExample
