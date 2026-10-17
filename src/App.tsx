import AppRouter from '@/AppRouter'
import AuthProvider from '@/contexts/auth/AuthProvider'
import ToastProvider from '@/contexts/toast/ToastProvider'

const App = () => {
  return <AuthProvider><ToastProvider><AppRouter /></ToastProvider></AuthProvider>
}

export default App

