import { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import type { DateRange, TransactionType } from '../../types'
import { ModalWrapper } from '../ui/ModalWrapper'

type Props = {
  open: boolean
  onClose: () => void
}

export function FiltersMobileModal({ open, onClose }: Props) {
  const { filters, setDateRange, setSelectedMember, setTransactionType, familyMembers } = useFinance()
  const [localType, setLocalType] = useState<'all' | TransactionType>('all')
  const [localMember, setLocalMember] = useState<string | null>(null)
  const [localRange, setLocalRange] = useState<DateRange | null>(null)

  useEffect(() => {
    if (open) {
      setLocalType(filters.transactionType)
      setLocalMember(filters.selectedMember)
      setLocalRange(filters.dateRange)
    }
  }, [open, filters])

  const members = useMemo(() => familyMembers, [familyMembers])

  const applyFilters = () => {
    setTransactionType(localType)
    setSelectedMember(localMember)
    setDateRange(localRange)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      className="w-full h-full flex items-end"
    >
      <div className="w-full h-full bg-white rounded-t-3xl shadow-2xl animate-slide-up flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-white">
          <h3 className="text-heading-lg font-semibold text-text-primary">Filtros</h3>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full border border-border flex items-center justify-center"
            aria-label="Fechar"
          >
            <Icon name="close" className="w-5 h-5 text-text-primary" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
          {/* Tipo */}
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-text-primary">Tipo de Transação</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'income', label: 'Receitas' },
                { value: 'expense', label: 'Despesas' },
              ].map((opt) => {
                const selected = localType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLocalType(opt.value as any)}
                    className={`h-12 rounded-full border text-sm font-semibold ${
                      selected ? 'bg-black text-white border-black' : 'bg-white border-border text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Membros */}
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-text-primary">Membro da Família</span>
            <div className="flex flex-wrap gap-2">
              {[{ id: null, name: 'Todos' }, ...members].map((member) => {
                const selected = localMember === member.id
                return (
                  <button
                    key={member.id ?? 'all'}
                    type="button"
                    onClick={() => setLocalMember(member.id)}
                    className={`h-12 px-4 rounded-full border flex items-center gap-2 ${
                      selected ? 'bg-black text-white border-black' : 'bg-white border-border text-text-secondary'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-border flex items-center justify-center text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm">{member.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Período (simplificado) */}
          <div className="flex flex-col gap-3">
            <span className="font-semibold text-text-primary">Período</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={localRange?.startDate ? toInputDate(localRange.startDate) : ''}
                onChange={(e) =>
                  setLocalRange((prev) => ({
                    startDate: e.target.value ? new Date(e.target.value) : new Date(),
                    endDate: prev?.endDate ?? null,
                  }))
                }
                className="h-12 rounded-full border border-border px-4 text-body text-text-primary"
              />
              <input
                type="date"
                value={localRange?.endDate ? toInputDate(localRange.endDate) : ''}
                onChange={(e) =>
                  setLocalRange((prev) => ({
                    startDate: prev?.startDate ?? new Date(),
                    endDate: e.target.value ? new Date(e.target.value) : null,
                  }))
                }
                className="h-12 rounded-full border border-border px-4 text-body text-text-primary"
              />
            </div>
            <span className="text-xs text-text-secondary">
              Selecione início e fim (opcional). Deixe fim vazio para um único dia.
            </span>
          </div>
        </div>

        <footer className="sticky bottom-0 bg-white border-t border-border px-5 py-4">
          <button
            onClick={applyFilters}
            className="w-full h-14 rounded-full bg-black text-white font-semibold"
          >
            Aplicar Filtros
          </button>
        </footer>
      </div>
    </ModalWrapper>
  )
}

function toInputDate(date: Date) {
  return date.toISOString().split('T')[0]
}
