import { useCallback, useRef, useState } from 'react'

import { getErrorMessage } from '@/api/client'
import { cancelReservation, getReservation, getReservations } from '@/api/reservations'

import useApiQuery from './useApiQuery'
import useAuth from './useAuth'

import type { Reservation } from '@/types/interfaces/api/reservations'

const useReservations = () => {
  const auth = useAuth()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const load = useCallback((signal: AbortSignal) => auth.user ? getReservations(page, limit, signal) : Promise.resolve(null), [
    auth.user,
    page,
    limit,
  ])
  const list = useApiQuery(load)
  const open = async (id: string) => {
    if (busy) return
    setBusy(true); setError('')
    try {
      setSelected(await getReservation(id)); dialog.current?.showModal()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const cancel = async () => {
    if (!selected || busy) return
    setBusy(true); setError('')
    try {
      setSelected(await cancelReservation(selected.id)); list.reload()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return {
    page,
    setPage,
    limit,
    setLimit,
    selected,
    setSelected,
    busy,
    error,
    dialog,
    list,
    open,
    cancel,
  }
}
export default useReservations
