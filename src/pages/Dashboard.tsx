import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { ExpensesByCategoryCarousel } from '../components/dashboard/ExpensesByCategoryCarousel'
import { FinancialFlowChart } from '../components/dashboard/FinancialFlowChart'
import { CreditCardsWidget } from '../components/dashboard/CreditCardsWidget'
import { UpcomingExpensesWidget } from '../components/dashboard/UpcomingExpensesWidget'

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-bg-primary px-0 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        <DashboardHeader />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)] gap-8">
          <div className="flex flex-col gap-6">
            <SummaryCards />
            <ExpensesByCategoryCarousel />
            <FinancialFlowChart />
          </div>
          <div className="flex flex-col gap-6">
            <CreditCardsWidget />
            <UpcomingExpensesWidget />
          </div>
        </div>

        <div className="text-text-secondary text-body">Conteúdo do dashboard será implementado nos próximos prompts.</div>
      </div>
    </div>
  )
}
