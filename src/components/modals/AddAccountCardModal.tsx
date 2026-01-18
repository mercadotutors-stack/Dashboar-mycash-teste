import { useEffect, useState } from 'react'
import { useFinance } from '../../context/FinanceContext'
import { Icon } from '../ui/Icon'

type Props = {
  open: boolean
  onClose: () => void
}

type Mode = 'bank' | 'card'

export function AddAccountCardModal({ open, onClose }: Props) {
  const { addBankAccount, addCreditCard, familyMembers } = useFinance()
  const [mode, setMode] = useState<Mode>('bank')
  const [name, setName] = useState('')
  const [holderId, setHolderId] = useState('')
  const [balance, setBalance] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [limitValue, setLimitValue] = useState('')
  const [lastDigits, setLastDigits] = useState('')
  const [theme, setTheme] = useState<'black' | 'lime' | 'white' | ''>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode('bank')
      setName('')
      setHolderId('')
      setBalance('')
      setClosingDay('')
      setDueDay('')
      setLimitValue('')
      setLastDigits('')
      setTheme('')
      setErrors({})
    }
  }, [open])

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 3) next.name = 'Informe um nome com pelo menos 3 caracteres.'
    if (!holderId) next.holderId = 'Selecione o titular.'
    if (mode === 'bank') {
      if (!balance || Number(balance) === 0) next.balance = 'Informe o saldo inicial.'
    } else {
      const closing = Number(closingDay)
      const due = Number(dueDay)
      if (!closing || closing < 1 || closing > 31) next.closingDay = 'Dia entre 1 e 31.'
      if (!due || due < 1 || due > 31) next.dueDay = 'Dia entre 1 e 31.'
      if (!limitValue || Number(limitValue) <= 0) next.limitValue = 'Limite deve ser maior que zero.'
      if (!theme) next.theme = 'Selecione um tema.'
      if (lastDigits && lastDigits.length !== 4) next.lastDigits = 'Use exatamente 4 dígitos.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      if (mode === 'bank') {
        await addBankAccount({
          name: name.trim(),
          holderId,
          balance: Number(balance),
          bank: undefined,
          accountType: 'checking',
        })
        setToast('Conta adicionada com sucesso!')
      } else {
        await addCreditCard({
          name: name.trim(),
          holderId,
          limit: Number(limitValue),
          currentBill: 0,
          closingDay: Number(closingDay),
          dueDay: Number(dueDay),
          theme: theme as 'black' | 'lime' | 'white',
          lastDigits: lastDigits || undefined,
          bank: undefined,
        })
        setToast('Cartão adicionado com sucesso!')
      }

      setTimeout(() => setToast(null), 2000)
      onClose()
    } catch (err) {
      console.error('Erro ao adicionar conta/cartão:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar conta/cartão. Verifique o console.'
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-heading-lg font-semibold text-text-primary">Adicionar Conta/Cartão</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-gray-100"
            aria-label="Fechar"
          >
            <Icon name="close" className="w-5 h-5 text-text-primary" />
          </button>
        </header>

        <div className="px-6 pt-4 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'bank', label: 'Conta Bancária' },
              { key: 'card', label: 'Cartão de Crédito' },
            ].map((item) => {
              const selected = mode === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMode(item.key as Mode)}
                  className={`h-12 rounded-full border text-sm font-semibold transition ${
                    selected ? 'bg-black text-white border-black' : 'bg-white border-border text-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">
              {mode === 'bank' ? 'Nome da Conta' : 'Nome do Cartão'}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                errors.name ? 'border-red-500' : 'border-border'
              }`}
              placeholder={mode === 'bank' ? 'Ex: Nubank Conta' : 'Ex: Nubank Mastercard'}
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
              <option value="">Selecione</option>
              {familyMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.holderId ? <p className="text-sm text-red-600">{errors.holderId}</p> : null}
          </div>

          {mode === 'bank' ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Saldo Inicial</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.balance ? 'border-red-500' : 'border-border'
                }`}
                placeholder="R$ 0,00"
              />
              {errors.balance ? <p className="text-sm text-red-600">{errors.balance}</p> : null}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Dia de Fechamento</label>
                  <input
                    type="number"
                    value={closingDay}
                    onChange={(e) => setClosingDay(e.target.value)}
                    className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.closingDay ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="1 a 31"
                  />
                  {errors.closingDay ? <p className="text-sm text-red-600">{errors.closingDay}</p> : null}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Dia de Vencimento</label>
                  <input
                    type="number"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.dueDay ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="1 a 31"
                  />
                  {errors.dueDay ? <p className="text-sm text-red-600">{errors.dueDay}</p> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Limite Total</label>
                  <input
                    type="number"
                    value={limitValue}
                    onChange={(e) => setLimitValue(e.target.value)}
                    className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.limitValue ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="R$ 0,00"
                  />
                  {errors.limitValue ? <p className="text-sm text-red-600">{errors.limitValue}</p> : null}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text-primary">Últimos 4 Dígitos (opcional)</label>
                  <input
                    type="number"
                    value={lastDigits}
                    onChange={(e) => setLastDigits(e.target.value)}
                    className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                      errors.lastDigits ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="1234"
                  />
                  {errors.lastDigits ? <p className="text-sm text-red-600">{errors.lastDigits}</p> : null}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Tema Visual</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'black', label: 'Black', className: 'bg-black text-white' },
                    { value: 'lime', label: 'Lime', className: 'bg-[#C4E703] text-black' },
                    { value: 'white', label: 'White', className: 'bg-white text-text-primary border border-border' },
                  ].map((opt) => {
                    const selected = theme === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTheme(opt.value as 'black' | 'lime' | 'white')}
                        className={`h-12 rounded-xl font-semibold ${opt.className} ${
                          selected ? 'ring-2 ring-blue-400' : ''
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                {errors.theme ? <p className="text-sm text-red-600">{errors.theme}</p> : null}
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-11 px-6 rounded-full border border-border text-text-primary hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="h-11 px-6 rounded-full bg-black text-white font-semibold hover:opacity-90"
          >
            Adicionar
          </button>
        </footer>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
