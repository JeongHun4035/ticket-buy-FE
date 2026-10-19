import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getErrorMessage } from '@/api/client'
import { createReservation } from '@/api/reservations'
import { createHold, getSeats, releaseHold } from '@/api/seats'
import { useToast } from '@/hooks/useToast'

import useApiQuery from './useApiQuery'

import type { Reservation } from '@/types/interfaces/api/reservations'
import type { SeatHold } from '@/types/interfaces/api/seats'
import type { SeatBookingProps } from '@/types/interfaces/components/bookingDialog'

const useSeatBooking = ({ performance, admission, onClose }: Omit<SeatBookingProps, 'event'>) => {
  const { toast } = useToast()
  const holdRef = useRef<SeatHold | null>(null)
  const idempotencyKey = useRef('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [hold, setHold] = useState<SeatHold | null>(null)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(Date.now())
  const token = admission.admissionToken ?? ''
  const load = useCallback((signal: AbortSignal) => getSeats(performance.id, token, signal), [performance.id, token])
  const query = useApiQuery(load)
  const seats = useMemo(() => (query.data?.items ?? []).map(seat => ({
    ...seat,
    reserved: seat.status !== 'AVAILABLE',
  })), [query.data])
  const chosen = hold?.seats ?? seats.filter(seat => selectedIds.includes(seat.id))
  const total = hold?.total ?? chosen.reduce((sum, seat) => sum + seat.price, 0)
  const seconds = hold ? Math.max(0, Math.ceil((Date.parse(hold.expiresAt) - now) / 1000)) : null
  const admissionExpired = !!admission.admissionExpiresAt && Date.parse(admission.admissionExpiresAt) <= now
  const expired = seconds === 0 || admissionExpired

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearInterval(timer)
      if (holdRef.current) void releaseHold(holdRef.current.id).catch(() => { /* Server expiry releases disconnected holds. */ })
    }
  }, [])

  const close = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (holdRef.current) await releaseHold(holdRef.current.id)
    } catch (reason) {
      toast(getErrorMessage(reason), { variant: 'error' })
    } finally {
      holdRef.current = null; onClose()
    }
  }
  const secure = async () => {
    if (busy || selectedIds.length === 0 || expired) return
    setBusy(true); setError('')
    try {
      const result = await createHold(performance.id, token, selectedIds)
      holdRef.current = result
      setHold(result)
      idempotencyKey.current = crypto.randomUUID()
    } catch (reason) {
      setError(getErrorMessage(reason)); setSelectedIds([]); query.reload()
    } finally {
      setBusy(false)
    }
  }
  const reset = async () => {
    if (!hold || busy) return
    setBusy(true); setError('')
    try {
      await releaseHold(hold.id); holdRef.current = null; setHold(null); setSelectedIds([]); query.reload()
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }
  const confirm = async () => {
    if (!hold || busy || expired) return
    setBusy(true); setError('')
    try {
      const result = await createReservation(hold.id, token, idempotencyKey.current)
      holdRef.current = null
      setReservation(result)
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return {
    query,
    seats,
    selectedIds,
    setSelectedIds,
    hold,
    reservation,
    busy,
    error,
    chosen,
    total,
    seconds,
    admissionExpired,
    expired,
    close,
    secure,
    reset,
    confirm,
  }
}
export default useSeatBooking
