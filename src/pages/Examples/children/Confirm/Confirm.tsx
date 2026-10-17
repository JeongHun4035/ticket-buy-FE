import { useState } from 'react'

import Button from '@/components/common/Button/Button'
import Confirm from '@/components/common/Confirm/Confirm'

const ConfirmPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div>
      <h1>
        Confirm Example Page
      </h1>
      <Button onClick={() => setIsOpen(true)} > Open Confirm</Button>
      <Confirm
        isOpen={isOpen}
        title="Confirm"
        onConfirm={() => setIsOpen(false)}
        onClose={() => setIsOpen(false)}
        contents="Is OK?"
      />
    </div>
  )
}

export default ConfirmPage