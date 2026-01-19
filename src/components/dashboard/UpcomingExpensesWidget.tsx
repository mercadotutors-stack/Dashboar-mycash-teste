import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'

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

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const formatDate = (value: Date) => {
  const day = value.getDate().toString().padStart(2, '0')
  const month = (value.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}`
}

const sortExpenses = (list: PendingExpense[]) =>
  [...list].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

type Props = {
  onAddExpense: () => void
}

export function UpcomingExpensesWidget({ onAddExpense }: Props) {
  const { bankAccounts, creditCards, transactions, updateTransaction } = useFinance()
  
  // Calcula a data de vencimento baseada na conta/cartão
  const calculateDueDate = (tx: { date: Date; accountId: string }): Date => {
    const card = creditCards.find((c) => c.id === tx.accountId)
    if (card) {
      // Se for cartão de crédito, calcula a data de vencimento baseada no dueDay
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      let dueDay = card.dueDay
      
      // Calcula o vencimento do próximo mês se o dia já passou
      const dueDate = new Date(currentYear, currentMonth, dueDay)
      if (dueDate < now) {
        dueDate.setMonth(dueDate.getMonth() + 1)
      }
      
      return dueDate
    }
    
    // Se for conta bancária, usa a data da transação
    return tx.date
  }

  // Filtra e mapeia transações para despesas pendentes
  const expenses = useMemo<PendingExpense[]>(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return sortExpenses(
      transactions
        .filter((tx) => {
          // Apenas despesas não pagas
          return tx.type === 'expense' && !tx.isPaid && tx.status !== 'cancelled'
        })
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
            installments: tx.installments,
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
  const isCompact = expenses.length > 4

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
    <section className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="credit-card" className="w-5 h-5 text-text-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Próximas despesas</h2>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="w-10 h-10 rounded-full border border-border text-text-primary flex items-center justify-center transition-colors duration-200 hover:bg-gray-50"
          aria-label="Adicionar nova despesa"
        >
          <Icon name="add" className="w-6 h-6" />
        </button>
      </header>

      {expenses.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg py-10 px-6 flex flex-col items-center justify-center gap-2 text-center bg-white">
          <Icon name="check" className="text-green-600 w-10 h-10" />
          <p className="text-text-secondary text-body font-medium">Nenhuma despesa pendente</p>
        </div>
      ) : (
        <div
          className={`divide-y divide-border ${
            isCompact ? 'max-h-[420px] overflow-y-auto no-scrollbar pr-2 snap-y snap-mandatory' : ''
          }`}
        >
          {expenses.map((expense) => {
            const isRemoving = removingId === expense.id
            const isActive = activeId === expense.id
            const originLabel = resolvePaymentSource(expense)

            return (
              <div
                key={expense.id}
                className={`flex items-start justify-between gap-4 ${isCompact ? 'py-4' : 'py-6'} transition-all duration-200 ease-out ${
                  isRemoving ? 'opacity-0 -translate-y-1' : ''
                } ${isCompact ? 'snap-start' : ''}`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-heading-md font-semibold text-text-primary">
                    {expense.description}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    Vence dia {formatDate(expense.dueDate)}
                  </span>
                  <span className="text-sm text-text-secondary">{originLabel}</span>
                  {expense.installments && expense.currentInstallment ? (
                    <span className="text-small text-text-secondary">
                      Parcela {expense.currentInstallment}/{expense.installments}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-heading-md font-semibold text-text-primary">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMarkAsPaid(expense.id)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-text-primary transition-colors duration-200 ${
                      isActive
                        ? 'bg-green-50 border-green-500 text-green-600'
                        : 'border-border hover:bg-green-50 hover:border-green-500 hover:text-green-600'
                    }`}
                    aria-label={`Marcar ${expense.description} como paga`}
                  >
                    <Icon name="check" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
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
