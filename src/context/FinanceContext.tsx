import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react'
import type { Transaction, CreditCard, BankAccount, FamilyMember, GlobalFilters, DateRange } from '../types'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
type CreditCardInput = Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>
type BankAccountInput = Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>
type FamilyMemberInput = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>

type ExpensesByCategory = Array<{ category: string; total: number }>
type CategoryPercentage = Array<{ category: string; percentage: number }>
type Category = { id: string; name: string; type: 'income' | 'expense'; workspaceId?: string }
type Workspace = { id: string; name: string; type: string; ownerId: string; avatarUrl?: string | null; subtitle?: string | null }

interface FinanceContextValue {
  userId: string | null // ID do usuário na tabela users (não auth.users)
  transactions: Transaction[]
  creditCards: CreditCard[]
  bankAccounts: BankAccount[]
  familyMembers: FamilyMember[]
  categories: Category[]
  workspaces: Workspace[]
  activeWorkspaceId: string
  filters: GlobalFilters

  setSelectedMember: (memberId: string | null) => void
  setDateRange: (range: DateRange | null) => void
  setTransactionType: (type: 'all' | 'income' | 'expense') => void
  setSearchText: (text: string) => void
  setActiveWorkspace: (id: string) => void
  createWorkspace: (input: { name: string; type?: string; subtitle?: string | null; avatarUrl?: string | null }) => Promise<string>
  updateWorkspace: (id: string, input: { name?: string; type?: string; subtitle?: string | null; avatarUrl?: string | null }) => Promise<void>

