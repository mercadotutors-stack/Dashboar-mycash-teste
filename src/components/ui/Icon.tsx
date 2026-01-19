import {
  HomeIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartPieIcon,
  ListBulletIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  WalletIcon,
  TrashIcon,
  PencilIcon,
  UserPlusIcon,
  LockClosedIcon,
  KeyIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType, SVGProps } from 'react'

interface IconProps {
  name: string
  className?: string
}

/**
 * Componente de ícone usando Heroicons Outline (mais moderno)
 */
export function Icon({ name, className = '' }: IconProps) {
  const IconComponent = iconMap[name] as ComponentType<SVGProps<SVGSVGElement>> | undefined

  if (!IconComponent) {
    console.warn(`Ícone "${name}" não encontrado. Usando fallback.`)
    return <span className={`inline-flex items-center justify-center ${className}`} aria-hidden="true" />
  }

  return <IconComponent className={`inline-flex items-center justify-center ${className}`} aria-hidden="true" />
}

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  // Navegação
  home: HomeIcon,
  'credit-card': CreditCardIcon,
  credit_card: CreditCardIcon,
  account_balance: BuildingLibraryIcon,
  transactions: ChartBarIcon,
  user: UserIcon,
  person: UserIcon,

  // Ações
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  menu: Bars3Icon,
  close: XMarkIcon,
  logout: ArrowRightOnRectangleIcon,
  search: MagnifyingGlassIcon,
  tune: FunnelIcon,
  add: PlusIcon,
  calendar: CalendarIcon,
  check: CheckCircleIcon,
  arrowUp: ArrowUpIcon,
  arrowDown: ArrowDownIcon,
  chart: ChartPieIcon,
  list: ListBulletIcon,
  'north-east': ArrowTopRightOnSquareIcon,
  'south-west': ArrowTrendingDownIcon,
  repeat: ArrowPathIcon,
  wallet: WalletIcon,
  delete: TrashIcon,
  edit: PencilIcon,
  person_add: UserPlusIcon,
  lock_reset: KeyIcon,
  lock: LockClosedIcon,

  // Compatibilidade com Material Symbols
  attach_money: CurrencyDollarIcon,
  south_west: ArrowTrendingDownIcon,
  north_east: ArrowTopRightOnSquareIcon,
}
