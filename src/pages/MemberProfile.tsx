import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { Icon } from '../components/ui/Icon'
import { CurrencyDollarIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import { EditMemberModal } from '../components/modals/EditMemberModal'
import { ExpensesByCategoryCarousel } from '../components/dashboard/ExpensesByCategoryCarousel'
import { FinancialFlowChart } from '../components/dashboard/FinancialFlowChart'
import { TransactionsTable } from '../components/dashboard/TransactionsTable'
import { ROUTES } from '../constants'
import { formatCurrency } from '../utils'

export default function MemberProfile() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const { familyMembers, transactions, creditCards, bankAccounts, setSelectedMember } = useFinance()
  const [showEdit, setShowEdit] = useState(false)

  // Configura o filtro de membro quando a página carrega
  useEffect(() => {
    if (memberId) {
      setSelectedMember(memberId)
    }
    return () => {
      // Limpa o filtro quando sair da página
      setSelectedMember(null)
    }
  }, [memberId, setSelectedMember])

  const member = useMemo(() => {
    return familyMembers.find((m) => m.id === memberId) || null
  }, [familyMembers, memberId])

  // Filtra transações do membro
  const memberTransactions = useMemo(() => {
    if (!memberId) return []
    const accountOwnerMap: Record<string, string> = {}
    bankAccounts.forEach((acc) => {
      accountOwnerMap[acc.id] = acc.holderId
    })
    creditCards.forEach((card) => {
      accountOwnerMap[card.id] = card.holderId
    })

    return transactions.filter((tx) => {
      const owner = accountOwnerMap[tx.accountId]
      return tx.memberId === memberId || owner === memberId
    })
  }, [transactions, memberId, bankAccounts, creditCards])

  // Calcula valores do membro
  const memberBalance = useMemo(() => {
    if (!memberId) return 0
    let balance = 0
    bankAccounts
      .filter((acc) => acc.holderId === memberId)
      .forEach((acc) => {
        balance += acc.balance
      })
    creditCards
      .filter((card) => card.holderId === memberId)
      .forEach((card) => {
        balance += card.limit - card.currentBill
      })
    return balance
  }, [memberId, bankAccounts, creditCards])

  const memberIncome = useMemo(() => {
    return memberTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [memberTransactions])

  const memberExpenses = useMemo(() => {
    return memberTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [memberTransactions])

  const animatedBalance = useAnimatedNumber(memberBalance)
  const animatedIncome = useAnimatedNumber(memberIncome)
  const animatedExpenses = useAnimatedNumber(memberExpenses)

  if (!member) {
    return (
      <div className="min-h-screen w-full bg-bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-heading-xl font-bold text-text-primary mb-2">Membro não encontrado</h1>
          <p className="text-text-secondary mb-4">O membro que você está procurando não existe.</p>
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="h-11 px-6 rounded-full bg-black text-white font-semibold"
          >
            Voltar para Perfil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Header do Perfil */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(ROUTES.PROFILE)}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-gray-100"
            >
              <Icon name="arrow_back" className="w-5 h-5 text-text-primary" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 border border-border flex items-center justify-center text-heading-xl font-bold overflow-hidden">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-heading-xl font-bold text-text-primary">{member.name}</h1>
                <p className="text-body text-text-secondary">{member.role}</p>
                {member.email && (
                  <p className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                    <Icon name="email" className="w-4 h-4" />
                    {member.email}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="h-11 px-6 rounded-full border border-border text-text-primary hover:bg-gray-100 flex items-center gap-2"
          >
            <Icon name="edit" className="w-5 h-5" />
            Editar Perfil
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col gap-3 sm:gap-4 items-start">
            <CurrencyDollarIcon className="w-10 h-10 text-text-primary" />
            <div className="flex flex-col gap-2">
              <div className="text-[20px] leading-tight text-text-primary font-medium">Saldo Total</div>
              <div className="text-[24px] leading-[48px] font-bold" style={{ color: 'var(--color-brand-picpay)' }}>
                {formatCurrency(animatedBalance)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col gap-3 sm:gap-4 items-start">
            <ArrowTrendingDownIcon className="w-8 h-8 text-[#00B171]" />
            <div className="flex flex-col gap-2">
              <div className="text-[20px] leading-tight text-text-primary font-semibold">Receitas</div>
              <div className="text-[24px] leading-[48px] font-extrabold text-text-primary">
                {formatCurrency(animatedIncome)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 sm:p-6 shadow-sm h-full flex flex-col gap-3 sm:gap-4 items-start">
            <ArrowTrendingUpIcon className="w-8 h-8 text-[#F04444]" />
            <div className="flex flex-col gap-2">
              <div className="text-[20px] leading-tight text-text-secondary font-semibold">Despesas</div>
              <div className="text-[24px] leading-[48px] font-extrabold text-text-primary">
                {formatCurrency(animatedExpenses)}
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos e Tabela */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-6 sm:gap-8">
          <div className="flex flex-col gap-6 sm:gap-8">
            <ExpensesByCategoryCarousel />
            <FinancialFlowChart />
          </div>
        </div>

        {/* Tabela de Transações do Membro */}
        <div className="flex flex-col gap-4">
          <h2 className="text-heading-lg font-semibold text-text-primary">Transações</h2>
          <TransactionsTable />
        </div>
      </div>

      <EditMemberModal
        open={showEdit}
        member={member}
        onClose={() => {
          setShowEdit(false)
        }}
      />
    </div>
  )
}
