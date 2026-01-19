import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import type { Transaction, TransactionType } from '../types'
import { Icon } from '../components/ui/Icon'
import { NewTransactionModal } from '../components/modals/NewTransactionModal'
import { EditTransactionModal } from '../components/modals/EditTransactionModal'

type SortField = 'date' | 'amount'
type SortOrder = 'asc' | 'desc'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function Transactions() {
  const { getFilteredTransactions, bankAccounts, creditCards, familyMembers, deleteTransaction } = useFinance()
  const baseTransactions = getFilteredTransactions()

  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | TransactionType>('all')
  const [category, setCategory] = useState('')
  const [account, setAccount] = useState('')
  const [member, setMember] = useState<string | null>(null)
  const [status, setStatus] = useState<'all' | 'completed' | 'pending'>('all')
  const [dateStart, setDateStart] = useState<string>('')
  const [dateEnd, setDateEnd] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [showNew, setShowNew] = useState(false)
  const [editTxId, setEditTxId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const PAGE_SIZE = 10

  const allCategories = useMemo(() => {
    const cats = new Set<string>()
    baseTransactions.forEach((tx) => cats.add(tx.category))
    return Array.from(cats)
  }, [baseTransactions])

  const filtered = useMemo(() => {
    let list = [...baseTransactions]

    if (type !== 'all') list = list.filter((tx) => tx.type === type)
    if (category) list = list.filter((tx) => tx.category === category)
    if (account) list = list.filter((tx) => tx.accountId === account)
    if (member) list = list.filter((tx) => tx.memberId === member)
    if (status !== 'all') list = list.filter((tx) => tx.status === status)
    if (search.trim()) {
      const needle = search.toLowerCase()
      list = list.filter((tx) => `${tx.description} ${tx.category}`.toLowerCase().includes(needle))
    }
    if (dateStart) {
      const start = new Date(dateStart).getTime()
      list = list.filter((tx) => tx.date.getTime() >= start)
    }
    if (dateEnd) {
      const end = new Date(dateEnd).getTime()
      list = list.filter((tx) => tx.date.getTime() <= end)
    }

    list.sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1
      if (sortField === 'date') return (a.date.getTime() - b.date.getTime()) * dir
      return (a.amount - b.amount) * dir
    })

    return list
  }, [account, baseTransactions, category, dateEnd, dateStart, member, search, sortField, sortOrder, status, type])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totals = useMemo(() => {
    const incomes = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return { incomes, expenses, diff: incomes - expenses }
  }, [filtered])

  const accountName = (tx: Transaction) => {
    const bank = bankAccounts.find((b) => b.id === tx.accountId)
    if (bank) return bank.name ?? 'Conta bancária'
    const card = creditCards.find((c) => c.id === tx.accountId)
    if (card) return card.name ?? 'Cartão'
    return 'Desconhecido'
  }

  const exportCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Conta', 'Parcelas', 'Valor']
    const rows = filtered.map((tx) => [
      tx.date.toISOString(),
      tx.type,
      tx.description,
      tx.category,
      accountName(tx),
      tx.installments ?? 1,
      tx.amount,
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transacoes.csv'
    link.click()
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary px-page py-6 flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-heading-xl font-bold text-text-primary">Transações</h1>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="h-10 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100 text-sm"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="h-10 px-4 rounded-full bg-black text-white font-semibold flex items-center gap-2 text-sm"
          >
            <Icon name="add" className="w-5 h-5" />
            Nova Transação
          </button>
        </div>
      </header>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Total de receitas" value={formatCurrency(totals.incomes)} positive />
        <SummaryCard label="Total de despesas" value={formatCurrency(totals.expenses)} />
        <SummaryCard
          label="Diferença"
          value={formatCurrency(totals.diff)}
          positive={totals.diff >= 0}
        />
        <SummaryCard label="Transações encontradas" value={String(filtered.length)} />
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Input
            label="Buscar"
            value={search}
            onChange={setSearch}
            placeholder="Descrição ou categoria"
          />
          <Select
            label="Tipo"
            value={type}
            onChange={(v) => setType(v as any)}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'income', label: 'Receitas' },
              { value: 'expense', label: 'Despesas' },
            ]}
          />
          <Select
            label="Categoria"
            value={category}
            onChange={setCategory}
            options={[{ value: '', label: 'Todas' }, ...allCategories.map((c) => ({ value: c, label: c }))]}
          />
          <Select
            label="Conta/Cartão"
            value={account}
            onChange={setAccount}
            options={[
              { value: '', label: 'Todas' },
              ...bankAccounts.map((a) => ({ value: a.id, label: a.name ?? 'Conta' })),
              ...creditCards.map((c) => ({ value: c.id, label: c.name ?? 'Cartão' })),
            ]}
          />
          <Select
            label="Membro"
            value={member ?? ''}
            onChange={(v) => setMember(v || null)}
            options={[
              { value: '', label: 'Todos' },
              ...familyMembers.map((m) => ({ value: m.id, label: m.name })),
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as any)}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'completed', label: 'Concluído' },
              { value: 'pending', label: 'Pendente' },
            ]}
          />
          <Input label="Data início" type="date" value={dateStart} onChange={setDateStart} />
          <Input label="Data fim" type="date" value={dateEnd} onChange={setDateEnd} />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="grid grid-cols-[160px,1.2fr,1fr,1fr,120px,120px,100px] bg-gray-50 text-text-primary font-semibold text-body">
          <div className="px-4 py-3 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('date')}>
            Data
            {sortField === 'date' ? <Icon name={sortOrder === 'asc' ? 'north-east' : 'south-west'} className="w-4 h-4" /> : null}
          </div>
          <div className="px-4 py-3">Descrição</div>
          <div className="px-4 py-3">Categoria</div>
          <div className="px-4 py-3">Conta</div>
          <div className="px-4 py-3 cursor-pointer flex items-center gap-2" onClick={() => handleSort('amount')}>
            Valor
            {sortField === 'amount' ? <Icon name={sortOrder === 'asc' ? 'north-east' : 'south-west'} className="w-4 h-4" /> : null}
          </div>
          <div className="px-4 py-3">Status</div>
          <div className="px-4 py-3 text-center">Ações</div>
        </div>

        {paginated.length === 0 ? (
          <div className="py-10 text-center text-text-secondary">
            Nenhuma transação registrada ainda
          </div>
        ) : (
          paginated.map((tx, idx) => {
            const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
            const sign = tx.type === 'income' ? '+' : '-'
            const valueColor = tx.type === 'income' ? 'text-green-600' : 'text-text-primary'
            return (
              <div
                key={tx.id}
                className={`grid grid-cols-[160px,1.2fr,1fr,1fr,120px,120px,100px] items-center px-2 py-3 ${rowBg} hover:bg-gray-100 transition`}
              >
                <div className="px-2 text-text-secondary text-sm">{tx.date.toLocaleDateString('pt-BR')}</div>
                <div className="px-2 text-text-primary font-semibold flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}
                  >
                    <Icon name={tx.type === 'income' ? 'south-west' : 'north-east'} className="w-5 h-5" />
                  </span>
                  {tx.description}
                </div>
                <div className="px-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 text-text-secondary text-sm px-3 py-1">
                    {tx.category}
                  </span>
                </div>
                <div className="px-2 text-text-secondary text-sm">{accountName(tx)}</div>
                <div className={`px-2 text-right font-semibold ${valueColor}`}>
                  {sign} {formatCurrency(tx.amount)}
                </div>
                <div className="px-2 text-text-secondary text-sm capitalize">{tx.status}</div>
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

      {/* Paginação */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <span className="text-text-primary font-medium">
            Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(filtered.length, page * PAGE_SIZE)} de {filtered.length}
          </span>
          <div className="flex items-center gap-2">
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
        </div>
      ) : null}

      <NewTransactionModal open={showNew} onClose={() => setShowNew(false)} />
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
    </div>
  )
}

function SummaryCard({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-heading-md font-semibold ${positive ? 'text-green-600' : 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-text-primary">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-text-primary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
