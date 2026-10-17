import { useState } from 'react'
import { ReferenceLine } from 'recharts'

import Chart from '@/components/common/Chart/Chart'

import type { ChartSeries, ChartType } from '@/types/interfaces/components'

import './Chart.css'

const data = [
  {
    month: '1월',
    sales: 120,
    profit: 30,
  },
  {
    month: '2월',
    sales: 180,
    profit: 60,
  },
  {
    month: '3월',
    sales: 150,
    profit: 45,
  },
  {
    month: '4월',
    sales: 230,
    profit: 90,
  },
  {
    month: '5월',
    sales: 210,
    profit: 75,
  },
  {
    month: '6월',
    sales: 280,
    profit: 110,
  },
]

const series: ChartSeries<(typeof data)[number]>[] = [
  {
    dataKey: 'sales',
    name: '매출',
    color: '#6366f1',
  },
  {
    dataKey: 'profit',
    name: '이익',
    color: '#10b981',
  },
]

const chartTypes: {
  value: ChartType,
  label: string,
}[] = [
  {
    value: 'line',
    label: '라인',
  },
  {
    value: 'bar',
    label: '막대',
  },
  {
    value: 'area',
    label: '영역',
  },
  {
    value: 'stacked-bar',
    label: '누적 막대',
  },
  {
    value: 'stacked-area',
    label: '누적 영역',
  },
  {
    value: 'pie',
    label: '파이',
  },
  {
    value: 'donut',
    label: '도넛',
  },
  {
    value: 'radar',
    label: '레이더',
  },
]

const ChartPage = () => {
  const [type, setType] = useState<ChartType>('line')
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const isCircular = type === 'pie' || type === 'donut'
  const isStacked = type === 'stacked-bar' || type === 'stacked-area'
  const chartData = data.map(item => ({
    ...item,
    cost: item.sales - item.profit,
  }))
  const activeSeries: ChartSeries<(typeof chartData)[number]>[] = isStacked ? [
    {
      dataKey: 'profit',
      name: '이익',
      color: '#6366f1',
    },
    {
      dataKey: 'cost',
      name: '비용',
      color: '#10b981',
    },
  ] : series

  return (
    <section className="chart-demo">
      <header>
        <h1>Chart</h1>
        <p>데이터와 시리즈를 props로 전달하고, 차트 종류와 표시 옵션을 변경해 보세요.</p>
      </header>
      <section className="chart-demo__card" aria-labelledby="chart-demo-basic">
        <h2 id="chart-demo-basic">{isStacked ? '월별 매출 구성 (이익 + 비용)' : '월별 매출과 이익'}</h2>
        <div className="chart-demo__controls">
          <div className="chart-demo__types" role="group" aria-label="차트 종류">
            {chartTypes.map(item => (
              <button key={item.value} type="button" aria-pressed={type === item.value} onClick={() => setType(item.value)}>{item.label}</button>
            ))}
          </div>
          <label><input type="checkbox" checked={showGrid} disabled={isCircular} onChange={event => setShowGrid(event.target.checked)} /> 격자</label>
          <label><input type="checkbox" checked={showLegend} onChange={event => setShowLegend(event.target.checked)} /> 범례</label>
          <label><input type="checkbox" checked={showTooltip} onChange={event => setShowTooltip(event.target.checked)} /> 툴팁</label>
        </div>
        <p>{isCircular ? '매출과 이익을 각각 월별 비중으로 표시합니다.' : type === 'radar' ? '월별 매출과 이익을 방사형 축에서 비교합니다.' : isStacked ? '이익과 비용을 누적해 전체 매출을 표시합니다.' : '월별 추이를 비교합니다.'}</p>
        <Chart data={chartData} xKey="month" series={activeSeries} type={type} showGrid={showGrid} showLegend={showLegend} showTooltip={showTooltip} />
        <pre className="chart-demo__code"><code>{`<Chart
  data={${isStacked ? 'data.map(item => ({ ...item, cost: item.sales - item.profit }))' : 'data'}}
  xKey="month"
  series={${isStacked ? "[{ dataKey: 'profit', name: '이익' }, { dataKey: 'cost', name: '비용' }]" : 'series'}}
  type="${type}"
  showGrid={${showGrid}}
  showLegend={${showLegend}}
  showTooltip={${showTooltip}}
/>`}</code></pre>
      </section>
      <section className="chart-demo__card" aria-labelledby="chart-demo-composed">
        <h2 id="chart-demo-composed">막대 + 라인 + 목표선</h2>
        <p>시리즈별 type을 지정해 차트를 혼합하고, children으로 기준선을 추가할 수 있습니다.</p>
        <Chart data={data} xKey="month" series={[
          {
            ...series[0],
            dataKey: 'sales',
            type: 'bar',
          },
          {
            ...series[1],
            dataKey: 'profit',
            type: 'line',
          },
        ]}>
          <ReferenceLine y={200} label={{
            value: '매출 목표',
            fill: 'var(--text-secondary)',
          }} stroke="#f59e0b" strokeDasharray="4 4" />
        </Chart>
        <pre className="chart-demo__code"><code>{`<Chart data={data} xKey="month" series={[
  { dataKey: 'sales', name: '매출', type: 'bar' },
  { dataKey: 'profit', name: '이익', type: 'line' },
]}>
  <ReferenceLine y={200} label="매출 목표" />
</Chart>`}</code></pre>
      </section>
    </section>
  )
}

export default ChartPage
