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

const addMonthsPreserveDay = (date: Date, months: number) => {
  const result = new Date(date.getTime())
  const targetMonth = result.getMonth() + months
  result.setMonth(targetMonth)

  // Se o mês avançar mais do que o esperado (ex: 31 -> 30), ajusta para o último dia válido
  if ((result.getMonth() + 12) % 12 !== (targetMonth + 12) % 12) {
    result.setDate(0)
  }

  return result
}

const sortExpenses = (list: PendingExpense[]) =>
  [...list].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 9)}`

type Props = {
  onAddExpense: () => void
}

export function UpcomingExpensesWidget({ onAddExpense }: Props) {
  const { bankAccounts, creditCards } = useFinance()
  const initialExpenses = useMemo<PendingExpense[]>(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    return sortExpenses([
      {
        id: 'pe-1',
        description: 'Conta de Luz',
        amount: 154,
        dueDate: new Date(currentYear, currentMonth, 21),
        accountId: 'cc1',
        accountType: 'creditCard',
        isRecurring: true,
      },
      {
        id: 'pe-2',
        description: 'Água e esgoto',
        amount: 98.4,
        dueDate: new Date(currentYear, currentMonth, 23),
        accountId: 'ba1',
        accountType: 'bank',
        isRecurring: true,
      },
      {
        id: 'pe-3',
        description: 'Internet fibra',
        amount: 189.9,
        dueDate: new Date(currentYear, currentMonth, 25),
        accountId: 'ba2',
        accountType: 'bank',
        isRecurring: true,
      },
      {
        id: 'pe-4',
        description: 'Cartão Inter',
        amount: 420.5,
        dueDate: new Date(currentYear, currentMonth, 27),
        accountId: 'cc3',
        accountType: 'creditCard',
        installments: 6,
        currentInstallment: 3,
      },
      {
        id: 'pe-5',
        description: 'Seguro residencial',
        amount: 254.75,
        dueDate: new Date(currentYear, currentMonth, 29),
        accountId: 'cc2',
        accountType: 'creditCard',
        isRecurring: false,
        installments: 3,
        currentInstallment: 2,
      },
    ])
  }, [])

  const [expenses, setExpenses] = useState<PendingExpense[]>(initialExpenses)
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

  const handleMarkAsPaid = (id: string) => {
    const expense = expenses.find((item) => item.id === id)
    if (!expense) return

    setActiveId(id)
    setRemovingId(id)

    window.setTimeout(() => {
      setExpenses((prev) => {
        const current = prev.find((item) => item.id === id)
        if (!current) return prev

        const remaining = prev.filter((item) => item.id !== id)
        const nextItems: PendingExpense[] = []

        if (current.isRecurring) {
          nextItems.push({
            ...current,
            id: generateId(),
            dueDate: addMonthsPreserveDay(current.dueDate, 1),
          })
        }

        if (
          current.installments &&
          current.currentInstallment &&
          current.currentInstallment < current.installments
        ) {
          nextItems.push({
            ...current,
            id: generateId(),
            currentInstallment: current.currentInstallment + 1,
            dueDate: addMonthsPreserveDay(current.dueDate, 1),
            isRecurring: false,
          })
        }

        return sortExpenses([...remaining, ...nextItems])
      })

      setFeedback('Despesa marcada como paga!')
      setTimeout(() => setFeedback(null), 2400)
      setTimeout(() => {
        setActiveId(null)
        setRemovingId(null)
      }, 240)
    }, 200)
  }

  return (
    <section className="rounded-xl border border-border bg-white p-8 shadow-sm flex flex-col gap-4">
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
