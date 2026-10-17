import Button from '@/components/common/Button/Button'
import { useToast } from '@/hooks/useToast'

const ToastPage = () => {
  const { toast } = useToast()
  return (
    <div>
      <h1>Toast Example Page</h1>
      <p>알림은 우측 상단에 표시되며 3초 후 닫힙니다.</p>
      <Button onClick={() => toast('저장되었습니다.', { variant: 'success' })}>성공 알림</Button>
      <Button onClick={() => toast('다시 시도해 주세요.', { variant: 'error' })}>오류 알림</Button>
      <Button onClick={() => toast('새로운 알림이 있습니다.')}>안내 알림</Button>
      <Button onClick={() => toast('닫기 버튼으로 닫아 주세요.', { duration: 0 })}>유지되는 알림</Button>
    </div>
  )
}

export default ToastPage
