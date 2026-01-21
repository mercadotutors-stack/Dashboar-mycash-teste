import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import { ROUTES } from '../../constants'
import { Icon } from '../ui/Icon'
import { CardDetailsModal } from '../modals/CardDetailsModal'
import { AddAccountCardModal } from '../modals/AddAccountCardModal'
import { NewTransactionModal } from '../modals/NewTransactionModal'
import { formatCurrency } from '../../utils'

type Theme = 'lime' | 'black' | 'white'

const themeStyles: Record<
  Theme,
  {
    blockClass: string
    iconClass: string
    badgeClass: string
  }
> = {
  lime: {
    blockClass: 'bg-sidebar-active text-text-primary',
    iconClass: 'text-text-primary',
    badgeClass: 'bg-sidebar-active text-text-primary',
  },
  black: {
    blockClass: 'bg-[#0B0B12] text-white',
    iconClass: 'text-white',
    badgeClass: 'bg-[#0B0B12] text-white',
  },
  white: {
    blockClass: 'bg-white border border-border text-text-primary',
    iconClass: 'text-text-primary',
    badgeClass: 'bg-bg-secondary text-text-primary border border-border',
  },
}

export function CreditCardsWidget() {
  const { creditCards, bankAccounts } = useFinance()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [newExpenseCard, setNewExpenseCard] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const touchRef = useRef<{ x: number }>({ x: 0 })

  // Combina cartões e contas bancárias
  const allAccounts = useMemo(() => {
    const cards = creditCards.map((card) => ({ ...card, type: 'card' as const }))
    const accounts = bankAccounts.map((acc) => ({ ...acc, type: 'account' as const }))
    return [...cards, ...accounts]
  }, [creditCards, bankAccounts])

  const pageSize = 3
  const totalPages = Math.max(1, Math.ceil(allAccounts.length / pageSize))
  const clampedPage = Math.min(page, totalPages - 1)

  const currentPageItems = useMemo(() => {
    const start = clampedPage * pageSize
    return allAccounts.slice(start, start + pageSize)
  }, [allAccounts, clampedPage])

  const handleSwipeStart = (x: number) => {
    touchRef.current = { x }
  }

  const handleSwipeEnd = (x: number) => {
    const delta = x - touchRef.current.x
    if (Math.abs(delta) > 50) {
      if (delta < 0 && clampedPage < totalPages - 1) setPage(clampedPage + 1)
      if (delta > 0 && clampedPage > 0) setPage(clampedPage - 1)
    }
  }

  const handleDetail = (id: string, type: 'card' | 'account') => {
    if (type === 'card') {
      setDetailId(id)
    } else {
      // Para contas bancárias, navega para a página de contas
      navigate(ROUTES.ACCOUNTS)
    }
  }

  return (
    <section
      className="
        rounded-2xl border border-border bg-bg-secondary
        p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col gap-4 sm:gap-6
        animate-slide-up
      "
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon name="credit-card" className="w-6 h-6 text-text-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Cartões e Contas</h2>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="
            w-10 h-10 rounded-full border border-border bg-white
            flex items-center justify-center
            transition-colors duration-200
            hover:bg-bg-secondary
          "
          aria-label="Adicionar cartão ou conta"
        >
          <Icon name="add" className="w-5 h-5 text-text-primary" />
        </button>
      </header>

      <div
        className="flex flex-col gap-4"
        onTouchStart={(e) => handleSwipeStart(e.changedTouches[0].clientX)}
        onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
      >
        {currentPageItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white p-6 text-center flex flex-col items-center gap-2">
            <Icon name="credit-card" className="w-8 h-8 text-text-secondary" />
            <p className="text-text-secondary text-body">Nenhum cartão ou conta cadastrado</p>
          </div>
        ) : (
          currentPageItems.map((item, idx) => {
            if (item.type === 'card') {
              const card = item
              const style = themeStyles[(card.theme as Theme) || 'white'] || themeStyles.white
              const usage = Math.round((card.currentBill / card.limit) * 100)
              return (
                <div
                  key={card.id}
                  className="
                    flex items-center gap-4 rounded-xl bg-white shadow-sm border border-border
                    px-5 py-4 transition-card
                    hover:-translate-y-1 hover:shadow-md cursor-pointer
                    animate-slide-up
                  "
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => handleDetail(card.id, 'card')}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${style.blockClass}`}>
                    <Icon name="credit-card" className={`w-6 h-6 ${style.iconClass}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-secondary truncate">{card.name}</div>
                    <div className="text-2xl font-bold text-text-primary leading-snug">{formatCurrency(card.currentBill)}</div>
                    <div className="text-sm text-text-secondary">•••• {card.lastDigits || '****'}</div>
                  </div>

                  <div
                    className={`
                      px-3 py-2 rounded-full text-sm font-semibold text-center min-w-[64px]
                      ${style.badgeClass}
                    `}
                  >
                    {usage}%
                  </div>
                </div>
              )
            } else {
              const account = item
              const accountTypeLabel = account.accountType === 'savings' ? 'Poupança' : account.accountType === 'investment' ? 'Investimento' : 'Corrente'
              return (
                <div
                  key={account.id}
                  className="
                    flex items-center gap-4 rounded-xl bg-white shadow-sm border border-border
                    px-5 py-4 transition-card
                    hover:-translate-y-1 hover:shadow-md cursor-pointer
                    animate-slide-up
                  "
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => handleDetail(account.id, 'account')}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon name="account_balance" className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text-secondary truncate">{account.name}</div>
                    <div className="text-2xl font-bold text-text-primary leading-snug">{formatCurrency(account.balance)}</div>
                    <div className="text-sm text-text-secondary">{account.bank || accountTypeLabel}</div>
                  </div>

                  <div className="px-3 py-2 rounded-full text-sm font-semibold text-center min-w-[64px] bg-green-50 text-green-600">
                    {account.balance >= 0 ? 'Ativa' : 'Negativa'}
                  </div>
                </div>
              )
            }
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition ${i === clampedPage ? 'bg-text-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={clampedPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="
                w-9 h-9 rounded-full border border-border bg-white
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-bg-secondary
                transition-button
              "
              aria-label="Página anterior"
            >
              <Icon name="chevronLeft" className="w-5 h-5 text-text-primary" />
            </button>
            <button
              type="button"
              disabled={clampedPage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="
                w-9 h-9 rounded-full border border-border bg-white
                flex items-center justify-center
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-bg-secondary
                transition-button
              "
              aria-label="Próxima página"
            >
              <Icon name="chevronRight" className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        </div>
      )}

      <AddAccountCardModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CardDetailsModal
        open={!!detailId}
        cardId={detailId}
        onClose={() => setDetailId(null)}
        onAddExpense={(id) => {
          setNewExpenseCard(id)
        }}
      />
      <NewTransactionModal
        open={!!newExpenseCard}
        onClose={() => setNewExpenseCard(null)}
        presetAccountId={newExpenseCard ?? undefined}
        presetType="expense"
      />
    </section>
  )
}
