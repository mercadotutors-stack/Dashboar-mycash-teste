import { useState } from 'react'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { ExpensesByCategoryCarousel } from '../components/dashboard/ExpensesByCategoryCarousel'
import { FinancialFlowChart } from '../components/dashboard/FinancialFlowChart'
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
    <div className="min-h-screen w-full bg-bg-primary px-0 lg:px-8 py-6">
      <div className="flex flex-col gap-8">
        <DashboardHeader
          onAddMember={() => setShowAddMember(true)}
          onNewTransaction={() => openNewTransaction(undefined, undefined)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-8">
          <div className="flex flex-col gap-8">
            <SummaryCards />
            <ExpensesByCategoryCarousel />
            <FinancialFlowChart />
          </div>
          <div className="flex flex-col gap-8">
            <CreditCardsWidget />
            <UpcomingExpensesWidget onAddExpense={() => openNewTransaction(undefined, 'expense')} />
          </div>
        </div>

        <TransactionsTable />
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
