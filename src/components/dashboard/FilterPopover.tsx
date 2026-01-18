import { Icon } from '../ui/Icon'

type TransactionFilter = 'all' | 'income' | 'expense'

interface FilterPopoverProps {
  value: TransactionFilter
  onSelect: (value: TransactionFilter) => void
  onClose: () => void
}

interface FilterModalProps extends FilterPopoverProps {
  title?: string
}

const options: Array<{ label: string; value: TransactionFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Receitas', value: 'income' },
  { label: 'Despesas', value: 'expense' },
]

function FilterOptions({ value, onSelect }: { value: TransactionFilter; onSelect: (v: TransactionFilter) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-text-primary">Tipo de Transação</span>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isActive = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`
                flex items-center justify-between
                px-3 py-2 rounded-full border
                transition-colors duration-150
                ${isActive ? 'bg-text-primary text-bg-primary border-text-primary' : 'bg-bg-primary/80 text-text-primary border-border hover:bg-bg-secondary'}
              `}
            >
              <span className="text-sm font-medium">{option.label}</span>
              {isActive && <Icon name="check" className="w-5 h-5 text-sidebar-active" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FilterPopover({ value, onSelect, onClose }: FilterPopoverProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="
          absolute z-50 mt-3 w-64
          rounded-2xl border border-white/60 bg-white/80
          backdrop-blur-md shadow-xl
          p-4
        "
      >
        <FilterOptions value={value} onSelect={onSelect} />
      </div>
    </>
  )
}

export function FilterModal({ value, onSelect, onClose, title }: FilterModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-bg-primary rounded-t-3xl border border-border p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text-primary">{title ?? 'Filtros'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-primary"
            aria-label="Fechar filtros"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <FilterOptions value={value} onSelect={onSelect} />
      </div>
    </div>
  )
}
