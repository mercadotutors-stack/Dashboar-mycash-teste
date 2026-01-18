import { DashboardHeader } from '../components/dashboard/DashboardHeader'

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-bg-primary p-page">
      <div className="flex flex-col gap-6">
        <DashboardHeader />
        <div className="text-text-secondary text-body">
          Conteúdo do dashboard será implementado nos próximos prompts.
        </div>
      </div>
    </div>
  )
}
