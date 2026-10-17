import { useState } from 'react'

import Select from '@/components/common/Select/Select'

const SelectPage = () => {
  const [value, setValue] = useState('10')
  return (
    <div>
      <h1>
        Select Example Page
      </h1>
      <Select label="페이지당 표시 개수" value={value} onChange={setValue} options={[
        {
          value: 10,
          label: '10개',
        },
        {
          value: 20,
          label: '20개',
        },
        {
          value: 50,
          label: '50개',
        },
      ]} />
      <p>선택한 값: {value}</p>
    </div>
  )
}

export default SelectPage
