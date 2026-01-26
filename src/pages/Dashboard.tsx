import { useState } from 'react'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { ExpensesByCategoryCarousel } from '../components/dashboard/ExpensesByCategoryCarousel'
import { FinancialFlowChart } from '../components/dashboard/FinancialFlowChart'
import { InvestmentChart } from '../components/dashboard/InvestmentChart'
import { CreditCardsWidget } from '../components/dashboard/CreditCardsWidget'
import { UpcomingExpensesWidget } from '../components/dashboard/UpcomingExpensesWidget'
import { TransactionsTable } from '../components/dashboard/TransactionsTable'
import { NewTransactionModal } from '../components/modals/NewTransactionModal'
import { AddMemberModal } from '../components/modals/AddMemberModal'
import { AddAccountCardModal } from '../components/modals/AddAccountCardModal'

export default function Dashboard() {
  const [showNewTx, setShowNewTx] = useState(false)
  const [presetAccount, setPresetAccount] = useState<string | undefined>(undefined)
  const [presetType, setPresetType] = useState<'income' | 'expense' | undefined>(undefined)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)

  const openNewTransaction = (accountId?: string, type?: 'income' | 'expense') => {
    setPresetAccount(accountId)
    setPresetType(type)
    setShowNewTx(true)
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in">
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <DashboardHeader
            onAddMember={() => setShowAddMember(true)}
            onNewTransaction={() => openNewTransaction(undefined, undefined)}
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <SummaryCards />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <ExpensesByCategoryCarousel />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '180ms' }}>
          <CreditCardsWidget />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '220ms' }}>
          <UpcomingExpensesWidget onAddExpense={() => openNewTransaction(undefined, 'expense')} />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '260ms' }}>
          <FinancialFlowChart />
        </div>

        {/* Gráfico de investimentos */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <InvestmentChart />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '340ms' }}>
          <TransactionsTable />
        </div>
      </div>

      <NewTransactionModal
        open={showNewTx}
        onClose={() => setShowNewTx(false)}
        presetAccountId={presetAccount}
        presetType={presetType}
      />
      <AddMemberModal open={showAddMember} onClose={() => setShowAddMember(false)} />
      <AddAccountCardModal open={showAddAccount} onClose={() => setShowAddAccount(false)} />
    </div>
  )
}
