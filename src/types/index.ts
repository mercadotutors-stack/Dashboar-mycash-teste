/**
 * Tipo de transação financeira
 */
export type TransactionType = 'income' | 'expense';

/**
 * Status de pagamento de uma transação
 */
export type PaymentStatus = 'pending' | 'completed' | 'cancelled';

/**
 * Tipo de conta financeira
 */
export type AccountType = 'account' | 'creditCard';

/**
 * Tema visual de um cartão de crédito
 */
export type CardTheme = 'black' | 'lime' | 'white';

/**
 * Entidade: Transaction
 * Representa uma transação financeira (receita ou despesa)
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Valor desta parcela (para parcelado) ou total (à vista)
  description: string;
  category: string;
  date: Date;
  workspaceId?: string;
  accountId: string; // ID da conta bancária ou cartão de crédito
  memberId: string | null; // ID do membro da família responsável (null = geral)
  installments?: number; // Número de parcelas (1 = à vista) - legado
  currentInstallment?: number; // Parcela atual (1/3, 2/3, etc) - legado
  totalInstallments?: number; // Total de parcelas da compra
  paidInstallments?: number; // Quantidade de parcelas já pagas
  purchaseDate?: Date; // Data da compra original
  firstInstallmentDate?: Date; // Data da 1ª parcela
  parentTransactionId?: string | null; // Agrupador das parcelas
  status: PaymentStatus;
  isRecurring: boolean; // Indica se é despesa recorrente
  isPaid: boolean; // Indica se foi paga (para despesas)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade: Goal
 * Representa um objetivo financeiro
 */
export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  memberId: string | null; // ID do membro responsável (null = objetivo familiar)
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade: CreditCard
 * Representa um cartão de crédito
 */
export interface CreditCard {
  id: string;
  name: string;
  workspaceId?: string;
  holderId: string; // ID do membro titular do cartão
  limit: number; // Limite total do cartão
  currentBill: number; // Fatura atual (gastos do mês)
  availableLimit?: number; // Limite disponível (derivado)
  closingDay: number; // Dia de fechamento da fatura (1-31)
  dueDay: number; // Dia de vencimento da fatura (1-31)
  theme: CardTheme; // Tema visual do cartão
  lastDigits?: string; // Últimos 4 dígitos do cartão
  bank?: string; // Nome do banco emissor
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade: BankAccount
 * Representa uma conta bancária
 */
export interface BankAccount {
  id: string;
  name: string;
  workspaceId?: string;
  holderId: string; // ID do membro titular da conta
  balance: number; // Saldo atual da conta
  bank?: string; // Nome do banco
  accountType?: 'checking' | 'savings' | 'investment'; // Tipo de conta
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidade: FamilyMember
 * Representa um membro da família
 */
export interface FamilyMember {
  id: string;
  name: string;
  role: string; // Ex: "Pai", "Mãe", "Filho", "Avô", etc
  workspaceId?: string;
  email?: string; // Email do membro (opcional)
  avatarUrl?: string; // URL do avatar (ou padrão se não fornecido)
  monthlyIncome?: number; // Renda mensal estimada (opcional)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo auxiliar: Account (união de BankAccount e CreditCard)
 */
export type Account = BankAccount | CreditCard;

/**
 * Tipo auxiliar: DateRange para filtros
 */
export interface DateRange {
  startDate: Date;
  endDate: Date | null;
}

/**
 * Tipo auxiliar: Filtros globais
 */
export interface GlobalFilters {
  selectedMember: string | null;
  dateRange: DateRange | null;
  transactionType: 'all' | 'income' | 'expense';
  searchText: string;
}
