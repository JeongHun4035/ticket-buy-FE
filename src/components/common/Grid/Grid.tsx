

import type { GridProps } from '@/types/interfaces/components'

import './Grid.css'

/** Pass only the current page's rows in data; pagination works with local or server data. */
const Grid = <T = unknown>({ columns, data, rowKey, caption = '데이터 목록', loading = false, emptyMessage = '표시할 데이터가 없습니다.', footer, className = '' }: GridProps<T>) => {
  return (
    <div className={`common-grid ${className}`}>
      <div className="common-grid__scroll" role="region" aria-label={caption} tabIndex={0} aria-busy={loading}>
        <table>
          <caption className="common-grid__caption">{caption}</caption>
          <thead>
            <tr>
              {columns.map(column => <th key={column.key} scope="col" style={{
                width: column.width,
                textAlign: column.align ?? 'left',
              }}>{column.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading || data.length === 0 ? (
              <tr><td colSpan={Math.max(1, columns.length)} className="common-grid__empty">
                {loading ? '데이터를 불러오는 중입니다…' : emptyMessage}
              </td></tr>
            ) : data.map((row, index) => (
              <tr key={rowKey(row)}>
                {columns.map(column => <td key={column.key} style={{ textAlign: column.align ?? 'left' }}>{column.render(row, index)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="common-grid__caption" role="status">{loading ? '데이터를 불러오는 중입니다.' : data.length === 0 ? emptyMessage : ''}</span>
      {footer && <div className="common-grid__footer">{footer}</div>}
    </div>
  )
}

export default Grid
