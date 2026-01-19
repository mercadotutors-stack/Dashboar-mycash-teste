import { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { CurrencyInput } from '../ui/CurrencyInput'
import type { TransactionType } from '../../types'

type Props = {
  open: boolean
  onClose: () => void
  transactionId?: string
}

export function EditTransactionModal({ open, onClose, transactionId }: Props) {
  const { transactions, updateTransaction, deleteTransaction, bankAccounts, creditCards, familyMembers, categories } = useFinance()
  
  const transaction = transactionId ? transactions.find((t) => t.id === transactionId) : null

  const [type, setType] = useState<TransactionType>('income')
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [memberId, setMemberId] = useState<string | null>(null)
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (open && transaction) {
      setType(transaction.type)
      setAmount(transaction.amount)
      setDescription(transaction.description)
      setCategory(transaction.category)
      setMemberId(transaction.memberId)
      setAccountId(transaction.accountId)
      setDate(transaction.date.toISOString().split('T')[0])
      setErrors({})
    }
  }, [open, transaction])

  const categoriesByType = useMemo(() => {
    const incomeCats = categories.filter(c => c.type === 'income').map(c => c.name)
    const expenseCats = categories.filter(c => c.type === 'expense').map(c => c.name)
    return {
      income: incomeCats.length ? incomeCats : ['Salário', 'Investimentos', 'Bônus'],
      expense: expenseCats.length ? expenseCats : ['Supermercado', 'Transporte', 'Moradia'],
    }
  }, [categories])

  const accountsGrouped = useMemo(() => {
    return {
      banks: bankAccounts.map((acc) => ({ id: acc.id, label: acc.name ?? 'Conta bancária', type: 'bank' as const })),
      cards: creditCards.map((card) => ({
        id: card.id,
        label: card.name ?? card.bank ?? 'Cartão de crédito',
        type: 'credit' as const,
      })),
    }
  }, [bankAccounts, creditCards])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!amount || amount <= 0) nextErrors.amount = 'Informe um valor maior que zero.'
    if (!description || description.trim().length < 3)
      nextErrors.description = 'Descrição deve ter pelo menos 3 caracteres.'
    if (!category) nextErrors.category = 'Selecione uma categoria.'
    if (!accountId) nextErrors.accountId = 'Selecione uma conta ou cartão.'
    if (!date) nextErrors.date = 'Selecione uma data.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !transaction) return

    try {
      await updateTransaction(transaction.id, {
        type,
        amount: amount,
        description: description.trim(),
        category,
        date: new Date(date),
        accountId,
        memberId,
      })
      setToast('Transação atualizada com sucesso!')
      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao atualizar transação:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar transação. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    if (!confirm(`Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await deleteTransaction(transaction.id)
      setToast('Transação excluída com sucesso!')
      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao excluir transação:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir transação. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (!open || !transaction) return null

  const iconBg = type === 'income' ? 'bg-[#C4E703]' : 'bg-black'
  const iconName = type === 'income' ? 'south-west' : 'north-east'
  const selectedCatList = type === 'income' ? categoriesByType.income : categoriesByType.expense

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center`}>
            <Icon name={iconName} className={`w-7 h-7 ${type === 'expense' ? 'text-white' : 'text-black'}`} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-xl font-bold text-text-primary">Editar Transação</h2>
            <p className="text-text-secondary text-sm">
              Atualize as informações da transação financeira.
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
        <div className="mx-auto w-full max-w-3xl py-6 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
            {/* Tipo */}
            <div className="bg-gray-100 rounded-full p-1 flex gap-2">
              {(['income', 'expense'] as TransactionType[]).map((t) => {
                const selected = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-3 rounded-full text-center font-semibold transition ${
                      selected ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {t === 'income' ? 'Receita' : 'Despesa'}
                  </button>
                )
              })}
            </div>

            {/* Valor */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Valor da Transação</label>
              <CurrencyInput
                value={amount}
                onChange={(value) => setAmount(value)}
                placeholder="0,00"
                error={!!errors.amount}
              />
              {errors.amount ? <p className="text-sm text-red-600">{errors.amount}</p> : null}
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.description ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Ex: Salário mensal"
              />
              {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
            </div>

            {/* Data */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.date ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.date ? <p className="text-sm text-red-600">{errors.date}</p> : null}
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.category ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {selectedCatList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category ? <p className="text-sm text-red-600">{errors.category}</p> : null}
            </div>

            {/* Membro */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Membro (opcional)</label>
              <select
                value={memberId || ''}
                onChange={(e) => setMemberId(e.target.value || null)}
                className="h-12 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none"
              >
                <option value="">Família (Geral)</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Conta/Cartão */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Conta/Cartão</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.accountId ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Selecione</option>
                <optgroup label="Contas Bancárias">
                  {accountsGrouped.banks.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cartões de Crédito">
                  {accountsGrouped.cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.accountId ? <p className="text-sm text-red-600">{errors.accountId}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-border bg-white px-6 py-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleDelete}
          className="h-11 px-6 rounded-full border border-red-500 text-red-600 hover:bg-red-50"
        >
          Excluir
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-full border border-border text-text-primary hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-11 px-6 rounded-full bg-black text-white font-semibold hover:opacity-90"
          >
            Salvar Alterações
          </button>
        </div>
      </footer>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
