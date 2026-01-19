import { useEffect, useMemo, useRef, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { EditTransactionModal } from '../modals/EditTransactionModal'

type LocalTypeFilter = 'all' | 'income' | 'expense'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatCurrency = (value: number) => currencyFormatter.format(value)

const formatDate = (value: Date) => {
  const day = value.getDate().toString().padStart(2, '0')
  const month = (value.getMonth() + 1).toString().padStart(2, '0')
  const year = value.getFullYear()
  return `${day}/${month}/${year}`
}

const PAGE_SIZE = 5

function buildPageList(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, idx) => idx + 1)

  const pages = new Set<number>()
  pages.add(1)
  pages.add(2)
  pages.add(3)
  pages.add(total)
  pages.add(total - 1)

  pages.add(current)
  pages.add(current - 1)
  pages.add(current + 1)

  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result: Array<number | 'ellipsis'> = []

  sorted.forEach((page, idx) => {
    result.push(page)
    const next = sorted[idx + 1]
    if (next && next - page > 1) {
      result.push('ellipsis')
    }
  })

  return result
}

export function TransactionsTable() {
  const { getFilteredTransactions, bankAccounts, creditCards, familyMembers, deleteTransaction } = useFinance()
  const [searchText, setSearchText] = useState('')
  const [typeFilter, setTypeFilter] = useState<LocalTypeFilter>('all')
  const [page, setPage] = useState(1)
  const [editTxId, setEditTxId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)

  const filteredTransactions = useMemo(() => {
    const base = getFilteredTransactions()
    const search = searchText.trim().toLowerCase()

    const typed = base.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false

      if (search) {
        const haystack = `${tx.description} ${tx.category}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }

      return true
    })

    return typed.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [getFilteredTransactions, searchText, typeFilter])

  useEffect(() => {
    setPage(1)
  }, [searchText, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [page])

  const startIndex = (page - 1) * PAGE_SIZE
  const paginated = filteredTransactions.slice(startIndex, startIndex + PAGE_SIZE)

  const showingFrom = filteredTransactions.length === 0 ? 0 : startIndex + 1
  const showingTo = Math.min(filteredTransactions.length, startIndex + PAGE_SIZE)

  const resolveAccountName = (accountId: string) => {
    const bank = bankAccounts.find((acc) => acc.id === accountId)
    if (bank) return bank.name || bank.bank || 'Conta corrente'

    const card = creditCards.find((c) => c.id === accountId)
    if (card) return card.name || card.bank || 'Cartão'

    return 'Desconhecido'
  }

  const resolveMemberAvatar = (memberId: string | null) => {
    if (!memberId) return null
    return familyMembers.find((member) => member.id === memberId) || null
  }

  const handlePageChange = (target: number) => {
    if (target < 1 || target > totalPages || target === page) return
    setPage(target)
  }

  const typeOptions: Array<{ value: LocalTypeFilter; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'income', label: 'Receitas' },
    { value: 'expense', label: 'Despesas' },
  ]

  return (
    <section
      ref={tableRef}
      className="rounded-xl border border-border bg-white p-8 shadow-sm w-full flex flex-col gap-6"
    >
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-heading-lg font-semibold text-text-primary">Extrato detalhado</h2>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar lançamentos..."
              className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as LocalTypeFilter)}
            className="w-full md:w-[140px] rounded-full border border-border bg-white py-2.5 px-4 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[1024px] rounded-xl border border-border">
          <div className="grid grid-cols-[60px,140px,1.2fr,1fr,1.1fr,120px,120px,100px] bg-gray-50 text-text-primary font-semibold text-body rounded-t-xl">
            <div className="px-4 py-3">Membro</div>
            <div className="px-4 py-3">Datas</div>
            <div className="px-4 py-3">Descrição</div>
            <div className="px-4 py-3">Categorias</div>
            <div className="px-4 py-3">Conta/cartão</div>
            <div className="px-4 py-3">Parcelas</div>
            <div className="px-4 py-3 text-right">Valor</div>
            <div className="px-4 py-3 text-center">Ações</div>
          </div>

          <div className="divide-y divide-border">
            {paginated.length === 0 ? (
              <div className="flex items-center justify-center py-12 px-4 text-text-secondary text-body">
                Nenhum lançamento encontrado.
              </div>
            ) : (
              paginated.map((tx, idx) => {
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                const member = resolveMemberAvatar(tx.memberId)
                const accountName = resolveAccountName(tx.accountId)
                const isIncome = tx.type === 'income'
                const valueColor = isIncome ? 'text-green-600' : 'text-text-primary'
                const sign = isIncome ? '+' : '-'

                return (
                  <div
                    key={tx.id}
                    className={`grid grid-cols-[60px,140px,1.2fr,1fr,1.1fr,120px,120px,100px] items-center ${rowBg} hover:bg-gray-100 transition-colors duration-150 px-2 py-4 animate-fade-in`}
                  >
                    <div className="px-2 flex items-center">
                      {member ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-text-primary flex items-center justify-center text-sm font-semibold">
                          {member.name.charAt(0)}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-text-secondary flex items-center justify-center">
                          <Icon name="person" className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="px-2 text-text-secondary text-body">{formatDate(tx.date)}</div>

                    <div className="px-2 flex items-center gap-2 text-text-primary font-semibold">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                        }`}
                      >
                        <Icon name={isIncome ? 'south_west' : 'north_east'} className="w-5 h-5" />
                      </span>
                      <span className="text-body">{tx.description}</span>
                    </div>

                    <div className="px-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-text-secondary text-sm px-3 py-1">
                        {tx.category}
                      </span>
                    </div>

                    <div className="px-2 text-text-secondary text-body">{accountName}</div>

                    <div className="px-2 text-text-secondary text-body">
                      {tx.installments && tx.installments > 1 ? `${tx.installments}x` : '-'}
                    </div>

                    <div className="px-2 text-right font-semibold text-body">
                      <span className={valueColor}>
                        {sign} {formatCurrency(tx.amount)}
                      </span>
                    </div>

                    <div className="px-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditTxId(tx.id)}
                        className="w-8 h-8 rounded-full border border-border text-text-primary hover:bg-gray-100 flex items-center justify-center"
                        aria-label="Editar transação"
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Tem certeza que deseja excluir a transação "${tx.description}"? Esta ação não pode ser desfeita.`)) {
                            return
                          }
                          try {
                            await deleteTransaction(tx.id)
                            setToast('Transação excluída com sucesso!')
                            setTimeout(() => setToast(null), 2000)
                          } catch (err) {
                            console.error('Erro ao excluir transação:', err)
                            setToast('Erro ao excluir transação')
                            setTimeout(() => setToast(null), 3000)
                          }
                        }}
                        className="w-8 h-8 rounded-full border border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center"
                        aria-label="Excluir transação"
                      >
                        <Icon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <EditTransactionModal
        open={!!editTxId}
        transactionId={editTxId ?? undefined}
        onClose={() => setEditTxId(null)}
      />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      ) : null}

      <footer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span className="text-text-primary font-medium">
          Mostrando {showingFrom} a {showingTo} de {filteredTransactions.length}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`h-9 px-3 rounded-full border border-border text-body ${
              page === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-text-secondary hover:bg-gray-100'
            }`}
            aria-label="Página anterior"
          >
            ←
          </button>

          {buildPageList(page, totalPages).map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => handlePageChange(item)}
                className={`h-9 min-w-[36px] px-3 rounded-full border ${
                  item === page
                    ? 'bg-black text-white border-black'
                    : 'border-border text-text-secondary hover:bg-gray-100'
                }`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`h-9 px-3 rounded-full border border-border text-body ${
              page === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-text-secondary hover:bg-gray-100'
            }`}
            aria-label="Próxima página"
          >
            →
          </button>
        </div>
      </footer>
    </section>
  )
}
