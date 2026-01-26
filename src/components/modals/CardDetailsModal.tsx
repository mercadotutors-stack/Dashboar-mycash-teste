import { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { ModalWrapper } from '../ui/ModalWrapper'
import { EditTransactionModal } from '../modals/EditTransactionModal'
import { Toast } from '../ui/Toast'
import { formatCurrency, formatDate as formatDateUtil } from '../../utils'

type Props = {
  cardId: string | null
  open: boolean
  onClose: () => void
  onAddExpense?: (cardId: string) => void
  onEdit?: (cardId: string) => void
  initialMonthKey?: string
}

type MonthTab = {
  label: string
  monthKey: string
  start: Date
  end: Date
  total: number
}

// Helper para obter range do ciclo
const getCycleRangeHelper = (closingDay: number, reference: Date) => {
  const today = new Date(reference)
  const day = today.getDate()
  const close = Math.min(Math.max(closingDay || 1, 1), 28)

  let start: Date
  let end: Date

  if (day > close) {
    start = new Date(today.getFullYear(), today.getMonth(), close + 1)
    end = new Date(today.getFullYear(), today.getMonth() + 1, close)
  } else {
    start = new Date(today.getFullYear(), today.getMonth() - 1, close + 1)
    end = new Date(today.getFullYear(), today.getMonth(), close)
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function CardDetailsModal({ cardId, open, onClose, onAddExpense, onEdit, initialMonthKey }: Props) {
  const { creditCards, transactions, deleteTransaction } = useFinance()
  const [editTxId, setEditTxId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('current')

  const card = useMemo(() => creditCards.find((c) => c.id === cardId) ?? null, [cardId, creditCards])

  // Se recebeu um mês específico, seleciona-o na abertura
  useEffect(() => {
    if (!initialMonthKey) return
    setSelectedMonth(initialMonthKey)
  }, [initialMonthKey])

  // Gera tabs mensais baseado nos ciclos de fechamento
  const monthTabs = useMemo<MonthTab[]>(() => {
    if (!card) return []
    
    const tabs: MonthTab[] = []
    const now = new Date()
    const closingDay = card.closingDay ?? 1

    // Gera 6 meses (3 passados, atual, 2 futuros)
    for (let i = -3; i <= 2; i++) {
      const refDate = new Date(now.getFullYear(), now.getMonth() + i, 15)
      const { start, end } = getCycleRangeHelper(closingDay, refDate)
      
      const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      
      tabs.push({
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        monthKey: i === 0 ? 'current' : monthKey,
        start,
        end,
        total: 0, // será calculado abaixo
      })
    }

    return tabs
  }, [card])

  // Calcula total de cada mês e filtra transações
  const expensesByMonth = useMemo(() => {
    if (!card) return new Map<string, typeof transactions>()

    const map = new Map<string, typeof transactions>()
    
    monthTabs.forEach((tab) => {
      const monthExpenses = transactions.filter((tx) => {
        if (tx.type !== 'expense' || tx.accountId !== card.id) return false
        const txDate = tx.date.getTime()
        return txDate >= tab.start.getTime() && txDate <= tab.end.getTime()
      })
      
      // Calcula total (apenas pendentes para fatura)
      const total = monthExpenses
        .filter((tx) => tx.status === 'pending')
        .reduce((sum, tx) => sum + (tx.amount || 0), 0)
      
      tab.total = total
      map.set(tab.monthKey, monthExpenses.sort((a, b) => b.date.getTime() - a.date.getTime()))
    })

    return map
  }, [card, transactions, monthTabs])

  // Fatura atual (ciclo corrente) e limite comprometido
  const { start: currentStart, end: currentEnd } = card
    ? getCycleRangeHelper(card.closingDay ?? 1, new Date())
    : { start: new Date(), end: new Date() }

  const pendingExpensesAll = useMemo(() => {
    if (!card) return 0
    return transactions
      .filter((tx) => tx.accountId === card.id && tx.type === 'expense' && tx.status === 'pending')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
  }, [card, transactions])

  const currentBillAmount = useMemo(() => {
    if (!card) return 0
    return transactions
      .filter(
        (tx) =>
          tx.accountId === card.id &&
          tx.type === 'expense' &&
          tx.status === 'pending' &&
          tx.date.getTime() >= currentStart.getTime() &&
          tx.date.getTime() <= currentEnd.getTime(),
      )
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
  }, [card, transactions, currentStart, currentEnd])

  const usage = useMemo(() => {
    if (!card || !card.limit) return 0
    return Math.max(0, Math.min(100, (pendingExpensesAll / card.limit) * 100))
  }, [card, pendingExpensesAll])

  // Transações do mês selecionado
  const currentExpenses = useMemo(() => {
    return expensesByMonth.get(selectedMonth) || []
  }, [expensesByMonth, selectedMonth])

  const currentTab = useMemo(() => {
    return monthTabs.find((t) => t.monthKey === selectedMonth) || monthTabs[0]
  }, [monthTabs, selectedMonth])

  // uso já calculado acima (pendingExpensesAll/limit)

  if (!open || !card) return null

  return (
    <ModalWrapper
      open={open && !!card}
      onClose={onClose}
      className="w-full h-full bg-white flex flex-col"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
            <Icon name="credit-card" className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-xl font-bold text-text-primary">{card.name ?? 'Cartão'}</h2>
            <p className="text-text-secondary text-sm">
              Extrato detalhado e controle de faturas mensais
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-gray-100 transition-button"
          aria-label="Fechar modal"
        >
          <Icon name="close" className="w-6 h-6 text-text-primary" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-bg-secondary/60">
        <div className="mx-auto w-full max-w-6xl py-6 flex flex-col gap-6">
          {/* Resumo do Cartão */}
                 <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                     <InfoCard label="Limite total" value={formatCurrency(card.limit)} />
                     <InfoCard label="Fatura atual" value={formatCurrency(currentBillAmount)} />
                     <InfoCard label="Limite disponível" value={formatCurrency(card.limit - pendingExpensesAll)} />
                     <InfoCard label="Uso do limite" value={`${usage.toFixed(1)}%`} />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-text-primary">Uso do limite</span>
                <span className="text-text-secondary">{usage.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${Math.min(100, usage)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-text-secondary">Fechamento: </span>
                <span className="font-semibold text-text-primary">Dia {card.closingDay}</span>
              </div>
              <div>
                <span className="text-text-secondary">Vencimento: </span>
                <span className="font-semibold text-text-primary">Dia {card.dueDay}</span>
              </div>
              {card.lastDigits ? (
                <div>
                  <span className="text-text-secondary">Cartão: </span>
                  <span className="font-semibold text-text-primary">•••• {card.lastDigits}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Tabs Mensais */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="border-b border-border bg-gray-50">
              <div className="flex overflow-x-auto scrollbar-hide">
                {monthTabs.map((tab) => (
                  <button
                    key={tab.monthKey}
                    onClick={() => setSelectedMonth(tab.monthKey)}
                    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      selectedMonth === tab.monthKey
                        ? 'border-black text-text-primary bg-white'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span>{tab.label}</span>
                      <span className={`text-xs ${selectedMonth === tab.monthKey ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {formatCurrency(tab.total)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Extrato Detalhado */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-heading-md font-semibold text-text-primary">
                  Extrato - {currentTab.label}
                </h3>
                <span className="text-sm text-text-secondary">
                  Total: <span className="font-semibold text-text-primary">{formatCurrency(currentTab.total)}</span>
                </span>
              </div>

              {currentExpenses.length === 0 ? (
                <div className="py-12 text-center text-text-secondary">
                  <Icon name="receipt" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma transação neste período</p>
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-[100px,1.5fr,1fr,100px,120px,100px] bg-gray-50 text-text-primary font-semibold text-sm">
                    <div className="px-4 py-3">Data</div>
                    <div className="px-4 py-3">Descrição</div>
                    <div className="px-4 py-3">Categoria</div>
                    <div className="px-4 py-3">Parcela</div>
                    <div className="px-4 py-3 text-right">Valor</div>
                    <div className="px-4 py-3 text-center">Ações</div>
                  </div>
                  <div className="divide-y divide-border">
                    {currentExpenses.map((tx, idx) => (
                      <div
                        key={tx.id}
                        className={`grid grid-cols-[100px,1.5fr,1fr,100px,120px,100px] items-center px-4 py-3 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <div className="text-sm text-text-secondary">
                          {formatDateUtil(tx.date)}
                        </div>
                        <div className="text-text-primary font-medium">{tx.description}</div>
                        <div className="text-sm text-text-secondary">{tx.category || 'Sem categoria'}</div>
                        <div className="text-sm text-text-secondary">
                          {tx.totalInstallments && tx.totalInstallments > 1
                            ? `${tx.currentInstallment ?? 1}/${tx.totalInstallments}`
                            : 'À vista'}
                        </div>
                        <div className="text-right font-semibold text-text-primary">
                          {formatCurrency(tx.amount)}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditTxId(tx.id)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-button"
                            aria-label="Editar transação"
                            title="Editar"
                          >
                            <Icon name="edit" className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Tem certeza que deseja excluir esta transação?')) {
                                try {
                                  await deleteTransaction(tx.id)
                                  setToast('Transação excluída com sucesso!')
                                  setTimeout(() => setToast(null), 2000)
                                } catch (err) {
                                  console.error('Erro ao excluir transação:', err)
                                  setToast('Erro ao excluir transação. Verifique o console.')
                                  setTimeout(() => setToast(null), 3000)
                                }
                              }
                            }}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-500 transition-button"
                            aria-label="Excluir transação"
                            title="Excluir"
                          >
                            <Icon name="delete" className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-border bg-white px-6 py-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => card.id && onAddExpense?.(card.id)}
          className="h-11 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100 transition-button"
        >
          Adicionar Despesa
        </button>
        <button
          type="button"
          onClick={() => card.id && onEdit?.(card.id)}
          className="h-11 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100 transition-button"
        >
          Editar Cartão
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 px-5 rounded-full bg-black text-white font-semibold hover:opacity-90 transition-button"
        >
          Fechar
        </button>
      </footer>

      <EditTransactionModal open={!!editTxId} onClose={() => setEditTxId(null)} transactionId={editTxId ?? undefined} />
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ModalWrapper>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-4 py-3 flex flex-col gap-1">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-body font-semibold text-text-primary">{value}</span>
    </div>
  )
}
