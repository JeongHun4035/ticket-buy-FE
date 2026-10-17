import './NotFound.css'

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1>404 - Not Found</h1>
      <p>Current Page Not exist <br />
        please check the URL or contact the administrator.
      </p>
    </div>
  )
}

export default NotFound