import { useState } from 'react'

import DatePicker from '@/components/common/DatePicker/DatePicker'

const DatePickerPage = () => {
  const [date, setDate] = useState('')
  return (
    <div>
      <h1>DatePicker Example Page</h1>
      <p>선택한 value: <output>{date || '선택되지 않음'}</output></p>
      <DatePicker label="날짜 선택" name="date" value={date} onChange={setDate} />
    </div>
  )
}

export default DatePickerPage
