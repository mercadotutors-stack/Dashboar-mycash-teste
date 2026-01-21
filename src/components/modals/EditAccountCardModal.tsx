import { useEffect, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'
import { CurrencyInput } from '../ui/CurrencyInput'
import { ModalWrapper } from '../ui/ModalWrapper'
import { Toast } from '../ui/Toast'

type Props = {
  open: boolean
  onClose: () => void
  accountId?: string
  cardId?: string
}

export function EditAccountCardModal({ open, onClose, accountId, cardId }: Props) {
  const { bankAccounts, creditCards, updateBankAccount, updateCreditCard, deleteBankAccount, deleteCreditCard, familyMembers } = useFinance()
  
  const account = accountId ? bankAccounts.find((a) => a.id === accountId) : null
  const card = cardId ? creditCards.find((c) => c.id === cardId) : null
  const isCard = !!card

  const [name, setName] = useState('')
  const [holderId, setHolderId] = useState('')
  const [balance, setBalance] = useState<number>(0)
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [limitValue, setLimitValue] = useState<number>(0)
  const [lastDigits, setLastDigits] = useState('')
  const [theme, setTheme] = useState<'black' | 'lime' | 'white' | ''>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (account) {
        setName(account.name)
        setHolderId(account.holderId)
        setBalance(account.balance)
      } else if (card) {
        setName(card.name)
        setHolderId(card.holderId)
        setLimitValue(card.limit)
        setClosingDay(card.closingDay.toString())
        setDueDay(card.dueDay.toString())
        setTheme(card.theme)
        setLastDigits(card.lastDigits || '')
      }
      setErrors({})
    }
  }, [open, account, card])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 3) next.name = 'Informe um nome com pelo menos 3 caracteres.'
    if (!holderId) next.holderId = 'Selecione o titular.'
    if (!isCard) {
      if (!balance) next.balance = 'Informe o saldo.'
    } else {
      const closing = Number(closingDay)
      const due = Number(dueDay)
      if (!closing || closing < 1 || closing > 31) next.closingDay = 'Dia entre 1 e 31.'
      if (!due || due < 1 || due > 31) next.dueDay = 'Dia entre 1 e 31.'
      if (!limitValue || limitValue <= 0) next.limitValue = 'Limite deve ser maior que zero.'
      if (!theme) next.theme = 'Selecione um tema.'
      if (lastDigits && lastDigits.length !== 4) next.lastDigits = 'Use exatamente 4 dígitos.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      if (!isCard && accountId) {
        await updateBankAccount(accountId, {
          name: name.trim(),
          holderId,
          balance: balance,
          accountType: account?.accountType,
        })
        setToast('Conta atualizada com sucesso!')
      } else if (isCard && cardId) {
        await updateCreditCard(cardId, {
          name: name.trim(),
          holderId,
          limit: limitValue,
          closingDay: Number(closingDay),
          dueDay: Number(dueDay),
          theme: theme as 'black' | 'lime' | 'white',
          lastDigits: lastDigits || undefined,
        })
        setToast('Cartão atualizado com sucesso!')
      }

      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao atualizar conta/cartão:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta/cartão. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${isCard ? 'este cartão' : 'esta conta'}? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      if (!isCard && accountId) {
        await deleteBankAccount(accountId)
        setToast('Conta excluída com sucesso!')
      } else if (isCard && cardId) {
        await deleteCreditCard(cardId)
        setToast('Cartão excluído com sucesso!')
      }

      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao excluir conta/cartão:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir conta/cartão. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (!open || (!account && !card)) return null

  return (
    <ModalWrapper
      open={open && (!!account || !!card)}
      onClose={onClose}
      className="w-full h-full sm:max-h-[90vh] bg-white flex flex-col"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
            <Icon name="edit" className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-heading-xl font-bold text-text-primary">
              {isCard ? 'Editar Cartão' : 'Editar Conta'}
            </h2>
            <p className="text-text-secondary text-sm">
              {isCard ? 'Atualize as informações do cartão de crédito.' : 'Atualize as informações da conta bancária.'}
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.name ? 'border-red-500' : 'border-border'
                }`}
                placeholder={isCard ? 'Nome do cartão' : 'Nome da conta'}
              />
              {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Titular</label>
              <select
                value={holderId}
                onChange={(e) => setHolderId(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.holderId ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Selecione o titular</option>
                {familyMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
              {errors.holderId ? <p className="text-sm text-red-600">{errors.holderId}</p> : null}
            </div>

            {!isCard ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Saldo</label>
                <CurrencyInput
                  value={balance}
                  onChange={(value) => setBalance(value)}
                  placeholder="0,00"
                  error={!!errors.balance}
                />
                {errors.balance ? <p className="text-sm text-red-600">{errors.balance}</p> : null}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text-primary">Dia de Fechamento</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={closingDay}
                      onChange={(e) => setClosingDay(e.target.value)}
                      className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                        errors.closingDay ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    {errors.closingDay ? <p className="text-sm text-red-600">{errors.closingDay}</p> : null}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text-primary">Dia de Vencimento</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                      className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                        errors.dueDay ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    {errors.dueDay ? <p className="text-sm text-red-600">{errors.dueDay}</p> : null}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Limite Total</label>
                  <CurrencyInput
                    value={limitValue}
                    onChange={(value) => setLimitValue(value)}
                    placeholder="0,00"
                    error={!!errors.limitValue}
                  />
                  {errors.limitValue ? <p className="text-sm text-red-600">{errors.limitValue}</p> : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Últimos 4 dígitos (opcional)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={lastDigits}
                    onChange={(e) => setLastDigits(e.target.value.replace(/\D/g, ''))}
                    className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.lastDigits ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="1234"
                  />
                  {errors.lastDigits ? <p className="text-sm text-red-600">{errors.lastDigits}</p> : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Tema Visual</label>
                  <div className="flex gap-3">
                    {(['black', 'lime', 'white'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`h-12 flex-1 rounded-xl border-2 transition ${
                          theme === t
                            ? 'border-black bg-black text-white'
                            : 'border-border bg-white text-text-primary hover:bg-gray-50'
                        }`}
                      >
                        {t === 'black' ? 'Preto' : t === 'lime' ? 'Verde Limão' : 'Branco'}
                      </button>
                    ))}
                  </div>
                  {errors.theme ? <p className="text-sm text-red-600">{errors.theme}</p> : null}
                </div>
              </>
            )}
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

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </ModalWrapper>
  )
}
