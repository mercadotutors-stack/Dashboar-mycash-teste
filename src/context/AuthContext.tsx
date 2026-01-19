import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ALLOWED_EMAILS = ['lucasmarteux@gmail.com', 'lidiane.cristina40@gmail.com']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuta mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Erro desconhecido ao fazer login') }
    }
  }

  const signUp = async (email: string, password: string) => {
    // Valida se o e-mail está na lista permitida
    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      return {
        error: new Error(
          'E-mail não autorizado. Apenas e-mails específicos podem se cadastrar.'
        ),
      }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error: error ? new Error(error.message) : null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Erro desconhecido ao criar conta') }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
