import { useEffect, useMemo, useRef, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { EditTransactionModal } from '../modals/EditTransactionModal'
import { Toast } from '../ui/Toast'
import { formatCurrency, formatDate as formatDateUtil } from '../../utils'

type LocalTypeFilter = 'all' | 'income' | 'expense'

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
      className="rounded-xl border border-border bg-white p-4 sm:p-6 lg:p-8 shadow-sm w-full flex flex-col gap-4 sm:gap-6 animate-slide-up"
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
              className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-gray-300 transition-input"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as LocalTypeFilter)}
            className="w-full md:w-[140px] rounded-full border border-border bg-white py-2.5 px-4 text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-gray-300 transition-input"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Mobile Cards View (<768px) - Vertical cards without overflow */}
      <div className="block md:hidden flex flex-col gap-3 w-full">
        {paginated.length === 0 ? (
          <div className="flex items-center justify-center py-12 px-4 text-text-secondary text-body">
            Nenhum lançamento encontrado.
          </div>
        ) : (
          paginated.map((tx, idx) => {
            const member = resolveMemberAvatar(tx.memberId)
            const accountName = resolveAccountName(tx.accountId)
            const isIncome = tx.type === 'income'
            const valueColor = isIncome ? 'text-green-600' : 'text-text-primary'
            const sign = isIncome ? '+' : '-'

            return (
              <div
                key={tx.id}
                className="rounded-xl border border-border bg-white p-4 shadow-sm animate-slide-up transition-card w-full"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member ? (
                      <div className="w-10 h-10 rounded-full bg-gray-200 text-text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-text-secondary flex items-center justify-center flex-shrink-0">
                        <Icon name="person" className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-body font-semibold text-text-primary truncate">{tx.description}</div>
                      <div className="text-sm text-text-secondary">{formatDateUtil(tx.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditTxId(tx.id)}
                      className="w-11 h-11 rounded-full border border-border text-text-primary hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-button touch-manipulation"
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
                      className="w-11 h-11 rounded-full border border-red-500 text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center justify-center transition-button touch-manipulation"
                      aria-label="Excluir transação"
                    >
                      <Icon name="delete" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Valor</span>
                    <span className={`text-lg font-bold ${valueColor} break-words`}>
                      {sign} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-secondary flex-shrink-0">Categoria</span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-text-secondary text-xs px-2 py-1 truncate max-w-[70%]">
                      {tx.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text-secondary flex-shrink-0">Conta/Cartão</span>
                    <span className="text-sm text-text-primary font-medium truncate text-right max-w-[70%]">{accountName}</span>
                  </div>
                  {tx.totalInstallments && tx.totalInstallments > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Parcelas</span>
                      <span className="text-sm text-text-primary font-medium">
                        {`${tx.currentInstallment ?? 1}/${tx.totalInstallments}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}
                  >
                    <Icon name={isIncome ? 'south_west' : 'north_east'} className="w-4 h-4" />
                  </span>
                  <span className="text-xs text-text-secondary truncate">
                    {isIncome ? 'Receita' : 'Despesa'} • {accountName}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tablet Hybrid View (768px-1023px) - Compact cards in grid */}
      <div className="hidden md:block lg:hidden w-full">
        <div className="grid grid-cols-1 gap-4">
          {paginated.length === 0 ? (
            <div className="flex items-center justify-center py-12 px-4 text-text-secondary text-body">
              Nenhum lançamento encontrado.
            </div>
          ) : (
            paginated.map((tx, idx) => {
              const member = resolveMemberAvatar(tx.memberId)
              const accountName = resolveAccountName(tx.accountId)
              const isIncome = tx.type === 'income'
              const valueColor = isIncome ? 'text-green-600' : 'text-text-primary'
              const sign = isIncome ? '+' : '-'

              return (
                <div
                  key={tx.id}
                  className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition-card animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {member ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-text-secondary flex items-center justify-center flex-shrink-0">
                          <Icon name="person" className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-body font-semibold text-text-primary truncate">{tx.description}</div>
                        <div className="text-sm text-text-secondary">{formatDateUtil(tx.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditTxId(tx.id)}
                        className="w-10 h-10 rounded-full border border-border text-text-primary hover:bg-gray-100 flex items-center justify-center transition-button"
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
                        className="w-10 h-10 rounded-full border border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center transition-button"
                        aria-label="Excluir transação"
                      >
                        <Icon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-secondary">Valor</span>
                      <span className={`text-lg font-bold ${valueColor}`}>
                        {sign} {formatCurrency(tx.amount)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-secondary">Categoria</span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-text-secondary text-xs px-2 py-1 w-fit">
                        {tx.category}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-secondary">Conta/Cartão</span>
                      <span className="text-sm text-text-primary font-medium truncate">{accountName}</span>
                    </div>
                    {tx.totalInstallments && tx.totalInstallments > 1 ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-secondary">Parcelas</span>
                        <span className="text-sm text-text-primary font-medium">
                          {`${tx.currentInstallment ?? 1}/${tx.totalInstallments}`}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-secondary">Tipo</span>
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          isIncome ? 'text-green-600' : 'text-red-500'
                        }`}>
                          <Icon name={isIncome ? 'south_west' : 'north_east'} className="w-3 h-3" />
                          {isIncome ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Desktop Table View (>=1024px) - Full table */}
      <div className="hidden lg:block w-full overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
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
                    className={`grid grid-cols-[60px,140px,1.2fr,1fr,1.1fr,120px,120px,100px] items-center ${rowBg} hover:bg-gray-100 transition-colors duration-150 px-2 py-4 animate-slide-up`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="px-2 flex items-center">
                      {member ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-text-primary flex items-center justify-center text-sm font-semibold">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : (
                            member.name.charAt(0)
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-text-secondary flex items-center justify-center">
                          <Icon name="person" className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="px-2 text-text-secondary text-body">{formatDateUtil(tx.date)}</div>

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
                      {tx.totalInstallments && tx.totalInstallments > 1
                        ? `${tx.currentInstallment ?? 1}/${tx.totalInstallments}`
                        : '-'}
                    </div>

                    <div className="px-2 text-right font-semibold text-body">
                      <span className={valueColor}>
                        {sign} {formatCurrency(tx.amount)}
                      </span>
                    </div>

                    <div className="px-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditTxId(tx.id)}
                        className="w-9 h-9 rounded-full border border-border text-text-primary hover:bg-gray-100 flex items-center justify-center transition-button"
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
                        className="w-9 h-9 rounded-full border border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center transition-button"
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

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}

      <footer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <span className="text-text-primary font-medium">
          Mostrando {showingFrom} a {showingTo} de {filteredTransactions.length}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`h-11 min-w-[44px] md:h-9 md:min-w-[36px] px-3 rounded-full border border-border text-body transition-button touch-manipulation ${
              page === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-text-secondary hover:bg-gray-100 active:bg-gray-200'
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
                className={`h-11 min-w-[44px] md:h-9 md:min-w-[36px] px-3 rounded-full border transition-button touch-manipulation ${
                  item === page
                    ? 'bg-black text-white border-black'
                    : 'border-border text-text-secondary hover:bg-gray-100 active:bg-gray-200'
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
            className={`h-11 min-w-[44px] md:h-9 md:min-w-[36px] px-3 rounded-full border border-border text-body transition-button touch-manipulation ${
              page === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-text-secondary hover:bg-gray-100 active:bg-gray-200'
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
