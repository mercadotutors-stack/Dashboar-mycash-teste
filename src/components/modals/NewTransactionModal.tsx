import { useEffect, useMemo, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { useFeedback } from '../../context/FeedbackContext'
import { Icon } from '../ui/Icon'
import { CurrencyInput } from '../ui/CurrencyInput'
import type { TransactionType } from '../../types'
import { ModalWrapper } from '../ui/ModalWrapper'
import { Toast } from '../ui/Toast'

type Props = {
  open: boolean
  onClose: () => void
  presetAccountId?: string
  presetType?: TransactionType
}

type FormState = {
  type: TransactionType
  amount: number
  description: string
  category: string
  memberId: string | null
  accountId: string
  installments: number
  paidInstallments: number
  isRecurring: boolean
  purchaseDate: string
  firstInstallmentDate: string
  newCategory: string
  showNewCategory: boolean
}

const defaultState: FormState = {
  type: 'income',
  amount: 0,
  description: '',
  category: '',
  memberId: null,
  accountId: '',
  installments: 1,
  paidInstallments: 0,
  isRecurring: false,
  purchaseDate: new Date().toISOString().slice(0, 10),
  firstInstallmentDate: new Date().toISOString().slice(0, 10),
  newCategory: '',
  showNewCategory: false,
}

export function NewTransactionModal({ open, onClose, presetAccountId, presetType }: Props) {
  const { addTransaction, addCategory, bankAccounts, creditCards, familyMembers, transactions, categories } = useFinance()
  const [state, setState] = useState<FormState>({ ...defaultState, accountId: presetAccountId ?? '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const { show } = useFeedback()

  useEffect(() => {
    if (open) {
      setState(() => ({
        ...defaultState,
        accountId: presetAccountId ?? '',
        type: presetType ?? 'income',
      }))
      setErrors({})
    }
  }, [open, presetAccountId, presetType])

  // Usa categorias do banco de dados, com fallback para categorias das transações
  const categoriesByType = useMemo(() => {
    // Primeiro, pega categorias do banco de dados
    const dbIncomeCats = categories.filter((c) => c.type === 'income').map((c) => c.name)
    const dbExpenseCats = categories.filter((c) => c.type === 'expense').map((c) => c.name)
    
    // Depois, adiciona categorias usadas em transações (para manter compatibilidade)
    const txIncomeCats = new Set<string>(dbIncomeCats)
    const txExpenseCats = new Set<string>(dbExpenseCats)
    
    transactions.forEach((tx) => {
      if (tx.type === 'income' && tx.category) txIncomeCats.add(tx.category)
      if (tx.type === 'expense' && tx.category) txExpenseCats.add(tx.category)
    })
    
    return {
      income: txIncomeCats.size ? Array.from(txIncomeCats) : ['Salário', 'Investimentos', 'Bônus'],
      expense: txExpenseCats.size ? Array.from(txExpenseCats) : ['Supermercado', 'Transporte', 'Moradia'],
    }
  }, [categories, transactions])

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

  const isCreditCard = useMemo(() => {
    return accountsGrouped.cards.some((c) => c.id === state.accountId)
  }, [accountsGrouped.cards, state.accountId])

  const showInstallments = state.type === 'expense' && isCreditCard
  const showRecurring = state.type === 'expense'

  const handleChange = (field: keyof FormState, value: string | number | boolean | null) => {
    setState((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'installments' && typeof value === 'number' && value > 1) {
        next.isRecurring = false
      }
      if (field === 'isRecurring' && value === true) {
        next.installments = 1
      }
      return next
    })
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!state.amount || state.amount <= 0) nextErrors.amount = 'Informe um valor maior que zero.'
    if (!state.description || state.description.trim().length < 3)
      nextErrors.description = 'Descrição deve ter pelo menos 3 caracteres.'
    if (!state.category) nextErrors.category = 'Selecione ou crie uma categoria.'
    if (!state.accountId) nextErrors.accountId = 'Selecione uma conta ou cartão.'

    if (showInstallments && (state.installments < 1 || state.installments > 12)) {
      nextErrors.installments = 'Escolha entre 1x e 12x.'
    }
    if (showInstallments) {
      if (state.paidInstallments < 0) {
        nextErrors.paidInstallments = 'Parcelas pagas não pode ser negativo.'
      }
      if (state.paidInstallments > state.installments) {
        nextErrors.paidInstallments = 'Parcelas pagas não pode exceder o total.'
      }
      if (!state.purchaseDate) {
        nextErrors.purchaseDate = 'Informe a data da compra.'
      }
      if (!state.firstInstallmentDate) {
        nextErrors.firstInstallmentDate = 'Informe a data da 1ª parcela.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      await addTransaction({
        type: state.type,
        amount: state.amount,
        description: state.description.trim(),
        category: state.category,
        date: state.purchaseDate ? new Date(state.purchaseDate) : new Date(),
        purchaseDate: state.purchaseDate ? new Date(state.purchaseDate) : new Date(),
        firstInstallmentDate: state.firstInstallmentDate ? new Date(state.firstInstallmentDate) : new Date(),
        accountId: state.accountId,
        memberId: state.memberId,
        totalInstallments: showInstallments ? state.installments : 1,
        paidInstallments: showInstallments ? state.paidInstallments : 0,
        installments: showInstallments ? state.installments : 1,
        currentInstallment: 1,
        status: 'completed',
        isRecurring: showRecurring ? state.isRecurring : false,
        isPaid: false,
      })
      setToast('Transação registrada com sucesso!')
      show('Transação salva com sucesso', 'success')
      setTimeout(() => setToast(null), 2000)
      // Pequeno delay para garantir que o estado seja atualizado antes de fechar
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (err) {
      console.error('Erro ao adicionar transação:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar transação. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      show(errorMessage, 'error', 4000)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (!open) return null

  const iconBg = state.type === 'income' ? 'bg-[#C4E703]' : 'bg-black'
  const iconName = state.type === 'income' ? 'south-west' : 'north-east'
  const selectedCatList = state.type === 'income' ? categoriesByType.income : categoriesByType.expense

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      className="w-full h-full bg-white flex flex-col"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center text-text-primary`}>
            <Icon name={iconName} className={`w-7 h-7 ${state.type === 'expense' ? 'text-white' : 'text-black'}`} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-xl font-bold text-text-primary">Nova Transação</h2>
            <p className="text-text-secondary text-sm">
              Registre entradas e saídas para manter seu controle financeiro.
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
          {/* Toggle */}
          <div className="bg-gray-100 rounded-full p-1 flex gap-2">
            {(['income', 'expense'] as TransactionType[]).map((type) => {
              const selected = state.type === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChange('type', type)}
                  className={`flex-1 py-3 rounded-full text-center font-semibold transition ${
                    selected ? 'bg-white shadow-sm text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {type === 'income' ? 'Receita' : 'Despesa'}
                </button>
              )
            })}
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Valor da Transação</label>
            <CurrencyInput
              value={state.amount}
              onChange={(value) => handleChange('amount', value)}
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
              value={state.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`h-14 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                errors.description ? 'border-red-500' : 'border-border'
              }`}
              placeholder="Ex: Supermercado Semanal"
            />
            {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Categoria</label>
            <div className="flex gap-2">
              <select
                value={state.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`h-14 flex-1 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.category ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Selecione</option>
                {selectedCatList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleChange('showNewCategory', !state.showNewCategory)}
                className="w-14 h-14 rounded-full border border-border flex items-center justify-center bg-white hover:bg-gray-100"
                aria-label="Nova categoria"
              >
                <Icon name={state.showNewCategory ? 'close' : 'add'} className="w-5 h-5 text-text-primary" />
              </button>
            </div>
            {state.showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={state.newCategory}
                  onChange={(e) => handleChange('newCategory', e.target.value)}
                  className="flex-1 h-12 rounded-full border border-border px-4 text-body text-text-primary outline-none bg-white"
                  placeholder="Nome da categoria"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!state.newCategory.trim()) return
                    try {
                      await addCategory({
                        name: state.newCategory.trim(),
                        type: state.type,
                      })
                      handleChange('category', state.newCategory.trim())
                      handleChange('newCategory', '')
                      handleChange('showNewCategory', false)
                      setToast('Categoria criada com sucesso!')
                      setTimeout(() => setToast(null), 2000)
                    } catch (err) {
                      console.error('Erro ao criar categoria:', err)
                      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria'
                      setToast(`Erro: ${errorMessage}`)
                      setTimeout(() => setToast(null), 3000)
                    }
                  }}
                  className="px-4 h-12 rounded-full bg-black text-white text-sm font-semibold"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('newCategory', '')
                    handleChange('showNewCategory', false)
                  }}
                  className="px-4 h-12 rounded-full border border-border text-text-secondary text-sm"
                >
                  Cancelar
                </button>
              </div>
            ) : null}
            {errors.category ? <p className="text-sm text-red-600">{errors.category}</p> : null}
          </div>

          {/* Membro & Conta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Membro</label>
              <select
                value={state.memberId ?? 'family'}
                onChange={(e) => handleChange('memberId', e.target.value === 'family' ? null : e.target.value)}
                className="h-14 rounded-full border border-border bg-white px-4 text-body text-text-primary outline-none"
              >
                <option value="family">Família (Geral)</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Conta / Cartão</label>
              <select
                value={state.accountId}
                onChange={(e) => handleChange('accountId', e.target.value)}
                className={`h-14 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.accountId ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Selecione</option>
                {accountsGrouped.banks.length ? (
                  <optgroup label="Contas Bancárias">
                    {accountsGrouped.banks.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                {accountsGrouped.cards.length ? (
                  <optgroup label="Cartões de Crédito">
                    {accountsGrouped.cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.label}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
              {errors.accountId ? <p className="text-sm text-red-600">{errors.accountId}</p> : null}
            </div>
          </div>

          {/* Parcelamento */}
          {showInstallments ? (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Parcelamento</label>
                <select
                  value={state.installments}
                  onChange={(e) => handleChange('installments', Number(e.target.value))}
                  disabled={state.isRecurring}
                  className={`h-14 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                    errors.installments ? 'border-red-500' : 'border-border'
                  } ${state.isRecurring ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {Array.from({ length: 12 }, (_, idx) => idx + 1).map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? 'À vista (1x)' : `${n}x`}
                    </option>
                  ))}
                </select>
                {state.isRecurring ? (
                  <p className="text-sm italic text-text-secondary">Parcelamento desabilitado para despesas recorrentes</p>
                ) : null}
                {errors.installments ? <p className="text-sm text-red-600">{errors.installments}</p> : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Parcelas já pagas</label>
                  <input
                    type="number"
                    min={0}
                    max={state.installments}
                    value={state.paidInstallments}
                    onChange={(e) => handleChange('paidInstallments', Number(e.target.value))}
                    className={`h-14 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.paidInstallments ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.paidInstallments ? <p className="text-sm text-red-600">{errors.paidInstallments}</p> : null}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Data da compra</label>
                  <input
                    type="date"
                    value={state.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                    className={`h-14 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.purchaseDate ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.purchaseDate ? <p className="text-sm text-red-600">{errors.purchaseDate}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Data da 1ª parcela</label>
                  <input
                    type="date"
                    value={state.firstInstallmentDate}
                    onChange={(e) => handleChange('firstInstallmentDate', e.target.value)}
                    className={`h-14 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.firstInstallmentDate ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {errors.firstInstallmentDate ? (
                    <p className="text-sm text-red-600">{errors.firstInstallmentDate}</p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {/* Recorrente */}
          {showRecurring ? (
            <div className="flex flex-col gap-2 animate-fade-in">
              <div
                className={`rounded-lg border px-4 py-3 bg-blue-50 ${
                  state.installments > 1 ? 'border-blue-200 opacity-70' : 'border-blue-200'
                }`}
              >
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={state.isRecurring}
                    onChange={(e) => handleChange('isRecurring', e.target.checked)}
                    disabled={state.installments > 1}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary flex items-center gap-2">
                      <Icon name="repeat" className="w-4 h-4" />
                      Despesa Recorrente
                    </span>
                    <span className="text-sm text-text-secondary">
                      {state.installments > 1
                        ? 'Não disponível para compras parceladas'
                        : 'Marque para repetir automaticamente todo mês.'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="sticky bottom-0 z-10 border-t border-border bg-white px-6 py-4 flex items-center justify-end gap-3">
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
          Salvar Transação
        </button>
      </footer>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ModalWrapper>
  )
}
