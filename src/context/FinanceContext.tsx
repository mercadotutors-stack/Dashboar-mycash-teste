import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react'
import type {
  Transaction,
  CreditCard,
  BankAccount,
  FamilyMember,
  GlobalFilters,
  DateRange,
} from '../types'
import { supabase } from '../lib/supabaseClient'

type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
type CreditCardInput = Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>
type BankAccountInput = Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>
type FamilyMemberInput = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>

type ExpensesByCategory = Array<{ category: string; total: number }>
type CategoryPercentage = Array<{ category: string; percentage: number }>
type Category = { id: string; name: string; type: 'income' | 'expense' }

interface FinanceContextValue {
  transactions: Transaction[]
  creditCards: CreditCard[]
  bankAccounts: BankAccount[]
  familyMembers: FamilyMember[]
  categories: Category[]
  filters: GlobalFilters

  setSelectedMember: (memberId: string | null) => void
  setDateRange: (range: DateRange | null) => void
  setTransactionType: (type: 'all' | 'income' | 'expense') => void
  setSearchText: (text: string) => void

  addTransaction: (input: TransactionInput) => Promise<string>
  addCreditCard: (input: CreditCardInput) => Promise<string>
  addBankAccount: (input: BankAccountInput) => Promise<string>
  addFamilyMember: (input: FamilyMemberInput) => Promise<string>
  addCategory: (input: { name: string; type: 'income' | 'expense' }) => Promise<string>

