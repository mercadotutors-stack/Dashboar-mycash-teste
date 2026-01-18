import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

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
      <BalanceCard value={animatedTotal} />
      <IncomeCard value={animatedIncome} />
      <ExpenseCard value={animatedExpenses} />
    </div>
  )
}

function BalanceCard({ value }: { value: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm h-full flex flex-col gap-4 items-start">
      <Icon name="attach_money" className="text-[40px] text-text-primary" />
      <div className="flex flex-col gap-2">
        <div className="text-[20px] leading-tight text-text-primary font-medium">Saldo total</div>
        <div className="text-[32px] leading-[48px] font-bold text-[#0D8CFF]">{formatCurrency(value)}</div>
      </div>
    </div>
  )
}

function IncomeCard({ value }: { value: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm h-full flex flex-col gap-4 items-start">
      <Icon name="arrowDown" className="text-[32px] text-[#00B171]" />
      <div className="flex flex-col gap-2">
        <div className="text-[20px] leading-tight text-text-primary font-semibold">Receitas</div>
        <div className="text-[32px] leading-[48px] font-extrabold text-text-primary">{formatCurrency(value)}</div>
      </div>
    </div>
  )
}

function ExpenseCard({ value }: { value: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm h-full flex flex-col gap-4 items-start">
      <Icon name="arrowUp" className="text-[32px] text-[#F04444]" />
      <div className="flex flex-col gap-2">
        <div className="text-[20px] leading-tight text-text-secondary font-semibold">Despesas</div>
        <div className="text-[32px] leading-[48px] font-extrabold text-text-primary">{formatCurrency(value)}</div>
      </div>
    </div>
  )
}
