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
  end: Date
  monthKey: string
}

const getCycleRange = (closingDay: number, reference: Date) => {
  const today = new Date(reference)
  const day = today.getDate()
  const close = Math.min(Math.max(closingDay || 1, 1), 28)

  let start: Date
  let end: Date

  if (day > close) {
    // Ciclo atual termina no próximo mês (ex: 11/jan a 10/fev)
    start = new Date(today.getFullYear(), today.getMonth(), close + 1)
    end = new Date(today.getFullYear(), today.getMonth() + 1, close)
  } else {
    // Ciclo atual termina neste mês (ex: 11/dez a 10/jan)
    start = new Date(today.getFullYear(), today.getMonth() - 1, close + 1)
    end = new Date(today.getFullYear(), today.getMonth(), close)
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function UpcomingExpensesWidget({ onAddExpense }: Props) {
  const { creditCards, transactions } = useFinance()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | undefined>(undefined)

  // Calcula faturas (ciclo atual) por cartão
  const bills = useMemo<BillItem[]>(() => {
    return creditCards.map((card) => {
      const { start, end } = getCycleRange(card.closingDay ?? 1, new Date())
      const amount = transactions
        .filter(
          (tx) =>
            tx.accountId === card.id &&
            tx.type === 'expense' &&
            tx.status === 'pending' &&
            tx.date.getTime() >= start.getTime() &&
            tx.date.getTime() <= end.getTime(),
        )
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)

      const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`

      return {
        cardId: card.id,
        cardName: card.name,
        lastDigits: card.lastDigits,
        amount,
        end,
        monthKey,
      }
    })
  }, [creditCards, transactions])

  // Ordena por valor desc e limita a 5
  const visibleBills = bills
    .filter((b) => b.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

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

      {visibleBills.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-8 px-4 flex flex-col items-center justify-center gap-2 text-center bg-white">
          <Icon name="check" className="text-green-600 w-8 h-8" />
          <p className="text-text-secondary text-sm font-medium">Nenhuma fatura pendente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleBills.map((bill, idx) => (
            <button
              key={`${bill.cardId}-${bill.monthKey}`}
              type="button"
              onClick={() => handleOpenBill(bill)}
              className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg border border-border bg-white transition-all duration-200 ease-out hover:bg-gray-50 animate-slide-up text-left"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-text-primary truncate">{bill.cardName}</span>
                  <span className="text-xs text-text-secondary whitespace-nowrap">•••• {bill.lastDigits || '****'}</span>
                </div>
                <div className="text-xs text-text-secondary">
                  Fecha {bill.end.toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="text-sm font-semibold text-text-primary whitespace-nowrap">
                {formatCurrency(bill.amount)}
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
