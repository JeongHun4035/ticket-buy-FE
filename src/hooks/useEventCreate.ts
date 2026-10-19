import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { createAdminEvent } from '@/api/adminEvents'
import { getErrorMessage } from '@/api/client'
import { ApiError } from '@/api/http'
import { useToast } from '@/hooks/useToast'
import { buildEventPayload, newEventDraft, validatePosterFile } from '@/utils/adminEvents'

import type { EventCreated } from '@/types/interfaces/api/adminEvents'

const useEventCreate = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [draft, setDraft] = useState(newEventDraft)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [validating, setValidating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<EventCreated | null>(null)
  const [uncertain, setUncertain] = useState(false)
  const [retryAt, setRetryAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const pending = useRef(false)
  const imageRequest = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  useEffect(() => () => {
    imageRequest.current++
  }, [])
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview)
  }, [preview])
  useEffect(() => {
    if (!retryAt) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [retryAt])
  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])
  const chooseImage = async (file: File) => {
    const requestId = ++imageRequest.current
    setValidating(true); setError('')
    try {
      await validatePosterFile(file)
      if (requestId !== imageRequest.current) return
      setImage(file); setPreview(URL.createObjectURL(file))
    } catch (reason) {
      if (requestId === imageRequest.current) setError(t(reason instanceof Error ? reason.message : 'INVALID_IMAGE'))
    } finally {
      if (requestId === imageRequest.current) setValidating(false)
    }
  }
  const submit = async () => {
    if (pending.current || validating || uncertain || Date.now() < retryAt || result) return
    pending.current = true; setBusy(true); setError('')
    let submitted = false
    try {
      if (!image) throw new Error('IMAGE_REQUIRED')
      const payload = buildEventPayload(draft)
      submitted = true
      const created = await createAdminEvent(payload, image)
      setResult(created)
      window.dispatchEvent(new Event('ticket-buy:events-updated'))
      toast(t('행사가 등록되었습니다.'), { variant: 'success' })
    } catch (reason) {
      if (reason instanceof ApiError) {
        if (reason.status === 429) {
          setRetryAt(Date.now() + Math.max(1, reason.retryAfterSeconds ?? 3) * 1000); setNow(Date.now())
        }
        const data = reason.data as { traceId?: string } | null
        const message = reason.status >= 500 ? t('서버 오류가 발생했습니다. 잠시 후 다시 시도하거나 문의해주세요.') : getErrorMessage(reason)
        setError(message + (typeof data?.traceId === 'string' ? ' · ' + t('문의 번호') + ': ' + data.traceId : ''))
      } else if (submitted) {
        setUncertain(true); setError(t('등록 결과를 확인하지 못했습니다. 행사 목록에서 등록 여부를 먼저 확인해주세요. 다시 제출하면 중복 등록될 수 있습니다.'))
      } else setError(t(reason instanceof Error ? reason.message : 'INVALID_REQUEST'))
    } finally {
      pending.current = false; setBusy(false)
    }
  }

  const clearImage = () => {
    imageRequest.current++
    setImage(null)
    setPreview('')
    setValidating(false)
  }
  const allowResubmit = () => {
    setUncertain(false)
    setError('')
  }
  return {
    draft,
    setDraft,
    image,
    preview,
    validating,
    busy,
    error,
    result,
    uncertain,
    retryAt,
    now,
    fileInput,
    errorRef,
    chooseImage,
    clearImage,
    allowResubmit,
    submit,
  }
}
export default useEventCreate
