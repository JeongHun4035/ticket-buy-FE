import type { ReactNode } from 'react'

export type CartesianChartType = 'line' | 'bar' | 'area' | 'stacked-bar' | 'stacked-area'

export type ChartType = CartesianChartType | 'pie' | 'donut' | 'radar'

export interface ChartSeries<T> {
  dataKey: Extract<keyof T, string>,
  name?: string,
  color?: string,
  type?: CartesianChartType,
  stackId?: string,
}

export interface ChartProps<T extends object> {
  data: T[],
  xKey: Extract<keyof T, string>,
  series: ChartSeries<T>[],
  type?: ChartType,
  height?: number,
  showGrid?: boolean,
  showTooltip?: boolean,
  showLegend?: boolean,
  children?: ReactNode,
}
