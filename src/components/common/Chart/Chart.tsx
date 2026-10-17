import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ChartProps } from '@/types/interfaces/components'

const colors = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
]

const Chart = <T extends object>({
  data,
  xKey,
  series,
  type = 'line',
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  children,
}: ChartProps<T>) => {
  if (data.length === 0) {
    return <div style={{
      height,
      display: 'grid',
      placeItems: 'center',
    }} role="status">표시할 데이터가 없습니다.</div>
  }

  const tooltip = showTooltip && <Tooltip contentStyle={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)',
  }} />
  const legend = showLegend && <Legend />

  if (type === 'pie' || type === 'donut') {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {series.map(item => (
          <div key={item.dataKey} style={{
            flex: '1 1 240px',
            minWidth: 0,
          }}>
            <p style={{ textAlign: 'center' }}>{item.name ?? item.dataKey}</p>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie data={data} dataKey={item.dataKey} nameKey={xKey} innerRadius={type === 'donut' ? '45%' : 0} outerRadius="75%" paddingAngle={2}>
                  {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length] ?? '#6366f1'} />)}
                </Pie>
                {tooltip}
                {legend}
                {children}
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'radar') {
    return (
      <div style={{
        width: '100%',
        minWidth: 0,
        height,
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            {showGrid && <PolarGrid stroke="var(--border-color)" />}
            <PolarAngleAxis dataKey={xKey} tick={{ fill: 'var(--text-secondary)' }} />
            <PolarRadiusAxis tick={{ fill: 'var(--text-secondary)' }} />
            {series.map((item, index) => (
              <Radar key={item.dataKey} dataKey={item.dataKey} name={item.name ?? item.dataKey} stroke={item.color ?? colors[index % colors.length]} fill={item.color ?? colors[index % colors.length]} fillOpacity={0.2} />
            ))}
            {tooltip}
            {legend}
            {children}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      minWidth: 0,
      height,
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{
          top: 20,
          right: 24,
          bottom: 8,
          left: 0,
        }}>
          {showGrid && <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey={xKey} tick={{ fill: 'var(--text-secondary)' }} />
          <YAxis tick={{ fill: 'var(--text-secondary)' }} />
          {tooltip}
          {legend}
          {series.map((item, index) => {
            const color = item.color ?? colors[index % colors.length] ?? '#6366f1'
            const seriesType = item.type ?? type
            const props = {
              dataKey: item.dataKey,
              name: item.name ?? item.dataKey,
              stroke: color,
              fill: color,
            }
            const stackId = item.stackId ?? (seriesType === 'stacked-bar' || seriesType === 'stacked-area' ? 'total' : undefined)
            const stackProps = stackId === undefined ? {} : { stackId }

            if (seriesType === 'bar' || seriesType === 'stacked-bar') {
              return <Bar key={item.dataKey} {...props} {...stackProps} maxBarSize={48} />
            }

            if (seriesType === 'area' || seriesType === 'stacked-area') {
              return <Area key={item.dataKey} {...props} {...stackProps} type="monotone" fillOpacity={0.18} strokeWidth={2} />
            }

            return <Line key={item.dataKey} {...props} type="monotone" strokeWidth={2} dot={false} />
          })}
          {children}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart
