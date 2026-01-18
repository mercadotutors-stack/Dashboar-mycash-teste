import { Icon } from '../ui/Icon'

export function UpcomingExpensesWidget() {
  return (
    <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon name="list" className="w-5 h-5 text-text-primary" />
          <h2 className="text-heading-md font-semibold text-text-primary">Próximas despesas</h2>
        </div>
        <Icon name="add" className="w-5 h-5 text-text-secondary" aria-hidden />
      </div>
      <p className="text-text-secondary text-sm">
        Esta seção será implementada nos próximos prompts conforme o layout do Figma.
      </p>
    </section>
  )
}
