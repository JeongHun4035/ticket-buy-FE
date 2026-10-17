export const retryDelay = (milliseconds: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  signal?.throwIfAborted()
  const stop = () => {
    clearTimeout(timer)
    signal?.removeEventListener('abort', stop)
    reject(signal?.reason)
  }
  const timer = setTimeout(() => {
    signal?.removeEventListener('abort', stop)
    resolve()
  }, milliseconds)
  signal?.addEventListener('abort', stop, { once: true })
})
