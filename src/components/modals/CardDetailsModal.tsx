import { useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'

type Props = {
  cardId: string | null
  open: boolean
  onClose: () => void
  onAddExpense?: (cardId: string) => void
  onEdit?: (cardId: string) => void
  onViewStatement?: (cardId: string) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export function CardDetailsModal({ cardId, open, onClose, onAddExpense, onEdit, onViewStatement }: Props) {
  const { creditCards, transactions } = useFinance()
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const card = useMemo(() => creditCards.find((c) => c.id === cardId) ?? null, [cardId, creditCards])

  const expenses = useMemo(() => {
    if (!card) return []
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.accountId === card.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [card, transactions])

  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE))
  const paginated = expenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const usage = card ? (card.currentBill / card.limit) * 100 : 0

  if (!open || !card) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
            <Icon name="credit-card" className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-xl font-bold text-text-primary">{card.name ?? 'Cartão'}</h2>
            <p className="text-text-secondary text-sm">
              Visualize detalhes completos e despesas do cartão de crédito.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-gray-100"
          aria-label="Fechar modal"
        >
          <Icon name="close" className="w-6 h-6 text-text-primary" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-bg-secondary/60 px-4">
        <div className="mx-auto w-full max-w-5xl py-6 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard label="Limite total" value={formatCurrency(card.limit)} />
              <InfoCard label="Fatura atual" value={formatCurrency(card.currentBill)} />
              <InfoCard label="Limite disponível" value={formatCurrency(card.limit - card.currentBill)} />
              <InfoCard label="Uso do limite" value={`${usage.toFixed(1)}%`} />
              <InfoCard label="Fechamento" value={`Dia ${card.closingDay}`} />
              <InfoCard label="Vencimento" value={`Dia ${card.dueDay}`} />
              {card.lastDigits ? <InfoCard label="Últimos dígitos" value={`•••• ${card.lastDigits}`} /> : null}
            </div>

            {/* Barra de uso */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-text-primary">Uso do limite</span>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${Math.min(100, usage)}%` }}
                />
              </div>
            </div>

            {/* Tabela */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[120px,1.2fr,1fr,120px,140px] bg-gray-50 text-text-primary font-semibold text-body">
                <div className="px-4 py-3">Data</div>
                <div className="px-4 py-3">Descrição</div>
                <div className="px-4 py-3">Categoria</div>
                <div className="px-4 py-3">Parcelas</div>
                <div className="px-4 py-3 text-right">Valor</div>
              </div>
              {paginated.length === 0 ? (
                <div className="py-10 text-center text-text-secondary">Nenhuma despesa registrada neste cartão ainda.</div>
              ) : (
                paginated.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className={`grid grid-cols-[120px,1.2fr,1fr,120px,140px] items-center px-2 py-3 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                    }`}
                  >
                    <div className="px-2 text-text-secondary text-sm">
                      {tx.date.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="px-2 text-text-primary">{tx.description}</div>
                    <div className="px-2 text-text-secondary text-sm">{tx.category}</div>
                    <div className="px-2 text-text-secondary text-sm">
                      {tx.installments && tx.installments > 1 ? `${tx.installments}x` : 'À vista'}
                    </div>
                    <div className="px-2 text-right font-semibold text-text-primary">{formatCurrency(tx.amount)}</div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`h-9 px-3 rounded-full border border-border text-body ${
                    page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  ←
                </button>
                <span className="text-body text-text-secondary">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`h-9 px-3 rounded-full border border-border text-body ${
                    page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:bg-gray-100'
                  }`}
                >
                  →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-border bg-white px-6 py-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => card.id && onViewStatement?.(card.id)}
          className="h-11 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100"
        >
          Ver Extrato Completo
        </button>
        <button
          type="button"
          onClick={() => card.id && onAddExpense?.(card.id)}
          className="h-11 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100"
        >
          Adicionar Despesa
        </button>
        <button
          type="button"
          onClick={() => card.id && onEdit?.(card.id)}
          className="h-11 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100"
        >
          Editar Cartão
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-11 px-5 rounded-full bg-black text-white font-semibold hover:opacity-90"
        >
          Fechar
        </button>
      </footer>
    </div>
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
