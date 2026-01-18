import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { ExpensesByCategoryCarousel } from '../components/dashboard/ExpensesByCategoryCarousel'

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-bg-primary px-0 lg:px-8 py-6">
      <div className="flex flex-col gap-6">
        <DashboardHeader />
        <SummaryCards />
        <ExpensesByCategoryCarousel />
        <div className="text-text-secondary text-body">Conteúdo do dashboard será implementado nos próximos prompts.</div>
      </div>
    </div>
  )
}
