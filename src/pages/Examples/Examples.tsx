import './Examples.css'
import { Link } from 'react-router-dom'

import { ROUTE_PATHS } from '@/routes/route'

const ExampleItems: React.FC = () => {
  const exampleItems = [
    {
      id: 'chart',
      title: 'Chart',
      path: ROUTE_PATHS.CHART,
    },
    {
      id: 'infinite-scroll',
      title: 'Infinite Scroll',
    },
    {
      id: 'grid',
      title: 'Grid',
      path: ROUTE_PATHS.GRID,
    },
    {
      id: 'pagination',
      title: 'Pagination',
      path: ROUTE_PATHS.PAGINATION,
    },
    {
      id: 'toast',
      title: 'Toast',
    },
    {
      id: 'datepicker',
      title: 'DatePicker',
    },
    {
      id: 'select',
      title: 'Select',
    },
    {
      id: 'popup',
      title: 'Popup',
    },
    {
      id: 'confirm',
      title: 'Confirm',
    },
  ]

  return (
    <div className="example-items">
      {exampleItems.map(item => (
        <Link className="example-item" key={item.id} to={item.path ?? `${ROUTE_PATHS.EXAMPLES}/${item.id}`}>
          <h2>{item.title}</h2>
        </Link>
      ))}
    </div>
  )
}


const Examples: React.FC = () => {
  return (
    <div className="examples-container">
      <ExampleItems />
    </div>
  )
}

export default Examples
