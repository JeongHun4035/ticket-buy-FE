import { Outlet } from 'react-router-dom'

import Footer from '@/components/layouts/Footer/Footer'
import Header from '@/components/layouts/Header/Header'
import './Layout.css'

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <header className="header">
        <Header />
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <Footer />
      </footer>
    </div>
  )
}

export default Layout