  addTransaction: (input: TransactionInput) => Promise<string>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  resetCardTransactions: (cardId: string) => Promise<void>
  addCreditCard: (input: CreditCardInput) => Promise<string>
  updateCreditCard: (id: string, input: Partial<CreditCardInput>) => Promise<void>
  deleteCreditCard: (id: string) => Promise<void>
  addBankAccount: (input: BankAccountInput) => Promise<string>
  updateBankAccount: (id: string, input: Partial<BankAccountInput>) => Promise<void>
  deleteBankAccount: (id: string) => Promise<void>
  addFamilyMember: (input: FamilyMemberInput) => Promise<string>
  updateFamilyMember: (id: string, input: Partial<FamilyMemberInput>) => Promise<void>
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
const DEFAULT_WORKSPACE_ID = '00000000-0000-4000-8000-000000000001'

const toDate = (value: string | Date | null | undefined) => (value ? new Date(value) : new Date())
const mapStatus = (dbStatus?: string): 'pending' | 'completed' | 'cancelled' => {
  if (dbStatus === 'PENDING') return 'pending'
  if (dbStatus === 'COMPLETED') return 'completed'
  return 'completed'
}
const mapType = (dbType?: string): 'income' | 'expense' => (dbType === 'INCOME' ? 'income' : 'expense')

// Retorna intervalo (inclusive) do ciclo corrente, baseado no dia de fechamento
const getCycleRange = (closingDay: number, reference = new Date()) => {
  const today = new Date(reference)
  const day = today.getDate()
  const close = Math.min(Math.max(closingDay || 1, 1), 28) // evitar transbordo em meses curtos

  let start: Date
  let end: Date

  if (day > close) {
    // ciclo iniciou este mês, termina próximo fechamento
    start = new Date(today.getFullYear(), today.getMonth(), close + 1)
    end = new Date(today.getFullYear(), today.getMonth() + 1, close)
  } else {
    // ciclo iniciou no mês anterior
    start = new Date(today.getFullYear(), today.getMonth() - 1, close + 1)
    end = new Date(today.getFullYear(), today.getMonth(), close)
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const INITIAL_FILTERS: GlobalFilters = {
  selectedMember: null,
  dateRange: null,
  transactionType: 'all',
  searchText: '',
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userId, setUserId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(DEFAULT_WORKSPACE_ID)
  const [filters, setFilters] = useState<GlobalFilters>(INITIAL_FILTERS)

  // Usa o usuário autenticado do AuthContext
  useEffect(() => {
    if (!user) {
      setUserId(null)
      // Limpa dados quando usuário faz logout
      setTransactions([])
      setCreditCards([])
      setBankAccounts([])
      setFamilyMembers([])
      setCategories([])
      return
    }

    const ensureUser = async () => {
      try {
        // Verifica se as variáveis de ambiente estão configuradas
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Variáveis de ambiente do Supabase não configuradas. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
          return
        }

        // Busca ou cria o usuário na tabela users usando o email do usuário autenticado
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erro ao buscar usuário:', fetchError)
          return
        }

        if (existingUser) {
          setUserId(existingUser.id)
          return
        }

        // Se não existir, cria o usuário na tabela users
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert({
            email: user.email || '',
            name: user.email?.split('@')[0] || 'Usuário',
          })
          .select('*')
          .single()

        if (insertError) {
          console.error('Erro ao criar usuário:', insertError)
          return
        }

        if (inserted) {
          setUserId(inserted.id)
        }
      } catch (err) {
        console.error('Erro inesperado ao garantir usuário:', err)
      }
    }

    ensureUser()
  }, [user])

  useEffect(() => {
    if (!userId) return
    const loadAll = async () => {
      try {
        // carrega workspaces do owner ou o workspace default (Torso Family)
        const orFilter = `owner_id.eq.${userId},id.eq.${DEFAULT_WORKSPACE_ID}`
        let wsData: any[] = []
        const wsRes = await supabase.from('workspaces').select('*').or(orFilter)

        if (wsRes.data) {
          wsData = wsRes.data
        }

        // Se não existir nenhum, cria/garante o default para o usuário atual
        if (!wsData.length) {
          const { data: inserted } = await supabase
            .from('workspaces')
            .upsert(
              {
                id: DEFAULT_WORKSPACE_ID,
                name: 'Família Torso',
                type: 'family',
                owner_id: userId,
                subtitle: 'Workspace padrão',
              },
              { onConflict: 'id' },
            )
            .select('*')

          if (inserted?.length) {
            wsData = inserted
          }
        }

        let wsFilter = activeWorkspaceId || DEFAULT_WORKSPACE_ID

        // Deduplica por id e seta estado
        if (wsData.length) {
          const unique = Array.from(
            new Map(
              wsData.map((w) => [
                w.id,
                {
                  id: w.id,
                  name: w.name,
                  type: w.type,
                  ownerId: w.owner_id,
                  avatarUrl: w.avatar_url ?? null,
                  subtitle: w.subtitle ?? null,
                },
              ]),
            ).values(),
          )

          setWorkspaces(unique)

          const defaultExists = unique.find((w) => w.id === DEFAULT_WORKSPACE_ID)
          const activeExists = unique.find((w) => w.id === activeWorkspaceId)
          let nextActive = wsFilter
          if (!activeExists) {
            if (defaultExists) {
              nextActive = DEFAULT_WORKSPACE_ID
              setActiveWorkspaceId(DEFAULT_WORKSPACE_ID)
            } else {
              nextActive = unique[0].id
              setActiveWorkspaceId(unique[0].id)
            }
          }
          wsFilter = nextActive
        }

        const [fm, acc, cat, tx] = await Promise.all([
          supabase.from('family_members').select('*').eq('workspace_id', wsFilter),
          supabase.from('accounts').select('*').eq('workspace_id', wsFilter),
          supabase.from('categories').select('*').eq('workspace_id', wsFilter),
          supabase.from('transactions').select('*').eq('workspace_id', wsFilter),
        ])

      if (fm.data) {
        setFamilyMembers(
          fm.data.map((item) => ({
            id: item.id,
            workspaceId: item.workspace_id ?? DEFAULT_WORKSPACE_ID,
            name: item.name,
            role: item.role,
            email: item.email ?? undefined,
            avatarUrl: item.avatar_url ?? undefined,
            monthlyIncome: Number(item.monthly_income ?? 0),
            createdAt: toDate(item.created_at),
            updatedAt: toDate(item.updated_at),
          })),
        )
      }

      let banks: BankAccount[] = []
      let cardsBase: CreditCard[] = []
      if (acc.data) {
        acc.data.forEach((a) => {
          if (a.type === 'CREDIT_CARD') {
            cardsBase.push({
              id: a.id,
              workspaceId: a.workspace_id ?? DEFAULT_WORKSPACE_ID,
              name: a.name,
              holderId: a.holder_id,
              limit: Number(a.credit_limit ?? 0),
              currentBill: 0, // será derivado com base nas parcelas pendentes do ciclo
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
              workspaceId: a.workspace_id ?? DEFAULT_WORKSPACE_ID,
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
      }

      let categoriesMapped: Category[] = []
      if (cat.data) {
        categoriesMapped = cat.data.map((c) => ({
          id: c.id,
          name: c.name,
          workspaceId: c.workspace_id ?? undefined,
          type: mapType(c.type),
        }))
        setCategories(categoriesMapped)
      }

      let txMapped: Transaction[] = []
      if (tx.data) {
        const catMap = new Map<string, string>()
        categoriesMapped.forEach((c) => catMap.set(c.id, c.name))
        txMapped = tx.data.map((t) => ({
          id: t.id,
          type: mapType(t.type),
          amount: Number(t.amount ?? 0),
          description: t.description,
          category: t.category_id ? catMap.get(t.category_id) ?? 'Sem categoria' : 'Sem categoria',
          date: toDate(t.date),
          workspaceId: t.workspace_id ?? DEFAULT_WORKSPACE_ID,
          accountId: t.account_id ?? '',
          memberId: t.member_id ?? null,
          installments: t.total_installments ?? 1, // legado
          currentInstallment: t.installment_number ?? 1, // legado
          totalInstallments: t.total_installments ?? 1,
          paidInstallments: t.paid_installments ?? 0,
          purchaseDate: t.purchase_date ? toDate(t.purchase_date) : undefined,
          firstInstallmentDate: t.first_installment_date ? toDate(t.first_installment_date) : undefined,
          parentTransactionId: t.parent_transaction_id ?? null,
          status: mapStatus(t.status),
          isRecurring: Boolean(t.is_recurring),
          isPaid: mapStatus(t.status) === 'completed',
          createdAt: toDate(t.created_at),
          updatedAt: toDate(t.updated_at),
        }))
        setTransactions(txMapped)
      }

      const cardsDerived = deriveCreditCards(cardsBase, txMapped)
      setCreditCards(cardsDerived)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      }
    }
    loadAll()
  }, [userId, activeWorkspaceId])

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

  const deriveCreditCards = useCallback(
    (cards: CreditCard[], txs: Transaction[]) => {
      return cards.map((card) => {
        const pendingExpenses = txs.filter(
          (tx) => tx.accountId === card.id && tx.type === 'expense' && tx.status === 'pending',
        )

        // Parcela que pertence à fatura atual (ciclo corrente)
      const { start, end } = getCycleRange(card.closingDay ?? 1)
        const currentBill = pendingExpenses
          .filter((tx) => {
            const d = tx.date.getTime()
            return d >= start.getTime() && d <= end.getTime()
          })
          .reduce((sum, tx) => sum + (tx.amount || 0), 0)

        // Limite comprometido = todas as despesas pendentes futuras + atuais
        const committed = pendingExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0)
        const availableLimit = card.limit - committed

        return {
          ...card,
          currentBill,
          availableLimit,
        }
      })
    },
    [],
  )

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      // Aguarda um pouco caso o userId ainda esteja sendo inicializado
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const totalInstallments = input.totalInstallments ?? input.installments ?? 1
      const paidInstallments = Math.min(Math.max(input.paidInstallments ?? 0, 0), totalInstallments)
      if (totalInstallments <= 0) throw new Error('Total de parcelas deve ser maior que zero.')

      const purchaseDate = input.purchaseDate ?? input.date ?? new Date()
      const firstInstallmentDate = input.firstInstallmentDate ?? input.date ?? new Date()

      const addMonths = (date: Date, months: number) => {
        const d = new Date(date)
        const day = d.getDate()
        d.setMonth(d.getMonth() + months)
        if (d.getDate() !== day) {
          d.setDate(0)
        }
        return d
      }

      // Distribui centavos para evitar perda de valor total
      const totalCents = Math.round(input.amount * 100)
      const baseValue = Math.floor(totalCents / totalInstallments)
      const remainder = totalCents - baseValue * totalInstallments

      // Descobre o ID da categoria pelo nome (se existente)
      const categoryId =
        input.category && input.category.trim()
          ? categories.find((c) => c.name === input.category.trim())?.id ?? null
          : null

      const payloads = Array.from({ length: totalInstallments }, (_, idx) => {
        const valueCents = baseValue + (idx < remainder ? 1 : 0)
        const installmentDate = addMonths(firstInstallmentDate, idx)
        const isPaid = idx < paidInstallments
        return {
          user_id: userId,
          workspace_id: activeWorkspaceId || DEFAULT_WORKSPACE_ID,
          type: input.type === 'income' ? 'INCOME' : 'EXPENSE',
          amount: valueCents / 100,
          description: input.description,
          date: installmentDate.toISOString().slice(0, 10),
          purchase_date: purchaseDate.toISOString().slice(0, 10),
          first_installment_date: firstInstallmentDate.toISOString().slice(0, 10),
          category_id: categoryId,
          account_id: input.accountId || null,
          member_id: input.memberId,
          total_installments: totalInstallments,
          installment_number: idx + 1,
          paid_installments: paidInstallments,
          parent_transaction_id: null,
          is_recurring: input.isRecurring ?? false,
          status: isPaid ? 'COMPLETED' : 'PENDING',
          notes: null,
        }
      })

      const { data, error } = await supabase.from('transactions').insert(payloads).select('*')
      if (error) throw error

      const categoryName = input.category ?? 'Sem categoria'
      const mapped = data.map((row) => ({
        id: row.id,
        type: mapType(row.type),
        amount: Number(row.amount ?? 0),
        description: row.description,
        category: categoryName,
        date: toDate(row.date),
        workspaceId: row.workspace_id ?? DEFAULT_WORKSPACE_ID,
        accountId: row.account_id ?? '',
        memberId: row.member_id ?? null,
        installments: row.total_installments ?? 1,
        currentInstallment: row.installment_number ?? 1,
        totalInstallments: row.total_installments ?? 1,
        paidInstallments: row.paid_installments ?? 0,
        purchaseDate: row.purchase_date ? toDate(row.purchase_date) : undefined,
        firstInstallmentDate: row.first_installment_date ? toDate(row.first_installment_date) : undefined,
        parentTransactionId: row.parent_transaction_id ?? null,
        status: mapStatus(row.status),
        isRecurring: Boolean(row.is_recurring),
        isPaid: mapStatus(row.status) === 'completed',
        createdAt: toDate(row.created_at),
        updatedAt: toDate(row.updated_at),
      }))

      setTransactions((prev) => {
        const updated = [...prev, ...mapped]
        // Recalcula cartões com as novas transações
        setCreditCards((prevCards) => deriveCreditCards(prevCards, updated))
        return updated
      })
      return mapped[0]?.id as string
    },
    [userId, deriveCreditCards, activeWorkspaceId],
  )

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      
      const payload: Record<string, any> = {}
      if (updates.status !== undefined) {
        payload.status = updates.status === 'pending' ? 'PENDING' : updates.status === 'completed' ? 'COMPLETED' : 'CANCELLED'
      }
      if (updates.isPaid !== undefined) {
        payload.status = updates.isPaid ? 'COMPLETED' : 'PENDING'
      }
      if (updates.currentInstallment !== undefined) {
        payload.installment_number = updates.currentInstallment
      }
      // Atualiza categoria se informada (mapeia nome -> id)
      if (updates.category !== undefined) {
        const catName = updates.category?.trim() ?? ''
        const categoryId =
          catName.length > 0 ? categories.find((c) => c.name === catName)?.id ?? null : null
        payload.category_id = categoryId
      }
      if (updates.date !== undefined) {
        payload.date = updates.date.toISOString().slice(0, 10)
      }
      if (updates.purchaseDate !== undefined) {
        payload.purchase_date = updates.purchaseDate.toISOString().slice(0, 10)
      }
      if (updates.firstInstallmentDate !== undefined) {
        payload.first_installment_date = updates.firstInstallmentDate.toISOString().slice(0, 10)
      }
      if (updates.totalInstallments !== undefined) {
        payload.total_installments = updates.totalInstallments
      }
      if (updates.paidInstallments !== undefined) {
        payload.paid_installments = updates.paidInstallments
      }
      if (updates.accountId !== undefined) {
        payload.account_id = updates.accountId || null
      }
      if (updates.memberId !== undefined) {
        payload.member_id = updates.memberId
      }
      if (updates.amount !== undefined) {
        payload.amount = updates.amount
      }
      if (updates.description !== undefined) {
        payload.description = updates.description
      }
      if (updates.type !== undefined) {
        payload.type = updates.type === 'income' ? 'INCOME' : 'EXPENSE'
      }
      
      const { error } = await supabase.from('transactions').update(payload).eq('id', id)
      if (error) throw error
      
      // Atualiza o estado local
      setTransactions((prev) => {
        const updated = prev.map((tx) => {
          if (tx.id === id) {
            return {
              ...tx,
              ...updates,
              status: updates.isPaid ? 'completed' : (updates.status ?? tx.status),
              isPaid: updates.isPaid ?? (updates.status === 'completed' ? true : false),
              category: updates.category !== undefined ? updates.category ?? 'Sem categoria' : tx.category,
            }
          }
          return tx
        })
        // Recalcula cartões após atualizar transação
        setCreditCards((prevCards) => deriveCreditCards(prevCards, updated))
        return updated
      })
    },
    [userId, deriveCreditCards, categories, activeWorkspaceId],
  )

  const resetCardTransactions = useCallback(
    async (cardId: string) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }

      const { error } = await supabase.from('transactions').delete().eq('account_id', cardId)
      if (error) throw error

      setTransactions((prev) => {
        const updated = prev.filter((tx) => tx.accountId !== cardId)
        setCreditCards((prevCards) => deriveCreditCards(prevCards, updated))
        return updated
      })
    },
    [userId, deriveCreditCards, activeWorkspaceId],
  )

  const addFamilyMember = useCallback(
    async (input: FamilyMemberInput) => {
      // Aguarda até que o userId esteja disponível (com timeout de 5 segundos)
      if (!userId) {
        // Tenta aguardar um pouco para ver se o userId é inicializado
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      // Prepara payload garantindo que campos obrigatórios estão presentes
      const insertPayload: Record<string, any> = {
        user_id: userId,
        workspace_id: activeWorkspaceId || DEFAULT_WORKSPACE_ID,
        name: input.name.trim(),
        role: input.role.trim(),
        monthly_income: typeof input.monthlyIncome === 'number' ? input.monthlyIncome : (Number(input.monthlyIncome) || 0),
      }
      
      // Campos opcionais - só adiciona se tiver valor
      if (input.email && input.email.trim()) {
        insertPayload.email = input.email.trim()
      }
      
      if (input.avatarUrl && input.avatarUrl.trim()) {
        insertPayload.avatar_url = input.avatarUrl.trim()
      }
      
      console.log('Criando novo membro:', insertPayload)
      console.log('Tipos dos valores:', {
        user_id: typeof insertPayload.user_id,
        name: typeof insertPayload.name,
        role: typeof insertPayload.role,
        monthly_income: typeof insertPayload.monthly_income,
        email: insertPayload.email ? typeof insertPayload.email : 'undefined',
        avatar_url: insertPayload.avatar_url ? typeof insertPayload.avatar_url : 'undefined',
      })

      const { data, error } = await supabase
        .from('family_members')
        .insert(insertPayload)
        .select('*')
        .single()
      
      if (error) {
        console.error('Erro ao criar membro:', error)
        console.error('Payload enviado:', insertPayload)
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        
        // Mensagem de erro mais amigável
        if (error.code === '23503') {
          throw new Error('Erro: Usuário não encontrado. Verifique se você está autenticado corretamente.')
        }
        if (error.code === '23502') {
          throw new Error('Erro: Campo obrigatório faltando. Verifique se nome e função foram preenchidos.')
        }
        if (error.message?.includes('violates')) {
          throw new Error(`Erro de validação: ${error.message}`)
        }
        
        throw new Error(`Erro ao criar membro: ${error.message || 'Erro desconhecido'}`)
      }
      
      console.log('Membro criado com sucesso:', data)
      const member: FamilyMember = {
        id: data.id,
        workspaceId: data.workspace_id ?? activeWorkspaceId ?? DEFAULT_WORKSPACE_ID,
        name: data.name,
        role: data.role,
        email: data.email ?? undefined,
        avatarUrl: data.avatar_url ?? undefined,
        monthlyIncome: Number(data.monthly_income ?? 0),
        createdAt: toDate(data.created_at),
        updatedAt: toDate(data.updated_at),
      }
      setFamilyMembers((prev) => [...prev, member])
      return data.id as string
    },
    [userId, activeWorkspaceId],
  )

  const updateFamilyMember = useCallback(
    async (id: string, input: Partial<FamilyMemberInput>) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const payload: Record<string, any> = {}
      
      // Campos obrigatórios
      if (input.name !== undefined) payload.name = input.name.trim()
      if (input.role !== undefined) payload.role = input.role.trim()
      if (input.monthlyIncome !== undefined) {
        payload.monthly_income = typeof input.monthlyIncome === 'number' 
          ? input.monthlyIncome 
          : (Number(input.monthlyIncome) || 0)
      }
      
      // Campos opcionais - só atualiza se fornecido
      if (input.email !== undefined) {
        payload.email = input.email && input.email.trim() ? input.email.trim() : null
      }
      
      if (input.avatarUrl !== undefined) {
        // Salva como null se for string vazia, senão salva a URL
        payload.avatar_url = input.avatarUrl && input.avatarUrl.trim() ? input.avatarUrl.trim() : null
      }

      console.log('Atualizando membro:', { id, payload })

      const { data, error } = await supabase
        .from('family_members')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()
      
      if (error) {
        console.error('Erro ao atualizar membro:', error)
        console.error('Payload enviado:', payload)
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        
        // Mensagem de erro mais amigável
        if (error.code === '23502') {
          throw new Error('Erro: Campo obrigatório faltando. Verifique se nome e função foram preenchidos.')
        }
        if (error.message?.includes('violates')) {
          throw new Error(`Erro de validação: ${error.message}`)
        }
        
        throw new Error(`Erro ao atualizar membro: ${error.message || 'Erro desconhecido'}`)
      }
      
      console.log('Membro atualizado com sucesso:', data)
      const member: FamilyMember = {
        id: data.id,
        workspaceId: data.workspace_id ?? DEFAULT_WORKSPACE_ID,
        name: data.name,
        role: data.role,
        email: data.email ?? undefined,
        avatarUrl: data.avatar_url ?? undefined,
        monthlyIncome: Number(data.monthly_income ?? 0),
        createdAt: toDate(data.created_at),
        updatedAt: toDate(data.updated_at),
      }
      setFamilyMembers((prev) => prev.map((m) => (m.id === id ? member : m)))
    },
    [userId, activeWorkspaceId],
  )

  const addBankAccount = useCallback(
    async (input: BankAccountInput) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          workspace_id: activeWorkspaceId || DEFAULT_WORKSPACE_ID,
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
        workspaceId: data.workspace_id ?? activeWorkspaceId ?? DEFAULT_WORKSPACE_ID,
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
    [userId, activeWorkspaceId],
  )

  const addCreditCard = useCallback(
    async (input: CreditCardInput) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: userId,
          workspace_id: activeWorkspaceId || DEFAULT_WORKSPACE_ID,
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
        workspaceId: data.workspace_id ?? activeWorkspaceId ?? DEFAULT_WORKSPACE_ID,
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
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      console.log('Criando categoria:', { userId, name: input.name, type: input.type })
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: userId,
          workspace_id: activeWorkspaceId || DEFAULT_WORKSPACE_ID,
          name: input.name.trim(),
          type: input.type === 'income' ? 'INCOME' : 'EXPENSE',
        })
        .select('*')
        .single()
      
      if (error) {
        console.error('Erro ao criar categoria:', error)
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }
      
      console.log('Categoria criada com sucesso:', data)
      const cat: Category = {
        id: data.id,
        name: data.name,
        type: mapType(data.type),
        workspaceId: data.workspace_id ?? activeWorkspaceId ?? DEFAULT_WORKSPACE_ID,
      }
      setCategories((prev) => {
        // Verifica se a categoria já existe para evitar duplicatas
        const exists = prev.some((c) => c.id === cat.id)
        if (exists) return prev
        return [...prev, cat]
      })
      return data.id as string
    },
    [userId],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
      setTransactions((prev) => {
        const updated = prev.filter((tx) => tx.id !== id)
        // Recalcula cartões após excluir transação
        setCreditCards((prevCards) => deriveCreditCards(prevCards, updated))
        return updated
      })
    },
    [userId, deriveCreditCards],
  )

  const updateCreditCard = useCallback(
    async (id: string, input: Partial<CreditCardInput>) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const payload: Record<string, any> = {}
      if (input.name !== undefined) payload.name = input.name
      if (input.holderId !== undefined) payload.holder_id = input.holderId
      if (input.limit !== undefined) payload.credit_limit = input.limit
      if (input.currentBill !== undefined) payload.current_bill = input.currentBill
      if (input.closingDay !== undefined) payload.closing_day = input.closingDay
      if (input.dueDay !== undefined) payload.due_day = input.dueDay
      if (input.theme !== undefined) payload.theme = input.theme
      if (input.lastDigits !== undefined) payload.last_digits = input.lastDigits
      if (input.bank !== undefined) payload.bank = input.bank

      const { error } = await supabase.from('accounts').update(payload).eq('id', id)
      if (error) throw error

      setCreditCards((prev) =>
        prev.map((card) => {
          if (card.id === id) {
            return {
              ...card,
              ...input,
              limit: input.limit ?? card.limit,
              currentBill: input.currentBill ?? card.currentBill,
              closingDay: input.closingDay ?? card.closingDay,
              dueDay: input.dueDay ?? card.dueDay,
              theme: (input.theme as any) ?? card.theme,
              lastDigits: input.lastDigits ?? card.lastDigits,
              bank: input.bank ?? card.bank,
            }
          }
          return card
        })
      )
    },
    [userId],
  )

  const deleteCreditCard = useCallback(
    async (id: string) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
      setCreditCards((prev) => prev.filter((card) => card.id !== id))
    },
    [userId],
  )

  const updateBankAccount = useCallback(
    async (id: string, input: Partial<BankAccountInput>) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const payload: Record<string, any> = {}
      if (input.name !== undefined) payload.name = input.name
      if (input.holderId !== undefined) payload.holder_id = input.holderId
      if (input.balance !== undefined) payload.balance = input.balance
      if (input.bank !== undefined) payload.bank = input.bank
      if (input.accountType !== undefined) payload.type = input.accountType === 'savings' ? 'SAVINGS' : 'CHECKING'

      const { error } = await supabase.from('accounts').update(payload).eq('id', id)
      if (error) throw error

      setBankAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            return {
              ...acc,
              ...input,
              balance: input.balance ?? acc.balance,
              bank: input.bank ?? acc.bank,
              accountType: input.accountType ?? acc.accountType,
            }
          }
          return acc
        })
      )
    },
    [userId],
  )

  const deleteBankAccount = useCallback(
    async (id: string) => {
      if (!userId) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (!userId) {
          throw new Error('Usuário não inicializado. Verifique se o Supabase está configurado corretamente.')
        }
      }
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
      setBankAccounts((prev) => prev.filter((acc) => acc.id !== id))
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
    userId,
    transactions,
    creditCards,
    bankAccounts,
    familyMembers,
    categories,
    workspaces,
    activeWorkspaceId,
    filters,
    setSelectedMember,
    setDateRange,
    setTransactionType,
    setSearchText,
    setActiveWorkspace: (id: string) => setActiveWorkspaceId(id || DEFAULT_WORKSPACE_ID),
    createWorkspace: async (input) => {
      if (!userId) throw new Error('Usuário não autenticado')
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: input.name,
          type: input.type ?? 'family',
          owner_id: userId,
          subtitle: input.subtitle ?? null,
          avatar_url: input.avatarUrl ?? null,
        })
        .select('*')
        .single()
      if (error) throw error
      const ws: Workspace = {
        id: data.id,
        name: data.name,
        type: data.type,
        ownerId: data.owner_id,
        subtitle: data.subtitle ?? null,
        avatarUrl: data.avatar_url ?? null,
      }
      setWorkspaces((prev) => [...prev, ws])
      setActiveWorkspaceId(data.id)
      return data.id as string
    },
    updateWorkspace: async (id, input) => {
      if (!userId) throw new Error('Usuário não autenticado')
      const payload: any = {}
      if (input.name !== undefined) payload.name = input.name
      if (input.type !== undefined) payload.type = input.type
      if (input.subtitle !== undefined) payload.subtitle = input.subtitle
      if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl

      const { data, error } = await supabase
        .from('workspaces')
        .update(payload)
        .eq('id', id)
        .eq('owner_id', userId)
        .select('*')
        .maybeSingle()
      if (error) throw error
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                name: data?.name ?? w.name,
                type: data?.type ?? w.type,
                subtitle: data?.subtitle ?? w.subtitle,
                avatarUrl: data?.avatar_url ?? w.avatarUrl,
              }
            : w,
        ),
      )
    },
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetCardTransactions,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addFamilyMember,
    updateFamilyMember,
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
