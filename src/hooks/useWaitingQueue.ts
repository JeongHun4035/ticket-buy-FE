import { useEffect, useRef, useState } from 'react'

import { getErrorMessage } from '@/api/client'
import { getQueue, leaveQueue } from '@/api/queue'

import type { WaitingRoomProps } from '@/types/interfaces/components/waitingRoom'

const useWaitingQueue = ({ performance, initialQueue, onAdmit, onCancel }: Omit<WaitingRoomProps, 'event'>) => {
  const cancelling = useRef(false)
  const [entry, setEntry] = useState(initialQueue)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const receive = async () => {
      try {
        const next = await getQueue(performance.id, controller.signal)
        if (controller.signal.aborted || cancelling.current) return
        setError('')
        setEntry(next)
        if (next.state === 'ADMITTED' && next.admissionToken) {
          onAdmit(next); return
        }
        if (next.state === 'WAITING') timer = setTimeout(() => {
          void receive()
        }, Math.max(1, next.pollAfterSeconds) * 1000)
      } catch (reason) {
        if (!controller.signal.aborted && !cancelling.current) setError(getErrorMessage(reason))
      }
    }
    timer = setTimeout(() => {
      void receive()
    }, retry ? 0 : Math.max(1, initialQueue.pollAfterSeconds) * 1000)
    return () => {
      controller.abort(); clearTimeout(timer)
    }
  }, [
    performance.id,
    initialQueue.pollAfterSeconds,
    onAdmit,
    retry,
  ])

  const cancel = async () => {
    if (cancelling.current) return
    cancelling.current = true
    setBusy(true)
    try {
      await leaveQueue(performance.id); onCancel()
    } catch (reason) {
      setError(getErrorMessage(reason)); cancelling.current = false; setBusy(false)
    }
  }

  return {
    entry,
    error,
    busy,
    cancel,
    retry: () => setRetry(value => value + 1),
  }
}
export default useWaitingQueue
