import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { formatCurrency, formatCompactCurrency } from '../../utils'

export function InvestmentChart() {
  const { bankAccounts, transactions } = useFinance()

  const data = useMemo(() => {
    const investmentAccounts = bankAccounts.filter((acc) => {
      const name = (acc.name || '').toLowerCase()
      const bank = (acc.bank || '').toLowerCase()
      return acc.accountType === 'investment' || name.includes('invest') || bank.includes('invest')
    })
    if (!investmentAccounts.length) return []

    const accountIds = new Set(investmentAccounts.map((a) => a.id))
    const currentTotal = investmentAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)

    const investmentTx = transactions
      .filter((tx) => accountIds.has(tx.accountId))
      .map((tx) => ({
        date: new Date(tx.date),
        delta: tx.type === 'income' ? tx.amount : -tx.amount,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const netDelta = investmentTx.reduce((sum, t) => sum + t.delta, 0)
    const startValue = currentTotal - netDelta

    const points: Array<{ date: string; value: number }> = []
    let cursor = startValue
    investmentTx.forEach((t) => {
      cursor += t.delta
      points.push({
        date: t.date.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' }),
        value: cursor,
      })
    })

    // Garante ponto atual
    const todayLabel = new Date().toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' })
    points.push({ date: todayLabel, value: currentTotal })

    // Se não houver histórico, mostra apenas o valor atual
    if (!points.length) {
      points.push({ date: todayLabel, value: currentTotal })
    }

    return points
  }, [bankAccounts, transactions])

  return (
    <div className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Icon name="trendingUp" className="w-6 h-6 text-text-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Investimentos</h2>
        </div>
        <div className="text-sm text-text-secondary">
          Atual: {formatCurrency(data.length ? data[data.length - 1].value : 0)}
        </div>
      </div>

      <div className="w-full rounded-lg bg-bg-secondary/60 px-2 pb-2" style={{ height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="var(--gray-200)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
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
                const value = payload[0]?.value as number
                return (
                  <div className="rounded-lg border border-border bg-white px-4 py-3 shadow-lg text-sm">
                    <div className="font-semibold text-text-primary mb-1">{label}</div>
                    <div className="text-text-primary">Saldo: {formatCurrency(value)}</div>
                  </div>
                )
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0B0B12"
              strokeWidth={3}
              dot={{ r: 3, stroke: '#0B0B12', strokeWidth: 1, fill: '#0B0B12' }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#0B0B12', fill: '#0B0B12' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
