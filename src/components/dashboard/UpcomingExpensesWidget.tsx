import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { formatCurrency } from '../../utils'
import { CardDetailsModal } from '../modals/CardDetailsModal'

type Props = {
  onAddExpense: () => void
}

type BillItem = {
  cardId: string
  cardName: string
  lastDigits?: string
  amount: number
  pendingAmount: number
  start: Date
  end: Date
  monthKey: string
  closingDay: number
  dueDay?: number
  dueDate: Date
  status: 'open' | 'closed' | 'pending' | 'paid'
}

// Próxima fatura: primeiro fechamento após hoje
const getNextInvoiceRange = (closingDay: number, reference = new Date()) => {
  const today = new Date(reference)
  const day = today.getDate()
  const close = Math.min(Math.max(closingDay || 1, 1), 28)

  let end = new Date(today.getFullYear(), today.getMonth(), close)
  if (day > close) {
    end = new Date(today.getFullYear(), today.getMonth() + 1, close)
  }
  const start = new Date(end.getFullYear(), end.getMonth() - 1, close + 1)

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const computeDueDate = (cycleEnd: Date, dueDay?: number, closingDay?: number) => {
  const closeDay = closingDay ?? cycleEnd.getDate()
  const day = dueDay ?? Math.min(28, closeDay + 7)
  let month = cycleEnd.getMonth()
  let year = cycleEnd.getFullYear()
  if (day <= cycleEnd.getDate()) {
    month += 1
    if (month > 11) {
      month = 0
      year += 1
    }
  }
  const due = new Date(year, month, day)
  due.setHours(23, 59, 59, 999)
  return due
}

const getInvoiceStatus = (cycleEnd: Date, dueDate: Date, pendingAmount: number) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (today < cycleEnd) return 'open'
  if (today >= cycleEnd && today <= dueDate) {
    return pendingAmount > 0 ? 'closed' : 'paid'
  }
  return pendingAmount > 0 ? 'pending' : 'paid'
}

export function UpcomingExpensesWidget({ onAddExpense }: Props) {
  const { creditCards, transactions } = useFinance()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | undefined>(undefined)

  // Calcula próxima fatura por cartão (sempre o próximo fechamento, mesmo que valor 0)
  const bills = useMemo<BillItem[]>(() => {
    return creditCards.map((card) => {
      const { start, end } = getNextInvoiceRange(card.closingDay ?? 1, new Date())
      const cycleTxs = transactions
        .filter(
          (tx) =>
            tx.accountId === card.id &&
            tx.type === 'expense' &&
            tx.date.getTime() >= start.getTime() &&
            tx.date.getTime() <= end.getTime(),
        )
      const pendingAmount = cycleTxs
        .filter((tx) => tx.status !== 'cancelled' && tx.status === 'pending')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
      const totalAmount = cycleTxs
        .filter((tx) => tx.status !== 'cancelled')
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

      const dueDate = computeDueDate(end, card.dueDay, card.closingDay)
      const status = getInvoiceStatus(end, dueDate, pendingAmount)

      const monthKey = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`

      return {
        cardId: card.id,
        cardName: card.name,
        lastDigits: card.lastDigits,
        amount: pendingAmount || totalAmount,
        pendingAmount,
        start,
        end,
        monthKey,
        closingDay: card.closingDay ?? 1,
        dueDay: card.dueDay,
        dueDate,
        status,
      }
    })
  }, [creditCards, transactions])

  // Ordena por fechamento mais próximo
  const sortedBills = useMemo(
    () => [...bills].sort((a, b) => a.end.getTime() - b.end.getTime()),
    [bills],
  )

  const handleOpenBill = (bill: BillItem) => {
    setSelectedCardId(bill.cardId)
    setSelectedMonthKey(bill.monthKey)
  }

  const closeModal = () => {
    setSelectedCardId(null)
    setSelectedMonthKey(undefined)
  }

  return (
    <section className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-4 animate-slide-up">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="credit-card" className="w-4 h-4 text-text-primary" />
          <h2 className="text-sm font-semibold text-text-primary">Próximas faturas</h2>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="w-8 h-8 rounded-full border border-border text-text-primary flex items-center justify-center transition-colors duration-200 hover:bg-gray-50"
          aria-label="Adicionar nova despesa"
        >
          <Icon name="add" className="w-4 h-4" />
        </button>
      </header>

      {sortedBills.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-6 px-4 flex flex-col items-center justify-center gap-2 text-center bg-white">
          <Icon name="check" className="text-green-600 w-8 h-8" />
          <p className="text-text-secondary text-sm font-medium">Nenhuma fatura pendente</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {sortedBills.map((bill, idx) => (
            <button
              key={`${bill.cardId}-${bill.monthKey}`}
              type="button"
              onClick={() => handleOpenBill(bill)}
              className="min-w-[260px] flex items-center justify-between gap-2 py-3 px-3 rounded-lg border border-border bg-white transition-all duration-200 ease-out hover:bg-gray-50 animate-slide-up text-left"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-sm font-semibold text-text-primary truncate">{bill.cardName}</span>
                  <span className="text-xs text-text-secondary whitespace-nowrap">•••• {bill.lastDigits || '****'}</span>
                </div>
                <div className="text-[11px] text-text-secondary flex flex-col">
                  <span>Fecha {bill.end.toLocaleDateString('pt-BR')}</span>
                  {bill.dueDay ? <span>Vence dia {String(bill.dueDay).padStart(2, '0')}</span> : null}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-text-secondary">
                  {bill.status === 'open'
                    ? 'Em aberto'
                    : bill.status === 'closed'
                      ? 'Fechada'
                      : bill.status === 'pending'
                        ? 'Pendente'
                        : 'Paga'}
                </span>
                <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                  {formatCurrency(bill.amount)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <CardDetailsModal
        open={!!selectedCardId}
        cardId={selectedCardId}
        initialMonthKey={selectedMonthKey}
        onClose={closeModal}
      />
    </section>
  )
}
