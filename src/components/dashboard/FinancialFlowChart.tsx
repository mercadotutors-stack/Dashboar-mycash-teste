import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Icon } from '../ui/Icon'
import { useFinance } from '../../context/FinanceContext'
import { useMemo } from 'react'
import { formatCurrency, formatCompactCurrency } from '../../utils'

// Nomes dos meses em português
const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function FinancialFlowChart() {
  const { transactions } = useFinance()

  // Agrupa transações por mês (últimos 7 meses)
  const chartData = useMemo(() => {
    const now = new Date()
    const months: Array<{ month: string; monthIndex: number; year: number; income: number; expense: number }> = []
    
    // Cria array dos últimos 7 meses
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: monthNames[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        income: 0,
        expense: 0,
      })
    }

    // Agrupa transações por mês
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date)
      const monthIndex = txDate.getMonth()
      const year = txDate.getFullYear()
      
      const monthData = months.find((m) => m.monthIndex === monthIndex && m.year === year)
      if (monthData) {
        if (tx.type === 'income') {
          monthData.income += tx.amount
        } else {
          monthData.expense += tx.amount
        }
      }
    })

    return months.map((m) => ({
      month: m.month,
      income: m.income,
      expense: m.expense,
    }))
  }, [transactions])

  return (
    <div className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Icon name="chart" className="w-6 h-6 text-text-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Fluxo financeiro</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-primary">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#C4E703' }} />
            Receitas
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#0B0B12' }} />
            Despesas
          </span>
        </div>
      </div>

      <div className="w-full rounded-lg bg-bg-secondary/60 px-2 pb-2" style={{ height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C4E703" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#C4E703" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B0B12" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#0B0B12" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="var(--gray-200)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--gray-600)', fontSize: 12, fontWeight: 600 }}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--gray-600)', fontSize: 12, fontWeight: 600 }}
              width={64}
            />
            <Tooltip
              cursor={{ stroke: 'var(--gray-300)', strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const income = payload.find((p) => p.dataKey === 'income')?.value as number
                const expense = payload.find((p) => p.dataKey === 'expense')?.value as number
                return (
                  <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-lg text-sm">
                    <div className="font-semibold text-text-primary mb-1">{label}</div>
                    <div className="text-[#15803D]">Receitas: {formatCurrency(income)}</div>
                    <div className="text-[#0B0B12]">Despesas: {formatCurrency(expense)}</div>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#C4E703"
              strokeWidth={3}
              fill="url(#incomeFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#C4E703', fill: '#C4E703' }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#0B0B12"
              strokeWidth={3}
              fill="url(#expenseFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#0B0B12', fill: '#0B0B12' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
