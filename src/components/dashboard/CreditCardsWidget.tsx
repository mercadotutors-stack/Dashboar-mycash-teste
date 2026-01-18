import { useMemo, useState, useRef } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'

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

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-border bg-bg-primary flex items-center justify-center hover:bg-bg-secondary"
            aria-label="Fechar"
          >
            <Icon name="close" className="w-5 h-5 text-text-primary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function CreditCardsWidget() {
  const { creditCards } = useFinance()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const touchRef = useRef<{ x: number }>({ x: 0 })

  const pageSize = 3
  const totalPages = Math.max(1, Math.ceil(creditCards.length / pageSize))
  const clampedPage = Math.min(page, totalPages - 1)

  const currentPageItems = useMemo(() => {
    const start = clampedPage * pageSize
    return creditCards.slice(start, start + pageSize)
  }, [creditCards, clampedPage])

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

  const handleDetail = (id: string) => setDetailId(id)

  return (
    <section
      className="
        rounded-2xl border border-border bg-bg-secondary
        p-8 shadow-sm flex flex-col gap-6
      "
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon name="credit-card" className="w-6 h-6 text-text-primary" />
          <h2 className="text-heading-lg font-semibold text-text-primary">Cartões</h2>
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
          aria-label="Adicionar cartão"
        >
          <Icon name="add" className="w-5 h-5 text-text-primary" />
        </button>
      </header>

      <div
        className="flex flex-col gap-4"
        onTouchStart={(e) => handleSwipeStart(e.changedTouches[0].clientX)}
        onTouchEnd={(e) => handleSwipeEnd(e.changedTouches[0].clientX)}
      >
        {currentPageItems.map((card) => {
          const style = themeStyles[(card.theme as Theme) || 'white'] || themeStyles.white
          const usage = Math.round((card.currentBill / card.limit) * 100)
          return (
            <div
              key={card.id}
              className="
                flex items-center gap-4 rounded-xl bg-white shadow-sm border border-border
                px-5 py-4 transition duration-200
                hover:-translate-y-1 hover:shadow-md cursor-pointer
              "
              onClick={() => handleDetail(card.id)}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${style.blockClass}`}>
                <Icon name="credit-card" className={`w-6 h-6 ${style.iconClass}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-secondary truncate">{card.name}</div>
                <div className="text-2xl font-bold text-text-primary leading-snug">{formatCurrency(card.currentBill)}</div>
                <div className="text-sm text-text-secondary">•••• {card.lastDigits}</div>
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
        })}
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
              "
              aria-label="Próxima página"
            >
              <Icon name="chevronRight" className="w-5 h-5 text-text-primary" />
            </button>
          </div>
        </div>
      )}

      {createOpen && (
        <Modal title="Novo cartão" onClose={() => setCreateOpen(false)}>
          <p className="text-text-secondary text-sm">Formulário de criação será implementado nos próximos prompts.</p>
        </Modal>
      )}

      {detailId && (
        <Modal title="Detalhes do cartão" onClose={() => setDetailId(null)}>
          <p className="text-text-secondary text-sm">Detalhes completos do cartão serão adicionados futuramente.</p>
        </Modal>
      )}
    </section>
  )
}
