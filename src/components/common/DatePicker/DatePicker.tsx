import { useEffect, useId, useRef, useState } from 'react'

import { formatDate } from '@/utils/date'

import type { DatePickerProps } from '@/types/interfaces/components'

import './DatePicker.css'

const calendarDate = (year: number, month: number, day: number) => {
  const date = new Date(0)
  date.setHours(0, 0, 0, 0)
  date.setFullYear(year, month, day)
  return date
}

const parseDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime()) && date.getFullYear() >= 1 && formatDate(date) === value ? date : null
}

const weekdays = [
  '일',
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
]

/** value, min, max and onChange use calendar dates formatted as YYYY-MM-dd. */
const DatePicker = ({ value, onChange, id, name, label = '날짜', disabled = false, min, max }: DatePickerProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const calendar = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => parseDate(value) ?? new Date())
  const selected = parseDate(value)
  const formattedValue = selected ? formatDate(selected) : ''
  const lowerBound = min && parseDate(min) ? min : '0001-01-01'
  const upperBound = max && parseDate(max) ? max : '9999-12-31'
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDay = calendarDate(year, monthIndex, 1).getDay()
  const daysInMonth = calendarDate(year, monthIndex + 1, 0).getDate()
  const today = formatDate(new Date())
  const isOpen = open && !disabled

  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handleOutside)
    const selectedDay = calendar.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]:not(:disabled)')
    const firstAvailableDay = calendar.current?.querySelector<HTMLButtonElement>('.date-picker__day:not(:disabled)')
    ;(selectedDay ?? firstAvailableDay)?.focus()
    return () => document.removeEventListener('pointerdown', handleOutside)
  }, [isOpen])

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }

  return (
    <div
      ref={root}
      className="date-picker"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation()
          close()
        }
      }}
    >
      <label htmlFor={inputId}>{label}</label>
      <input type="hidden" name={name} value={formattedValue} disabled={disabled} />
      <button
        ref={trigger}
        type="button"
        id={inputId}
        className="date-picker__trigger"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${inputId}-calendar` : undefined}
        onClick={() => {
          if (!open) {
            const initial = formattedValue || today
            setMonth(parseDate(initial < lowerBound ? lowerBound : initial > upperBound ? upperBound : initial) ?? new Date())
          }
          setOpen(current => !current)
        }}
      >
        <span>{formattedValue || 'YYYY-MM-dd'}</span>
        <span aria-hidden="true">▦</span>
      </button>
      {isOpen && (
        <div ref={calendar} id={`${inputId}-calendar`} className="date-picker__calendar" role="group" aria-label={`${label} 선택`}>
          <div className="date-picker__header">
            <button type="button" aria-label="이전 달" disabled={formatDate(calendarDate(year, monthIndex, 0)) < lowerBound} onClick={() => setMonth(calendarDate(year, monthIndex - 1, 1))}>‹</button>
            <strong aria-live="polite">{year}년 {monthIndex + 1}월</strong>
            <button type="button" aria-label="다음 달" disabled={(year === 9999 && monthIndex === 11) || formatDate(calendarDate(year, monthIndex + 1, 1)) > upperBound} onClick={() => setMonth(calendarDate(year, monthIndex + 1, 1))}>›</button>
          </div>
          <div className="date-picker__grid">
            {weekdays.map(day => <span className="date-picker__weekday" key={day}>{day}</span>)}
            {Array.from({ length: firstDay }, (_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = formatDate(calendarDate(year, monthIndex, index + 1))
              return (
                <button
                  key={date}
                  type="button"
                  className="date-picker__day"
                  aria-label={date}
                  aria-pressed={date === formattedValue}
                  aria-current={date === today ? 'date' : undefined}
                  disabled={date < lowerBound || date > upperBound}
                  onClick={() => {
                    onChange(date)
                    close()
                  }}
                >{index + 1}</button>
              )
            })}
          </div>
          <button type="button" className="date-picker__clear" onClick={() => {
            onChange('')
            close()
          }}>날짜 지우기</button>
        </div>
      )}
    </div>
  )
}

export default DatePicker
