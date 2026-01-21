import { useFinance } from '../../context/FinanceContext'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { CurrencyDollarIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { formatCurrency } from '../../utils'

export function SummaryCards() {
  const { calculateTotalBalance, calculateIncomeForPeriod, calculateExpensesForPeriod } = useFinance()

  const totalBalance = calculateTotalBalance()
  const income = calculateIncomeForPeriod()
  const expenses = calculateExpensesForPeriod()

  const animatedTotal = useAnimatedNumber(totalBalance)
  const animatedIncome = useAnimatedNumber(income)
  const animatedExpenses = useAnimatedNumber(expenses)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <BalanceCard value={animatedTotal} delay={0} />
      <IncomeCard value={animatedIncome} delay={80} />
      <ExpenseCard value={animatedExpenses} delay={160} />
    </div>
  )
}

function BalanceCard({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <div
      className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col gap-3 sm:gap-4 items-start animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CurrencyDollarIcon className="w-10 h-10 text-text-primary" />
      <div className="flex flex-col gap-2">
        <div className="text-[20px] leading-tight text-text-primary font-medium">Saldo total</div>
        <div className="text-[24px] leading-[48px] font-bold" style={{ color: 'var(--color-brand-picpay)' }}>{formatCurrency(value)}</div>
      </div>
    </div>
  )
}

function IncomeCard({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <div
      className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col gap-3 sm:gap-4 items-start animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <ArrowTrendingDownIcon className="w-8 h-8 text-[#00B171]" />
      <div className="flex flex-col gap-2">
        <div className="text-[20px] leading-tight text-text-primary font-semibold">Receitas</div>
        <div className="text-[24px] leading-[48px] font-extrabold text-text-primary">{formatCurrency(value)}</div>
      </div>
    </div>
  )
}

function ExpenseCard({ value, delay = 0 }: { value: number; delay?: number }) {
  return (
    <div
      className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col gap-3 sm:gap-4 items-start animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <ArrowTrendingUpIcon className="w-8 h-8 text-[#F04444]" />
      <div className="flex flex-col gap-2">
        <div className="text-[20px] leading-tight text-text-secondary font-semibold">Despesas</div>
        <div className="text-[24px] leading-[48px] font-extrabold text-text-primary">{formatCurrency(value)}</div>
      </div>
    </div>
  )
}