  getFilteredTransactions: () => Transaction[]
  calculateTotalBalance: () => number
  calculateIncomeForPeriod: () => number
  calculateExpensesForPeriod: () => number
  calculateExpensesByCategory: () => ExpensesByCategory
  calculateCategoryPercentage: () => CategoryPercentage
  calculateSavingsRate: () => number
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

const toDate = (value: string | Date | null | undefined) => (value ? new Date(value) : new Date())
const mapStatus = (dbStatus?: string): 'pending' | 'completed' | 'cancelled' => {
  if (dbStatus === 'PENDING') return 'pending'
  if (dbStatus === 'COMPLETED') return 'completed'
  return 'completed'
}
const mapType = (dbType?: string): 'income' | 'expense' => (dbType === 'INCOME' ? 'income' : 'expense')

const INITIAL_FILTERS: GlobalFilters = {
  selectedMember: null,
  dateRange: null,
  transactionType: 'all',
  searchText: '',
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<GlobalFilters>(INITIAL_FILTERS)

  // Garantir um usuário padrão (RLS é aberta, mas user_id é FK obrigatória)
  useEffect(() => {
    const ensureUser = async () => {
      const { data } = await supabase.from('users').select('*').limit(1)
      if (data && data.length > 0) {
        setUserId(data[0].id)
        return
      }
      const email = 'demo@mycash.local'
      const name = 'Demo User'
      const { data: inserted } = await supabase.from('users').insert({ email, name }).select('*').single()
      if (inserted) setUserId(inserted.id)
    }
    ensureUser()
  }, [])

  useEffect(() => {
    if (!userId) return
    const loadAll = async () => {
      const [fm, acc, cat, tx] = await Promise.all([
        supabase.from('family_members').select('*'),
        supabase.from('accounts').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('transactions').select('*'),
      ])

      if (fm.data) {
        setFamilyMembers(
          fm.data.map((item) => ({
            id: item.id,
            name: item.name,
            role: item.role,
            email: '',
            avatarUrl: item.avatar_url ?? undefined,
            monthlyIncome: Number(item.monthly_income ?? 0),
            createdAt: toDate(item.created_at),
            updatedAt: toDate(item.updated_at),
          })),
        )
      }

      if (acc.data) {
        const banks: BankAccount[] = []
        const cards: CreditCard[] = []
        acc.data.forEach((a) => {
          if (a.type === 'CREDIT_CARD') {
            cards.push({
              id: a.id,
              name: a.name,
              holderId: a.holder_id,
              limit: Number(a.credit_limit ?? 0),
              currentBill: Number(a.current_bill ?? 0),
              closingDay: a.closing_day ?? 1,
              dueDay: a.due_day ?? 1,
              theme: (a.theme as any) ?? 'black',
              lastDigits: a.last_digits ?? undefined,
              bank: a.bank ?? undefined,
              createdAt: toDate(a.created_at),
              updatedAt: toDate(a.updated_at),
            })
          } else {
            banks.push({
              id: a.id,
              name: a.name,
              holderId: a.holder_id,
              balance: Number(a.balance ?? 0),
              bank: a.bank ?? undefined,
              accountType: a.type === 'SAVINGS' ? 'savings' : 'checking',
              createdAt: toDate(a.created_at),
              updatedAt: toDate(a.updated_at),
            })
          }
        })
        setBankAccounts(banks)
        setCreditCards(cards)
      }

      if (cat.data) {
        setCategories(
          cat.data.map((c) => ({
            id: c.id,
            name: c.name,
            type: mapType(c.type),
          })),
        )
      }

      if (tx.data) {
        const catMap = new Map<string, string>()
        cat.data?.forEach((c) => catMap.set(c.id, c.name))
        setTransactions(
          tx.data.map((t) => ({
            id: t.id,
            type: mapType(t.type),
            amount: Number(t.amount ?? 0),
            description: t.description,
            category: t.category_id ? catMap.get(t.category_id) ?? 'Sem categoria' : 'Sem categoria',
            date: toDate(t.date),
            accountId: t.account_id ?? '',
            memberId: t.member_id ?? null,
            installments: t.total_installments ?? 1,
            currentInstallment: t.installment_number ?? 1,
            status: mapStatus(t.status),
            isRecurring: Boolean(t.is_recurring),
            isPaid: mapStatus(t.status) === 'completed',
            createdAt: toDate(t.created_at),
            updatedAt: toDate(t.updated_at),
          })),
        )
      }
    }
    loadAll()
  }, [userId])

  const setSelectedMember = useCallback((memberId: string | null) => {
    setFilters((prev) => ({ ...prev, selectedMember: memberId }))
  }, [])

  const setDateRange = useCallback((range: DateRange | null) => {
    setFilters((prev) => ({ ...prev, dateRange: range }))
  }, [])

  const setTransactionType = useCallback((type: 'all' | 'income' | 'expense') => {
    setFilters((prev) => ({ ...prev, transactionType: type }))
  }, [])

  const setSearchText = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, searchText: text }))
  }, [])

  const accountOwnerMap = useMemo(() => {
    const map: Record<string, string> = {}
    bankAccounts.forEach((acc) => {
      map[acc.id] = acc.holderId
    })
    creditCards.forEach((card) => {
      map[card.id] = card.holderId
    })
    return map
  }, [bankAccounts, creditCards])

  const filteredTransactions = useMemo(() => {
    const search = filters.searchText.trim().toLowerCase()
    const start = filters.dateRange?.startDate?.getTime()
    const end = filters.dateRange?.endDate?.getTime()

    return transactions.filter((tx) => {
      const txDate = tx.date.getTime()
      if (start && txDate < start) return false
      if (end && txDate > end) return false
      if (filters.transactionType !== 'all' && tx.type !== filters.transactionType) return false
      if (filters.selectedMember) {
        const owner = accountOwnerMap[tx.accountId]
        const matchesMember = tx.memberId === filters.selectedMember || owner === filters.selectedMember
        if (!matchesMember) return false
      }
      if (search) {
        const haystack = `${tx.description} ${tx.category}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }
      return true
    })
  }, [transactions, filters, accountOwnerMap])

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      if (!userId) throw new Error('Usuário não inicializado')
      const payload = {
        user_id: userId,
        type: input.type === 'income' ? 'INCOME' : 'EXPENSE',
        amount: input.amount,
        description: input.description,
        date: input.date.toISOString().slice(0, 10),
        category_id: null,
        account_id: input.accountId || null,
        member_id: input.memberId,
        total_installments: input.installments ?? 1,
        installment_number: input.currentInstallment ?? 1,
        is_recurring: input.isRecurring ?? false,
        status: input.status === 'pending' ? 'PENDING' : 'COMPLETED',
        notes: null,
      }
      const { data, error } = await supabase.from('transactions').insert(payload).select('*').single()
      if (error) throw error
      const categoryName = input.category ?? 'Sem categoria'
      const newTx: Transaction = {
        id: data.id,
        ...input,
        category: categoryName,
        createdAt: toDate(data.created_at),
        updatedAt: toDate(data.updated_at),
      }
      setTransactions((prev) => [...prev, newTx])
      return data.id as string
    },
    [userId],
  )

  const addFamilyMember = useCallback(
    async (input: FamilyMemberInput) => {
      if (!userId) throw new Error('Usuário não inicializado')
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: userId,
          name: input.name,
          role: input.role,
          avatar_url: input.avatarUrl ?? null,
          monthly_income: input.monthlyIncome ?? 0,
        })
        .select('*')
        .single()
      if (error) throw error
      const member: FamilyMember = {
        id: data.id,
        name: data.name,
        role: data.role,
        email: '',
        avatarUrl: data.avatar_url ?? undefined,
        monthlyIncome: Number(data.monthly_income ?? 0),
        createdAt: toDate(data.created_at),
        updatedAt: toDate(data.updated_at),
      }
      setFamilyMembers((prev) => [...prev, member])
      return data.id as string
    },
    [userId],
  )

  const addBankAccount = useCallback(
    async (input: BankAccountInput) => {
      if (!userId) throw new Error('Usuário não inicializado')
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          type: input.accountType === 'savings' ? 'SAVINGS' : 'CHECKING',
          name: input.name,
          bank: input.bank ?? 'Conta',
          holder_id: input.holderId,
          balance: input.balance ?? 0,
        })
        .select('*')
        .single()
      if (error) throw error
      const bankAccount: BankAccount = {
        id: data.id,
        name: data.name,
        holderId: data.holder_id,
        balance: Number(data.balance ?? 0),
        bank: data.bank ?? undefined,
        accountType: data.type === 'SAVINGS' ? 'savings' : 'checking',
        createdAt: toDate(data.created_at),
        updatedAt: toDate(data.updated_at),
      }
      setBankAccounts((prev) => [...prev, bankAccount])
      return data.id as string
    },
    [userId],
  )

  const addCreditCard = useCallback(
    async (input: CreditCardInput) => {
      if (!userId) throw new Error('Usuário não inicializado')
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          type: 'CREDIT_CARD',
          name: input.name,
          bank: input.bank ?? 'Cartão',
          holder_id: input.holderId,
          credit_limit: input.limit,
          current_bill: input.currentBill ?? 0,
          closing_day: input.closingDay,
          due_day: input.dueDay,
          theme: input.theme,
          last_digits: input.lastDigits ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      const card: CreditCard = {
        id: data.id,
        name: data.name,
        holderId: data.holder_id,
        limit: Number(data.credit_limit ?? 0),
        currentBill: Number(data.current_bill ?? 0),
        closingDay: data.closing_day ?? 1,
        dueDay: data.due_day ?? 1,
        theme: (data.theme as any) ?? 'black',
        lastDigits: data.last_digits ?? undefined,
        bank: data.bank ?? undefined,
        createdAt: toDate(data.created_at),
        updatedAt: toDate(data.updated_at),
      }
      setCreditCards((prev) => [...prev, card])
      return data.id as string
    },
    [userId],
  )

  const addCategory = useCallback(
    async (input: { name: string; type: 'income' | 'expense' }) => {
      if (!userId) throw new Error('Usuário não inicializado')
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          name: input.name,
          type: input.type === 'income' ? 'INCOME' : 'EXPENSE',
        })
        .select('*')
        .single()
      if (error) throw error
      const cat: Category = { id: data.id, name: data.name, type: mapType(data.type) }
      setCategories((prev) => [...prev, cat])
      return data.id as string
    },
    [userId],
  )

  const getFilteredTransactions = useCallback(() => filteredTransactions, [filteredTransactions])

  const calculateIncomeForPeriod = useCallback(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [filteredTransactions])

  const calculateExpensesForPeriod = useCallback(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [filteredTransactions])

  const calculateExpensesByCategory = useCallback((): ExpensesByCategory => {
    const expenses = filteredTransactions.filter((tx) => tx.type === 'expense')
    const grouped = expenses.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [filteredTransactions])

  const calculateCategoryPercentage = useCallback((): CategoryPercentage => {
    const incomeTotal = calculateIncomeForPeriod()
    if (incomeTotal <= 0) {
      return calculateExpensesByCategory().map(({ category }) => ({ category, percentage: 0 }))
    }

    return calculateExpensesByCategory().map(({ category, total }) => ({
      category,
      percentage: (total / incomeTotal) * 100,
    }))
  }, [calculateExpensesByCategory, calculateIncomeForPeriod])

  const calculateSavingsRate = useCallback(() => {
    const income = calculateIncomeForPeriod()
    const expenses = calculateExpensesForPeriod()
    if (income <= 0) return 0
    return ((income - expenses) / income) * 100
  }, [calculateIncomeForPeriod, calculateExpensesForPeriod])

  const calculateTotalBalance = useCallback(() => {
    const memberFilter = filters.selectedMember
    const filteredAccounts = memberFilter ? bankAccounts.filter((acc) => acc.holderId === memberFilter) : bankAccounts
    const filteredCards = memberFilter ? creditCards.filter((card) => card.holderId === memberFilter) : creditCards
    const accountsBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    const cardsBill = filteredCards.reduce((sum, card) => sum + card.currentBill, 0)
    return accountsBalance - cardsBill
  }, [bankAccounts, creditCards, filters.selectedMember])

  const value: FinanceContextValue = {
    transactions,
    creditCards,
    bankAccounts,
    familyMembers,
    categories,
    filters,
    setSelectedMember,
    setDateRange,
    setTransactionType,
    setSearchText,
    addTransaction,
    addCreditCard,
    addBankAccount,
    addFamilyMember,
    addCategory,
    getFilteredTransactions,
    calculateTotalBalance,
    calculateIncomeForPeriod,
    calculateExpensesForPeriod,
    calculateExpensesByCategory,
    calculateCategoryPercentage,
    calculateSavingsRate,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider')
  }
  return context
}
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  Transaction,
  Goal,
  CreditCard,
  BankAccount,
  FamilyMember,
  GlobalFilters,
  DateRange,
} from '../types'

type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
type GoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>
type CreditCardInput = Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>
type BankAccountInput = Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>
type FamilyMemberInput = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>

type ExpensesByCategory = Array<{ category: string; total: number }>
type CategoryPercentage = Array<{ category: string; percentage: number }>

interface FinanceContextValue {
  transactions: Transaction[]
  goals: Goal[]
  creditCards: CreditCard[]
  bankAccounts: BankAccount[]
  familyMembers: FamilyMember[]
  filters: GlobalFilters

  setSelectedMember: (memberId: string | null) => void
  setDateRange: (range: DateRange | null) => void
  setTransactionType: (type: 'all' | 'income' | 'expense') => void
  setSearchText: (text: string) => void

  addTransaction: (input: TransactionInput) => string
  updateTransaction: (id: string, data: Partial<TransactionInput>) => void
  deleteTransaction: (id: string) => void

  addGoal: (input: GoalInput) => string
  updateGoal: (id: string, data: Partial<GoalInput>) => void
  deleteGoal: (id: string) => void

  addCreditCard: (input: CreditCardInput) => string
  updateCreditCard: (id: string, data: Partial<CreditCardInput>) => void
  deleteCreditCard: (id: string) => void

  addBankAccount: (input: BankAccountInput) => string
  updateBankAccount: (id: string, data: Partial<BankAccountInput>) => void
  deleteBankAccount: (id: string) => void

  addFamilyMember: (input: FamilyMemberInput) => string
  updateFamilyMember: (id: string, data: Partial<FamilyMemberInput>) => void
  deleteFamilyMember: (id: string) => void

  getFilteredTransactions: () => Transaction[]
  calculateTotalBalance: () => number
  calculateIncomeForPeriod: () => number
  calculateExpensesForPeriod: () => number
  calculateExpensesByCategory: () => ExpensesByCategory
  calculateCategoryPercentage: () => CategoryPercentage
  calculateSavingsRate: () => number
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined)

const today = new Date()
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 9)}`

const initialFamilyMembers: FamilyMember[] = [
  {
    id: 'm1',
    name: 'Ana Souza',
    role: 'Mãe',
    email: 'ana.souza@example.com',
    monthlyIncome: 8200,
    createdAt: daysAgo(80),
    updatedAt: daysAgo(5),
  },
  {
    id: 'm2',
    name: 'Carlos Silva',
    role: 'Pai',
    email: 'carlos.silva@example.com',
    monthlyIncome: 6400,
    createdAt: daysAgo(82),
    updatedAt: daysAgo(8),
  },
  {
    id: 'm3',
    name: 'Pedro Souza',
    role: 'Filho',
    email: 'pedro.souza@example.com',
    monthlyIncome: 1200,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(6),
  },
]

const initialBankAccounts: BankAccount[] = [
  {
    id: 'ba1',
    name: 'Conta Nubank',
    holderId: 'm1',
    balance: 8200,
    bank: 'Nubank',
    accountType: 'checking',
    createdAt: daysAgo(75),
    updatedAt: daysAgo(3),
  },
  {
    id: 'ba2',
    name: 'Conta Itaú',
    holderId: 'm2',
    balance: 5400,
    bank: 'Itaú',
    accountType: 'checking',
    createdAt: daysAgo(70),
    updatedAt: daysAgo(4),
  },
  {
    id: 'ba3',
    name: 'Conta Inter',
    holderId: 'm3',
    balance: 2800,
    bank: 'Inter',
    accountType: 'savings',
    createdAt: daysAgo(68),
    updatedAt: daysAgo(2),
  },
]

const initialCreditCards: CreditCard[] = [
  {
    id: 'cc1',
    name: 'Nubank Platinum',
    holderId: 'm1',
    limit: 12000,
    currentBill: 2300,
    closingDay: 5,
    dueDay: 12,
    theme: 'lime',
    lastDigits: '3481',
    bank: 'Nubank',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(3),
  },
  {
    id: 'cc2',
    name: 'Santander SX',
    holderId: 'm2',
    limit: 8000,
    currentBill: 1800,
    closingDay: 10,
    dueDay: 17,
    theme: 'white',
    lastDigits: '6621',
    bank: 'Santander',
    createdAt: daysAgo(88),
    updatedAt: daysAgo(4),
  },
  {
    id: 'cc3',
    name: 'Inter Gold',
    holderId: 'm3',
    limit: 5000,
    currentBill: 950,
    closingDay: 7,
    dueDay: 14,
    theme: 'black',
    lastDigits: '1190',
    bank: 'Inter',
    createdAt: daysAgo(85),
    updatedAt: daysAgo(2),
  },
]

const initialGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Reserva de Emergência',
    description: 'Guardar 6 meses de despesas',
    targetAmount: 18000,
    currentAmount: 9200,
    deadline: daysAgo(-90),
    category: 'Investimentos',
    memberId: null,
    status: 'active',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(1),
  },
  {
    id: 'g2',
    title: 'Viagem em família',
    description: 'Férias no litoral nordestino',
    targetAmount: 12000,
    currentAmount: 4500,
    deadline: daysAgo(-120),
    category: 'Lazer',
    memberId: 'm1',
    status: 'active',
    createdAt: daysAgo(78),
    updatedAt: daysAgo(5),
  },
  {
    id: 'g3',
    title: 'Notebook para estudos',
    description: 'Equipamento para cursos de tecnologia',
    targetAmount: 6000,
    currentAmount: 2200,
    deadline: daysAgo(-45),
    category: 'Educação',
    memberId: 'm3',
    status: 'active',
    createdAt: daysAgo(65),
    updatedAt: daysAgo(6),
  },
  {
    id: 'g4',
    title: 'Reforma da cozinha',
    description: 'Melhorias e novos eletrodomésticos',
    targetAmount: 15000,
    currentAmount: 3800,
    deadline: daysAgo(-150),
    category: 'Casa',
    memberId: 'm2',
    status: 'active',
    createdAt: daysAgo(77),
    updatedAt: daysAgo(7),
  },
]

const initialTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    amount: 8200,
    description: 'Salário Ana',
    category: 'Salário',
    date: daysAgo(5),
    accountId: 'ba1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 't2',
    type: 'income',
    amount: 6400,
    description: 'Salário Carlos',
    category: 'Salário',
    date: daysAgo(7),
    accountId: 'ba2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    id: 't3',
    type: 'income',
    amount: 1800,
    description: 'Freela UX',
    category: 'Serviços',
    date: daysAgo(12),
    accountId: 'ba1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
  {
    id: 't4',
    type: 'income',
    amount: 1200,
    description: 'Bônus performance',
    category: 'Bônus',
    date: daysAgo(30),
    accountId: 'ba2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
  {
    id: 't5',
    type: 'income',
    amount: 600,
    description: 'Dividendos FIIs',
    category: 'Investimentos',
    date: daysAgo(18),
    accountId: 'ba3',
    memberId: 'm3',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(18),
  },
  {
    id: 't6',
    type: 'income',
    amount: 400,
    description: 'Mesada',
    category: 'Outros',
    date: daysAgo(15),
    accountId: 'ba3',
    memberId: 'm3',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: 't7',
    type: 'expense',
    amount: 380,
    description: 'Supermercado mensal',
    category: 'Supermercado',
    date: daysAgo(4),
    accountId: 'cc1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
  {
    id: 't8',
    type: 'expense',
    amount: 120,
    description: 'Combustível',
    category: 'Transporte',
    date: daysAgo(3),
    accountId: 'cc2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 't9',
    type: 'expense',
    amount: 2400,
    description: 'Aluguel apartamento',
    category: 'Moradia',
    date: daysAgo(10),
    accountId: 'ba2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: 't10',
    type: 'expense',
    amount: 450,
    description: 'Curso de inglês',
    category: 'Educação',
    date: daysAgo(14),
    accountId: 'ba1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    id: 't11',
    type: 'expense',
    amount: 320,
    description: 'Consulta pediatra',
    category: 'Saúde',
    date: daysAgo(8),
    accountId: 'ba3',
    memberId: 'm3',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: 't12',
    type: 'expense',
    amount: 280,
    description: 'Cinema e jantar',
    category: 'Lazer',
    date: daysAgo(6),
    accountId: 'cc1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
  },
  {
    id: 't13',
    type: 'expense',
    amount: 190,
    description: 'Almoço trabalho',
    category: 'Alimentação',
    date: daysAgo(2),
    accountId: 'cc2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: 't14',
    type: 'expense',
    amount: 140,
    description: 'Farmácia',
    category: 'Saúde',
    date: daysAgo(9),
    accountId: 'ba1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
  {
    id: 't15',
    type: 'expense',
    amount: 89,
    description: 'Internet fibra',
    category: 'Serviços',
    date: daysAgo(11),
    accountId: 'ba2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(11),
    updatedAt: daysAgo(11),
  },
  {
    id: 't16',
    type: 'expense',
    amount: 210,
    description: 'Delivery fim de semana',
    category: 'Alimentação',
    date: daysAgo(1),
    accountId: 'cc1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 't17',
    type: 'expense',
    amount: 75,
    description: 'Streaming e música',
    category: 'Assinaturas',
    date: daysAgo(13),
    accountId: 'cc3',
    memberId: 'm3',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(13),
    updatedAt: daysAgo(13),
  },
  {
    id: 't18',
    type: 'expense',
    amount: 260,
    description: 'Material escolar',
    category: 'Educação',
    date: daysAgo(16),
    accountId: 'ba3',
    memberId: 'm3',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(16),
    updatedAt: daysAgo(16),
  },
  {
    id: 't19',
    type: 'expense',
    amount: 1340,
    description: 'Notebook 6x',
    category: 'Tecnologia',
    date: daysAgo(20),
    accountId: 'cc2',
    memberId: 'm2',
    installments: 6,
    currentInstallment: 2,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: 't20',
    type: 'expense',
    amount: 420,
    description: 'Mercado semanal',
    category: 'Supermercado',
    date: daysAgo(22),
    accountId: 'ba1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(22),
    updatedAt: daysAgo(22),
  },
  {
    id: 't21',
    type: 'expense',
    amount: 510,
    description: 'Academia trimestral',
    category: 'Saúde',
    date: daysAgo(28),
    accountId: 'ba2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: true,
    isPaid: true,
    createdAt: daysAgo(28),
    updatedAt: daysAgo(28),
  },
  {
    id: 't22',
    type: 'expense',
    amount: 260,
    description: 'Transporte por app',
    category: 'Transporte',
    date: daysAgo(26),
    accountId: 'cc1',
    memberId: 'm1',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(26),
    updatedAt: daysAgo(26),
  },
  {
    id: 't23',
    type: 'expense',
    amount: 310,
    description: 'Restaurante família',
    category: 'Alimentação',
    date: daysAgo(32),
    accountId: 'cc2',
    memberId: 'm2',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(32),
    updatedAt: daysAgo(32),
  },
  {
    id: 't24',
    type: 'expense',
    amount: 190,
    description: 'Livros e cursos online',
    category: 'Educação',
    date: daysAgo(35),
    accountId: 'ba3',
    memberId: 'm3',
    installments: 1,
    currentInstallment: 1,
    status: 'completed',
    isRecurring: false,
    isPaid: true,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
]

const initialFilters: GlobalFilters = {
  selectedMember: null,
  dateRange: null,
  transactionType: 'all',
  searchText: '',
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [creditCards, setCreditCards] = useState<CreditCard[]>(initialCreditCards)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers)
  const [filters, setFilters] = useState<GlobalFilters>(initialFilters)

  const setSelectedMember = useCallback((memberId: string | null) => {
    setFilters((prev) => ({ ...prev, selectedMember: memberId }))
  }, [])

  const setDateRange = useCallback((range: DateRange | null) => {
    setFilters((prev) => ({ ...prev, dateRange: range }))
  }, [])

  const setTransactionType = useCallback((type: 'all' | 'income' | 'expense') => {
    setFilters((prev) => ({ ...prev, transactionType: type }))
  }, [])

  const setSearchText = useCallback((text: string) => {
    setFilters((prev) => ({ ...prev, searchText: text }))
  }, [])

  const accountOwnerMap = useMemo(() => {
    const map: Record<string, string> = {}
    bankAccounts.forEach((acc) => {
      map[acc.id] = acc.holderId
    })
    creditCards.forEach((card) => {
      map[card.id] = card.holderId
    })
    return map
  }, [bankAccounts, creditCards])

  const filteredTransactions = useMemo(() => {
    const search = filters.searchText.trim().toLowerCase()
    const start = filters.dateRange?.startDate?.getTime()
    const end = filters.dateRange?.endDate?.getTime()

    return transactions.filter((tx) => {
      const txDate = tx.date.getTime()

      if (start && txDate < start) return false
      if (end && txDate > end) return false

      if (filters.transactionType !== 'all' && tx.type !== filters.transactionType) return false

      if (filters.selectedMember) {
        const owner = accountOwnerMap[tx.accountId]
        const matchesMember = tx.memberId === filters.selectedMember || owner === filters.selectedMember
        if (!matchesMember) return false
      }

      if (search) {
        const haystack = `${tx.description} ${tx.category}`.toLowerCase()
        if (!haystack.includes(search)) return false
      }

      return true
    })
  }, [transactions, filters, accountOwnerMap])

  const addTransaction = useCallback((input: TransactionInput) => {
    const id = generateId()
    const now = new Date()
    setTransactions((prev) => [...prev, { ...input, id, createdAt: now, updatedAt: now }])
    return id
  }, [])

  const updateTransaction = useCallback((id: string, data: Partial<TransactionInput>) => {
    const now = new Date()
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...data, updatedAt: now } : tx)),
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }, [])

  const addGoal = useCallback((input: GoalInput) => {
    const id = generateId()
    const now = new Date()
    setGoals((prev) => [...prev, { ...input, id, createdAt: now, updatedAt: now }])
    return id
  }, [])

  const updateGoal = useCallback((id: string, data: Partial<GoalInput>) => {
    const now = new Date()
    setGoals((prev) => prev.map((goal) => (goal.id === id ? { ...goal, ...data, updatedAt: now } : goal)))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id))
  }, [])

  const addCreditCard = useCallback((input: CreditCardInput) => {
    const id = generateId()
    const now = new Date()
    setCreditCards((prev) => [...prev, { ...input, id, createdAt: now, updatedAt: now }])
    return id
  }, [])

  const updateCreditCard = useCallback((id: string, data: Partial<CreditCardInput>) => {
    const now = new Date()
    setCreditCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...data, updatedAt: now } : card)),
    )
  }, [])

  const deleteCreditCard = useCallback((id: string) => {
    setCreditCards((prev) => prev.filter((card) => card.id !== id))
  }, [])

  const addBankAccount = useCallback((input: BankAccountInput) => {
    const id = generateId()
    const now = new Date()
    setBankAccounts((prev) => [...prev, { ...input, id, createdAt: now, updatedAt: now }])
    return id
  }, [])

  const updateBankAccount = useCallback((id: string, data: Partial<BankAccountInput>) => {
    const now = new Date()
    setBankAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...data, updatedAt: now } : acc)),
    )
  }, [])

  const deleteBankAccount = useCallback((id: string) => {
    setBankAccounts((prev) => prev.filter((acc) => acc.id !== id))
  }, [])

  const addFamilyMember = useCallback((input: FamilyMemberInput) => {
    const id = generateId()
    const now = new Date()
    setFamilyMembers((prev) => [...prev, { ...input, id, createdAt: now, updatedAt: now }])
    return id
  }, [])

  const updateFamilyMember = useCallback((id: string, data: Partial<FamilyMemberInput>) => {
    const now = new Date()
    setFamilyMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, ...data, updatedAt: now } : member)),
    )
  }, [])

  const deleteFamilyMember = useCallback((id: string) => {
    setFamilyMembers((prev) => prev.filter((member) => member.id !== id))
  }, [])

  const getFilteredTransactions = useCallback(() => filteredTransactions, [filteredTransactions])

  const calculateIncomeForPeriod = useCallback(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [filteredTransactions])

  const calculateExpensesForPeriod = useCallback(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }, [filteredTransactions])

  const calculateExpensesByCategory = useCallback((): ExpensesByCategory => {
    const expenses = filteredTransactions.filter((tx) => tx.type === 'expense')
    const grouped = expenses.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
  }, [filteredTransactions])

  const calculateCategoryPercentage = useCallback((): CategoryPercentage => {
    const incomeTotal = calculateIncomeForPeriod()
    if (incomeTotal <= 0) {
      return calculateExpensesByCategory().map(({ category }) => ({ category, percentage: 0 }))
    }

    return calculateExpensesByCategory().map(({ category, total }) => ({
      category,
      percentage: (total / incomeTotal) * 100,
    }))
  }, [calculateExpensesByCategory, calculateIncomeForPeriod])

  const calculateSavingsRate = useCallback(() => {
    const income = calculateIncomeForPeriod()
    const expenses = calculateExpensesForPeriod()
    if (income <= 0) return 0
    return ((income - expenses) / income) * 100
  }, [calculateIncomeForPeriod, calculateExpensesForPeriod])

  const calculateTotalBalance = useCallback(() => {
    const memberFilter = filters.selectedMember

    const filteredAccounts = memberFilter
      ? bankAccounts.filter((acc) => acc.holderId === memberFilter)
      : bankAccounts

    const filteredCards = memberFilter
      ? creditCards.filter((card) => card.holderId === memberFilter)
      : creditCards

    const accountsBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0)
    const cardsBill = filteredCards.reduce((sum, card) => sum + card.currentBill, 0)

    return accountsBalance - cardsBill
  }, [bankAccounts, creditCards, filters.selectedMember])

  const value: FinanceContextValue = {
    transactions,
    goals,
    creditCards,
    bankAccounts,
    familyMembers,
    filters,
    setSelectedMember,
    setDateRange,
    setTransactionType,
    setSearchText,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    getFilteredTransactions,
    calculateTotalBalance,
    calculateIncomeForPeriod,
    calculateExpensesForPeriod,
    calculateExpensesByCategory,
    calculateCategoryPercentage,
    calculateSavingsRate,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider')
  }
  return context
}
