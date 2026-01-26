import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { formatCurrency, formatDate } from '../../utils'

type PendingExpense = {
  id: string
  description: string
  amount: number
  dueDate: Date
  accountId: string
  accountType: 'bank' | 'creditCard'
  isRecurring?: boolean
  installments?: number
  currentInstallment?: number
}

const sortExpenses = (list: PendingExpense[]) =>
  [...list].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

type Props = {
  onAddExpense: () => void
}

export function UpcomingExpensesWidget({ onAddExpense }: Props) {
  const { bankAccounts, creditCards, transactions, updateTransaction } = useFinance()
  
  // Usa a data real da transação/parcela como data de vencimento
  const calculateDueDate = (tx: { date: Date; accountId: string }): Date => {
    // Retorna a data real da transação (que já está calculada corretamente para cada parcela)
    return tx.date
  }

  // Filtra e mapeia transações para despesas pendentes
  // Mostra apenas a próxima parcela de cada compra parcelada (da fatura atual)
  const expenses = useMemo<PendingExpense[]>(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Agrupa por compra (mesma descrição + mesmo accountId + parcelas)
    const groupedByPurchase = new Map<string, typeof transactions>()
    
    transactions
      .filter((tx) => tx.type === 'expense' && !tx.isPaid && tx.status !== 'cancelled')
      .forEach((tx) => {
        if (tx.totalInstallments && tx.totalInstallments > 1) {
          // Para compras parceladas, agrupa por descrição + accountId
          const key = `${tx.description}|${tx.accountId}|${tx.totalInstallments}`
          if (!groupedByPurchase.has(key)) {
            groupedByPurchase.set(key, [])
          }
          groupedByPurchase.get(key)!.push(tx)
        } else {
          // Para compras à vista, adiciona diretamente
          const key = `${tx.id}`
          groupedByPurchase.set(key, [tx])
        }
      })

    // Para cada compra parcelada, pega apenas a próxima parcela (menor data)
    const nextInstallments: typeof transactions = []
    groupedByPurchase.forEach((txs) => {
      if (txs.length === 1) {
        nextInstallments.push(txs[0])
      } else {
        // Para parceladas, pega a parcela com menor data (próxima a vencer)
        const sorted = txs.sort((a, b) => a.date.getTime() - b.date.getTime())
        nextInstallments.push(sorted[0])
      }
    })

    return sortExpenses(
      nextInstallments
        .map((tx) => {
          const card = creditCards.find((c) => c.id === tx.accountId)
          
          return {
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            dueDate: calculateDueDate(tx),
            accountId: tx.accountId,
            accountType: (card ? 'creditCard' : 'bank') as 'creditCard' | 'bank',
            isRecurring: tx.isRecurring,
            installments: tx.totalInstallments,
            currentInstallment: tx.currentInstallment,
          }
        })
        .filter((exp) => {
          // Filtra apenas despesas com vencimento nos próximos 60 dias
          const daysUntilDue = Math.ceil((exp.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          return daysUntilDue >= 0 && daysUntilDue <= 60
        })
    )
  }, [transactions, creditCards, bankAccounts])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const MAX_VISIBLE = 5
  const visibleExpenses = showAll ? expenses : expenses.slice(0, MAX_VISIBLE)
  const hasMore = expenses.length > MAX_VISIBLE

  const resolvePaymentSource = (expense: PendingExpense) => {
    const card = creditCards.find((c) => c.id === expense.accountId)
    const account = bankAccounts.find((acc) => acc.id === expense.accountId)

    if (card || expense.accountType === 'creditCard') {
      const bank = card?.bank ?? 'Cartão'
      const digits = card?.lastDigits ?? '****'
      return `Crédito ${bank} **** ${digits}`
    }

    if (account || expense.accountType === 'bank') {
      const bank = account?.bank ?? account?.name ?? 'Conta'
      return `${bank} conta`
    }

    return 'Conta'
  }

  const handleAddNew = () => {
    onAddExpense()
  }

  const handleMarkAsPaid = async (id: string) => {
    const expense = expenses.find((item) => item.id === id)
    if (!expense) return

    const tx = transactions.find((t) => t.id === id)
    if (!tx) return

    setActiveId(id)
    setRemovingId(id)

    try {
      // Marca a transação como paga
      await updateTransaction(id, { isPaid: true, status: 'completed' })

      // Se for recorrente, cria uma nova transação para o próximo mês
      if (tx.isRecurring) {
        // TODO: Criar nova transação recorrente para o próximo mês
        // Por enquanto, apenas marcamos como paga
      }

      // Se tiver parcelas pendentes, atualiza a parcela atual
      if (tx.installments && tx.currentInstallment && tx.currentInstallment < tx.installments) {
        await updateTransaction(id, {
          currentInstallment: tx.currentInstallment + 1,
          isPaid: false,
          status: 'pending',
        })
        // TODO: Criar próxima parcela como nova transação
      }

      setFeedback('Despesa marcada como paga!')
      setTimeout(() => setFeedback(null), 2400)
    } catch (err) {
      console.error('Erro ao marcar despesa como paga:', err)
      setFeedback('Erro ao atualizar despesa')
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setTimeout(() => {
        setActiveId(null)
        setRemovingId(null)
      }, 240)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-4 animate-slide-up">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="credit-card" className="w-4 h-4 text-text-primary" />
          <h2 className="text-sm font-semibold text-text-primary">Próximas despesas</h2>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="w-8 h-8 rounded-full border border-border text-text-primary flex items-center justify-center transition-colors duration-200 hover:bg-gray-50"
          aria-label="Adicionar nova despesa"
        >
          <Icon name="add" className="w-4 h-4" />
        </button>
      </header>

      {expenses.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-8 px-4 flex flex-col items-center justify-center gap-2 text-center bg-white">
          <Icon name="check" className="text-green-600 w-8 h-8" />
          <p className="text-text-secondary text-sm font-medium">Nenhuma despesa pendente</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleExpenses.map((expense, idx) => {
            const isRemoving = removingId === expense.id
            const isActive = activeId === expense.id
            const originLabel = resolvePaymentSource(expense)

            return (
              <div
                key={expense.id}
                className={`flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg border border-border bg-white transition-all duration-200 ease-out ${
                  isRemoving ? 'opacity-0 -translate-y-1' : 'hover:bg-gray-50'
                } animate-slide-up`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {expense.description}
                    </span>
                    {expense.installments && expense.currentInstallment ? (
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {expense.currentInstallment}/{expense.installments}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>Vence {formatDate(expense.dueDate)}</span>
                    <span>•</span>
                    <span className="truncate">{originLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMarkAsPaid(expense.id)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-text-primary transition-button flex-shrink-0 ${
                      isActive
                        ? 'bg-green-50 border-green-500 text-green-600'
                        : 'border-border hover:bg-green-50 hover:border-green-500 hover:text-green-600'
                    }`}
                    aria-label={`Marcar ${expense.description} como paga`}
                  >
                    <Icon name="check" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
          
          {hasMore && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-2 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors text-center"
            >
              Ver mais ({expenses.length - MAX_VISIBLE} restantes)
            </button>
          )}
        </div>
      )}

      {feedback ? (
        <div
          className="mt-2 rounded-md border border-border bg-gray-50 px-3 py-2 text-sm text-text-primary"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </div>
      ) : null}
    </section>
  )
}
