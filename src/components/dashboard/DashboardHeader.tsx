import { useEffect, useMemo, useRef, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { FilterPopover, FilterModal } from './FilterPopover'
import { DateRangePicker } from './DateRangePicker'
import { formatDateRange } from '../../utils'
import type { DateRange } from '../../types'

const getCurrentMonthRange = (): DateRange => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { startDate: start, endDate: end }
}

type Props = {
  onAddMember: () => void
  onNewTransaction: () => void
}

export function DashboardHeader({ onAddMember, onNewTransaction }: Props) {
  const {
    filters,
    setSearchText,
    setTransactionType,
    setDateRange,
    setSelectedMember,
    familyMembers,
  } = useFinance()

  const [searchValue, setSearchValue] = useState(filters.searchText ?? '')
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isFilterModalOpen, setFilterModalOpen] = useState(false)
  const [isDateOpen, setDateOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)
  const filterRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)

  // Atualiza filtro em tempo real
  useEffect(() => {
    setSearchText(searchValue)
  }, [searchValue, setSearchText])

  // Define intervalo inicial para mês corrente, se não houver
  useEffect(() => {
    if (!filters.dateRange) {
      const range = getCurrentMonthRange()
      setDateRange(range)
    }
  }, [filters.dateRange, setDateRange])

  // Listener de viewport para saber se é desktop (lg breakpoint ~1280px)
  useEffect(() => {
    const handler = () => {
      setIsDesktop(window.matchMedia('(min-width: 1280px)').matches)
    }
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Fechar popovers ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setDateOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const rangeLabel = useMemo(() => {
    if (!filters.dateRange) return 'Selecionar período'
    return formatDateRange(filters.dateRange.startDate, filters.dateRange.endDate)
  }, [filters.dateRange])

  const handleFilterClick = () => {
    const desktop = window.matchMedia('(min-width: 1280px)').matches
    setIsDesktop(desktop)
    if (desktop) {
      setFilterOpen((prev) => !prev)
    } else {
      setFilterModalOpen(true)
    }
  }

  const handleDateClick = () => {
    const desktop = window.matchMedia('(min-width: 1280px)').matches
    setIsDesktop(desktop)
    setDateOpen((prev) => !prev)
  }

  const handleMemberToggle = (id: string) => {
    const next = filters.selectedMember === id ? null : id
    setSelectedMember(next)
  }

  return (
    <div className="w-full flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Esquerda: busca, filtros, período */}
      <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3 lg:gap-4 lg:flex-1">
        <div className="relative flex-1 basis-0 min-w-[200px] sm:min-w-[240px] w-full sm:w-auto">
          <Icon name="search" className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Pesquisar..."
            className="
              w-full pl-11 pr-4 py-3
              rounded-full border border-border
              bg-bg-primary text-text-primary
              focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary
              text-base transition-input
            "
          />
        </div>

        <div className="relative shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={handleFilterClick}
            className="
              w-12 h-12 rounded-full border border-border
              bg-bg-primary text-text-primary
              flex items-center justify-center
              shadow-sm hover:bg-bg-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-bg-primary
              transition-button
            "
            aria-label="Abrir filtros"
          >
            <Icon name="tune" className="w-5 h-5" />
          </button>
          {isFilterOpen && isDesktop && (
            <div className="relative">
              <FilterPopover
                value={filters.transactionType}
                onSelect={(type) => {
                  setTransactionType(type)
                  setFilterOpen(false)
                }}
                onClose={() => setFilterOpen(false)}
              />
            </div>
          )}
        </div>

        <div className="relative shrink-0" ref={dateRef}>
          <button
            type="button"
            onClick={handleDateClick}
            className="
              flex items-center gap-2
              px-4 py-3 rounded-full
              border border-border bg-bg-primary
              shadow-sm
              text-text-primary font-medium
              hover:bg-bg-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-bg-primary
              transition-button
            "
          >
            <Icon name="calendar" className="w-5 h-5" />
            <span className="text-sm sm:text-base whitespace-nowrap">{rangeLabel}</span>
          </button>
          {isDateOpen && (
            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setDateRange(range)}
              onClose={() => setDateOpen(false)}
              isDesktop={isDesktop}
            />
          )}
        </div>
      </div>

      {/* Direita: membros e CTA */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end w-full lg:w-auto lg:flex-nowrap lg:gap-4 lg:ml-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {familyMembers.map((member, index) => {
              const selected = filters.selectedMember === member.id
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleMemberToggle(member.id)}
                  className={`
                    relative w-11 h-11 rounded-full border-2 border-bg-primary
                    bg-bg-secondary text-text-primary font-semibold
                    flex items-center justify-center overflow-hidden
                    transition-avatar
                    ${selected ? 'ring-2 ring-text-primary scale-105 z-20' : 'hover:scale-105'}
                    ${index > 0 ? '-ml-3' : ''}
                  `}
                  title={member.name}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.textContent = member.name.charAt(0)
                        }
                      }}
                    />
                  ) : (
                    member.name.charAt(0)
                  )}
                  {selected && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-bg-primary border border-bg-primary flex items-center justify-center">
                      <Icon name="check" className="w-4 h-4 text-sidebar-active" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="
              w-11 h-11 rounded-full border border-border
              bg-bg-primary text-text-primary
              flex items-center justify-center
              shadow-sm hover:bg-bg-secondary
              transition-button
            "
            aria-label="Adicionar membro"
            onClick={onAddMember}
          >
            <Icon name="add" className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          className="
            flex items-center justify-center gap-2
            bg-text-primary text-bg-primary
            px-5 py-3 rounded-full
            font-semibold
            shadow-sm hover:opacity-90
            w-full sm:w-auto
            min-h-[48px]
            transition-button
          "
          onClick={onNewTransaction}
        >
          <Icon name="add" className="w-5 h-5" />
          <span>Nova transação</span>
        </button>
      </div>

      {/* Modal mobile de filtros */}
      {isFilterModalOpen && (
        <FilterModal
          value={filters.transactionType}
          onSelect={(type) => {
            setTransactionType(type)
            setFilterModalOpen(false)
          }}
          onClose={() => setFilterModalOpen(false)}
          title="Filtros"
        />
      )}
    </div>
  )
}
