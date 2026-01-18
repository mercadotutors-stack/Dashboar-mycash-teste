import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import type { DateRange } from '../../types'
import { Icon } from '../ui/Icon'

interface DateRangePickerProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  onClose: () => void
  isDesktop: boolean
}

function buildMonthDays(reference: Date) {
  const start = startOfWeek(startOfMonth(reference), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(reference), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

function isInRange(day: Date, range: DateRange | null) {
  if (!range) return false
  const { startDate, endDate } = range
  if (!startDate) return false
  if (!endDate) return isSameDay(day, startDate)
  return isWithinInterval(day, { start: startDate, end: endDate })
}

function isEdge(day: Date, range: DateRange | null) {
  if (!range) return false
  const { startDate, endDate } = range
  return (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate))
}

const quickRanges = [
  { label: 'Este mês', build: (today: Date) => ({ startDate: startOfMonth(today), endDate: endOfMonth(today) }) },
  {
    label: 'Mês passado',
    build: (today: Date) => {
      const ref = subMonths(today, 1)
      return { startDate: startOfMonth(ref), endDate: endOfMonth(ref) }
    },
  },
  {
    label: 'Últimos 3 meses',
    build: (today: Date) => ({
      startDate: startOfMonth(subMonths(today, 2)),
      endDate: endOfMonth(today),
    }),
  },
  { label: 'Este ano', build: (today: Date) => ({ startDate: startOfYear(today), endDate: endOfYear(today) }) },
]

function MonthCalendar({
  month,
  draft,
  onDayClick,
}: {
  month: Date
  draft: DateRange | null
  onDayClick: (day: Date) => void
}) {
  const days = useMemo(() => buildMonthDays(month), [month])
  const monthLabel = format(month, 'LLLL yyyy', { locale: ptBR })

  return (
    <div className="w-full max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold capitalize text-text-primary">{monthLabel}</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary mb-1">
        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const insideMonth = day.getMonth() === month.getMonth()
          const selected = isInRange(day, draft)
          const edge = isEdge(day, draft)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={`
                h-9 w-9 rounded-full text-sm
                transition-colors duration-150
                ${selected ? 'bg-text-primary text-bg-primary' : 'text-text-primary'}
                ${edge ? 'ring-2 ring-sidebar-active ring-offset-2 ring-offset-bg-primary' : ''}
                ${insideMonth ? 'opacity-100' : 'opacity-50'}
              `}
            >
              {format(day, 'd', { locale: ptBR })}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePicker({ value, onChange, onClose, isDesktop }: DateRangePickerProps) {
  const today = new Date()
  const [baseMonth, setBaseMonth] = useState<Date>(value?.startDate ?? today)
  const [draft, setDraft] = useState<DateRange | null>(value ?? null)

  const handleDayClick = (day: Date) => {
    if (!draft || (draft.startDate && draft.endDate)) {
      setDraft({ startDate: day, endDate: null })
      return
    }

    if (draft.startDate && !draft.endDate) {
      if (day < draft.startDate) {
        setDraft({ startDate: day, endDate: draft.startDate })
      } else {
        setDraft({ startDate: draft.startDate, endDate: day })
      }
    }
  }

  const applyRange = (range: DateRange | null) => {
    onChange(range)
    onClose()
  }

  const handleQuick = (label: string) => {
    const quick = quickRanges.find((q) => q.label === label)
    if (!quick) return
    const range = quick.build(today)
    setDraft(range)
    applyRange(range)
  }

  const monthPrev = () => setBaseMonth((prev) => subMonths(prev, 1))
  const monthNext = () => setBaseMonth((prev) => addMonths(prev, 1))

  const firstMonth = baseMonth
  const secondMonth = addMonths(baseMonth, 1)

  return (
    <div
      className={`
        ${isDesktop ? 'absolute z-50 mt-3 left-0' : 'fixed inset-0 z-50 flex items-end'}
      `}
    >
      {!isDesktop && <div className="absolute inset-0 bg-black/50" onClick={onClose} />}
      <div
        className={`
          ${isDesktop ? 'relative w-[640px]' : 'relative w-full rounded-t-3xl'}
          bg-bg-primary border border-border rounded-2xl shadow-2xl
          p-4
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={monthPrev}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-primary"
              aria-label="Mês anterior"
            >
              <Icon name="chevronLeft" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={monthNext}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-primary"
              aria-label="Próximo mês"
            >
              <Icon name="chevronRight" className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickRanges.map((quick) => (
              <button
                key={quick.label}
                type="button"
                onClick={() => handleQuick(quick.label)}
                className="
                  px-3 py-2 rounded-full border border-border
                  text-sm font-medium text-text-primary
                  hover:bg-bg-secondary
                "
              >
                {quick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendars */}
        <div className={`flex ${isDesktop ? 'flex-row' : 'flex-col'} gap-6`}>
          <MonthCalendar month={firstMonth} draft={draft} onDayClick={handleDayClick} />
          {isDesktop && <MonthCalendar month={secondMonth} draft={draft} onDayClick={handleDayClick} />}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => applyRange(null)}
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => applyRange(draft)}
            className="
              px-4 py-2 rounded-full
              bg-text-primary text-bg-primary
              text-sm font-semibold
              hover:opacity-90
            "
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
