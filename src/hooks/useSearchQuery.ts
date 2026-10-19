import { useState } from 'react'

/** Typing is local; only an explicit submission changes API query dependencies. */
const useSearchQuery = () => {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState({ value: '' })

  const submit = () => {
    setQuery({ value: input.trim() })
  }

  return {
    input,
    setInput,
    query,
    submit,
  }
}

export default useSearchQuery
