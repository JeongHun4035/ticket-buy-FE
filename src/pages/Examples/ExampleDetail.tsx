import { Outlet } from 'react-router-dom'

const ExampleDetail = () => {
  return (
    <>
      <div className="example-content">
        <Outlet />
      </div>
    </>
  )
}

export default ExampleDetail