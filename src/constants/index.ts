/**
 * Constantes do sistema mycash+
 */

/**
 * Rotas principais da aplicação
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  WORKSPACES: '/workspaces',
  DASHBOARD: '/',
  CARDS: '/cards',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  PROFILE: '/profile',
  MEMBER_PROFILE: '/profile/:memberId',
} as const;

/**
 * Itens de navegação da sidebar
 */
export interface NavigationItem {
  label: string;
  path: string;
  icon: string; // Nome do ícone (será substituído por componente de ícones)
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'home',
  },
  {
    label: 'Cartões',
    path: ROUTES.CARDS,
    icon: 'credit-card',
  },
  {
    label: 'Contas',
    path: ROUTES.ACCOUNTS,
    icon: 'account_balance',
  },
  {
    label: 'Transações',
    path: ROUTES.TRANSACTIONS,
    icon: 'transactions',
  },
  {
    label: 'Perfil',
    path: ROUTES.PROFILE,
    icon: 'user',
  },
];

/**
 * Categorias padrão de receitas
 */
export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Renda Extra',
  'Aluguel Recebido',
  'Outros',
] as const;

/**
 * Categorias padrão de despesas
 */
export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Aluguel',
  'Mercado',
  'Academia',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Manutenção',
  'Contas',
  'Outros',
] as const;

/**
 * Breakpoints do sistema (em pixels)
 */
export const BREAKPOINTS = {
  MOBILE_MAX: 640,
  TABLET_MIN: 641,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
  DESKTOP_MAX: 1919,
  WIDE_MIN: 1920,
} as const;

/**
 * Valores de espaçamento padrão (em pixels)
 */
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  '2XL': 48,
} as const;

/**
 * Durações de animação (em milissegundos)
 */
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  COUNTING: 800,
} as const;
