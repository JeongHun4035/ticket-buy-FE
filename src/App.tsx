import AppRouter from '@/AppRouter'
import ApiErrorRedirect from '@/components/common/ErrorScreen/ApiErrorRedirect'
import AuthProvider from '@/contexts/auth/AuthProvider'
import ToastProvider from '@/contexts/toast/ToastProvider'

const App = () => {
  return <AuthProvider><ToastProvider><ApiErrorRedirect /><AppRouter /></ToastProvider></AuthProvider>
}

export default App

