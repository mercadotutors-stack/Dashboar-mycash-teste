import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { Icon } from '../components/ui/Icon'
import { AddAccountCardModal } from '../components/modals/AddAccountCardModal'
import { EditAccountCardModal } from '../components/modals/EditAccountCardModal'
import { NewTransactionModal } from '../components/modals/NewTransactionModal'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants'
import { formatCurrency } from '../utils'

export default function Accounts() {
  const { bankAccounts, familyMembers, deleteBankAccount } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editAccountId, setEditAccountId] = useState<string | null>(null)
  const [showNewTx, setShowNewTx] = useState(false)
  const [presetAccount, setPresetAccount] = useState<string | undefined>(undefined)
  const [mode, setMode] = useState<'all' | 'checking' | 'savings' | 'investment'>('all')
  const [toast, setToast] = useState<string | null>(null)

  const filteredAccounts = useMemo(() => {
    if (mode === 'all') return bankAccounts
    return bankAccounts.filter((acc) => acc.accountType === mode)
  }, [bankAccounts, mode])

  const totalBalance = useMemo(() => {
    return filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  }, [filteredAccounts])

  const accountTypeLabel = (type?: string) => {
    if (type === 'savings') return 'Poupança'
    if (type === 'investment') return 'Investimento'
    return 'Corrente'
  }

  const resolveHolderName = (holderId: string) => {
    const member = familyMembers.find((m) => m.id === holderId)
    return member?.name || 'Não informado'
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 animate-fade-in">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-slide-up">
        <div className="flex flex-col gap-1">
          <h1 className="text-heading-xl font-bold text-text-primary">Contas Bancárias</h1>
          <p className="text-text-secondary text-body hidden sm:block">
            Gerencie suas contas correntes, poupanças e investimentos
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={ROUTES.CARDS}
            className="h-11 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100 font-semibold flex items-center gap-2 text-sm sm:text-base"
          >
            <Icon name="credit-card" className="w-5 h-5" />
            <span className="hidden sm:inline">Ver Cartões</span>
            <span className="sm:hidden">Cartões</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="h-11 px-4 rounded-full bg-black text-white font-semibold flex items-center gap-2 text-sm sm:text-base"
          >
            <Icon name="add" className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Conta</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </div>
      </header>

      {/* Filtros e Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1 animate-scale-up" style={{ animationDelay: '50ms' }}>
          <span className="text-sm text-text-secondary">Saldo Total</span>
          <span className="text-heading-lg font-bold text-text-primary">{formatCurrency(totalBalance)}</span>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1 animate-scale-up" style={{ animationDelay: '100ms' }}>
          <span className="text-sm text-text-secondary">Total de Contas</span>
          <span className="text-heading-lg font-bold text-text-primary">{filteredAccounts.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1 animate-scale-up" style={{ animationDelay: '150ms' }}>
          <span className="text-sm text-text-secondary">Contas Correntes</span>
          <span className="text-heading-lg font-bold text-text-primary">
            {bankAccounts.filter((a) => a.accountType === 'checking').length}
          </span>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 flex flex-col gap-1 animate-scale-up" style={{ animationDelay: '200ms' }}>
          <span className="text-sm text-text-secondary">Poupanças</span>
          <span className="text-heading-lg font-bold text-text-primary">
            {bankAccounts.filter((a) => a.accountType === 'savings').length}
          </span>
        </div>
      </div>

      {/* Filtros de Tipo */}
      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-2 -mx-4 sm:mx-0 px-4 sm:px-0">
        <button
          onClick={() => setMode('all')}
          className={`h-10 px-4 rounded-full border text-sm font-semibold ${
            mode === 'all'
              ? 'bg-black text-white border-black'
              : 'bg-white text-text-primary border-border hover:bg-gray-50'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setMode('checking')}
          className={`h-10 px-4 rounded-full border text-sm font-semibold ${
            mode === 'checking'
              ? 'bg-black text-white border-black'
              : 'bg-white text-text-primary border-border hover:bg-gray-50'
          }`}
        >
          Corrente
        </button>
        <button
          onClick={() => setMode('savings')}
          className={`h-10 px-4 rounded-full border text-sm font-semibold ${
            mode === 'savings'
              ? 'bg-black text-white border-black'
              : 'bg-white text-text-primary border-border hover:bg-gray-50'
          }`}
        >
          Poupança
        </button>
        <button
          onClick={() => setMode('investment')}
          className={`h-10 px-4 rounded-full border text-sm font-semibold ${
            mode === 'investment'
              ? 'bg-black text-white border-black'
              : 'bg-white text-text-primary border-border hover:bg-gray-50'
          }`}
        >
          Investimento
        </button>
      </div>

      {/* Lista de Contas */}
      {filteredAccounts.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center flex flex-col items-center gap-3">
          <Icon name="account_balance" className="w-10 h-10 text-text-secondary" />
          <p className="text-heading-md font-semibold text-text-primary">
            {mode === 'all' ? 'Nenhuma conta cadastrada' : `Nenhuma conta ${accountTypeLabel(mode)} cadastrada`}
          </p>
          <p className="text-text-secondary text-body">Cadastre sua primeira conta para começar.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="h-11 px-4 rounded-full bg-black text-white font-semibold"
          >
            Cadastrar Primeira Conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAccounts.map((account, idx) => {
            const isPositive = account.balance >= 0
            return (
              <div
                key={account.id}
                className="rounded-2xl border-2 border-border bg-white p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col gap-4 animate-scale-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon name="account_balance" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-heading-md font-semibold text-text-primary">{account.name}</h3>
                      {account.bank ? <p className="text-sm text-text-secondary">{account.bank}</p> : null}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {accountTypeLabel(account.accountType)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Saldo</span>
                    <span
                      className={`text-heading-lg font-bold ${isPositive ? 'text-text-primary' : 'text-red-600'}`}
                    >
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Titular</span>
                    <span className="text-text-primary font-medium">{resolveHolderName(account.holderId)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPresetAccount(account.id)
                      setShowNewTx(true)
                    }}
                    className="flex-1 min-w-[140px] h-10 px-4 rounded-full bg-black text-white text-sm font-semibold hover:opacity-90"
                  >
                    Nova Transação
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditAccountId(account.id)
                      setShowEdit(true)
                    }}
                    className="h-10 px-4 rounded-full border border-border text-text-primary text-sm hover:bg-gray-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (!confirm(`Tem certeza que deseja excluir a conta "${account.name}"? Esta ação não pode ser desfeita.`)) {
                        return
                      }
                      try {
                        await deleteBankAccount(account.id)
                        setToast('Conta excluída com sucesso!')
                        setTimeout(() => setToast(null), 2000)
                      } catch (err) {
                        console.error('Erro ao excluir conta:', err)
                        setToast('Erro ao excluir conta')
                        setTimeout(() => setToast(null), 3000)
                      }
                    }}
                    className="h-10 w-10 rounded-full border border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center flex-shrink-0"
                    aria-label="Excluir conta"
                  >
                    <Icon name="delete" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddAccountCardModal open={showAdd} onClose={() => setShowAdd(false)} />
      <EditAccountCardModal
        open={showEdit}
        onClose={() => {
          setShowEdit(false)
          setEditAccountId(null)
        }}
        accountId={editAccountId ?? undefined}
      />
      <NewTransactionModal
        open={showNewTx}
        onClose={() => {
          setShowNewTx(false)
          setPresetAccount(undefined)
        }}
        presetAccountId={presetAccount}
      />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
