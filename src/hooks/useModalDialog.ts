import { useEffect, useRef } from 'react'

/** Open a mounted native dialog and restore page scrolling when it unmounts. */
const useModalDialog = (lockBody = true) => {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (element && !element.open) element.showModal()
    if (!lockBody) return undefined

    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = oldOverflow
    }
  }, [lockBody])

  return dialog
}

export default useModalDialog
