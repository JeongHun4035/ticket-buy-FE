import AppRouter from '@/AppRouter'
import ToastProvider from '@/contexts/toast/ToastProvider'

const App = () => {
  return <ToastProvider><AppRouter /></ToastProvider>
}

export default App
