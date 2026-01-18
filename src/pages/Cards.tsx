import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { Icon } from '../components/ui/Icon'
import { AddAccountCardModal } from '../components/modals/AddAccountCardModal'
import { CardDetailsModal } from '../components/modals/CardDetailsModal'
import { NewTransactionModal } from '../components/modals/NewTransactionModal'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function Cards() {
  const { creditCards } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [detailCardId, setDetailCardId] = useState<string | null>(null)
  const [showNewTx, setShowNewTx] = useState(false)
  const [presetCard, setPresetCard] = useState<string | undefined>(undefined)

  const sortedCards = useMemo(
    () => [...creditCards].sort((a, b) => b.currentBill - a.currentBill || a.name.localeCompare(b.name)),
    [creditCards],
  )

  const emptyState = sortedCards.length === 0

  return (
    <div className="min-h-screen w-full bg-bg-primary px-page py-6 flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-heading-xl font-bold text-text-primary">Cartões de Crédito</h1>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="h-11 px-4 rounded-full bg-black text-white font-semibold flex items-center gap-2"
        >
          <Icon name="add" className="w-5 h-5" />
          Novo Cartão
        </button>
      </header>

      {emptyState ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center flex flex-col items-center gap-3">
          <Icon name="credit-card" className="w-10 h-10 text-text-secondary" />
          <p className="text-heading-md font-semibold text-text-primary">Nenhum cartão cadastrado</p>
          <p className="text-text-secondary text-body">Cadastre seu primeiro cartão para começar.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="h-11 px-4 rounded-full bg-black text-white font-semibold"
          >
            Cadastrar Primeiro Cartão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCards.map((card) => {
            const available = card.limit - card.currentBill
            const usage = (card.currentBill / card.limit) * 100
            const themeClasses =
              card.theme === 'black'
                ? 'border-black'
                : card.theme === 'lime'
                  ? 'border-[#C4E703]'
                  : 'border-border'

            return (
              <div
                key={card.id}
                className={`rounded-2xl border-2 ${themeClasses} bg-white p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col gap-4`}
                onClick={() => setDetailCardId(card.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-heading-md font-semibold text-text-primary">{card.name}</h3>
                    {card.bank ? <p className="text-sm text-text-secondary">{card.bank}</p> : null}
                  </div>
                  {card.lastDigits ? (
                    <span className="text-sm font-mono text-text-secondary">•••• {card.lastDigits}</span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Limite total</span>
                    <span>{formatCurrency(card.limit)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Fatura atual</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(card.currentBill)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Disponível</span>
                    <span className="text-text-primary font-semibold">{formatCurrency(available)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Uso</span>
                    <span className="text-text-primary font-semibold">{usage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${Math.min(100, usage)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Icon name="calendar" className="w-4 h-4" />
                    <span>Fechamento: dia {card.closingDay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="calendar" className="w-4 h-4" />
                    <span>Vencimento: dia {card.dueDay}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDetailCardId(card.id)
                    }}
                    className="h-10 px-4 rounded-full border border-border text-text-primary text-sm hover:bg-gray-100"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPresetCard(card.id)
                      setShowNewTx(true)
                    }}
                    className="h-10 px-4 rounded-full bg-black text-white text-sm font-semibold hover:opacity-90"
                  >
                    Adicionar Despesa
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddAccountCardModal open={showAdd} onClose={() => setShowAdd(false)} />
      <CardDetailsModal
        open={!!detailCardId}
        cardId={detailCardId}
        onClose={() => setDetailCardId(null)}
        onAddExpense={(id) => {
          setPresetCard(id)
          setShowNewTx(true)
        }}
      />
      <NewTransactionModal
        open={showNewTx}
        onClose={() => {
          setShowNewTx(false)
          setPresetCard(undefined)
        }}
        presetAccountId={presetCard}
        presetType="expense"
      />
    </div>
  )
}
