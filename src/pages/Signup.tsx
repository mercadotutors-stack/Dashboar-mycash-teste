import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from '../components/ui/Icon'
import { ROUTES } from '../constants'

const ALLOWED_EMAILS = ['lucasmarteux@gmail.com', 'lidiane.cristina40@gmail.com']

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Se já estiver autenticado, redireciona
    if (user) {
      navigate(ROUTES.DASHBOARD)
    }
  }, [user, navigate])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    const emailLower = email.trim().toLowerCase()

    if (!email.trim()) {
      nextErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      nextErrors.email = 'E-mail inválido'
    } else if (!ALLOWED_EMAILS.includes(emailLower)) {
      nextErrors.email = 'E-mail não autorizado para cadastro.'
    }

    if (!password) {
      nextErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      nextErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrors({})

    const { error } = await signUp(email.trim(), password)

    if (error) {
      setErrors({ submit: error.message })
      setToast(`Erro: ${error.message}`)
      setTimeout(() => setToast(null), 4000)
    } else {
      setToast('Conta criada com sucesso! Redirecionando...')
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 2000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#C4E703] flex items-center justify-center">
              <Icon name="person_add" className="w-10 h-10 text-black" />
            </div>
            <div className="text-center">
              <h1 className="text-heading-xl font-bold text-text-primary">Criar Conta</h1>
              <p className="text-text-secondary text-sm mt-1">Cadastre-se para começar</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.email ? 'border-red-500' : 'border-border'
                }`}
                placeholder="seu@email.com"
                disabled={loading}
              />
              {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.password ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
              {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-12 rounded-full border bg-white px-4 text-body text-text-primary outline-none ${
                  errors.confirmPassword ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Digite a senha novamente"
                disabled={loading}
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              ) : null}
            </div>

            {errors.submit ? (
              <div className="rounded-full bg-red-50 border border-red-500 px-4 py-2">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full bg-black text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Link para login */}
          <div className="text-center pt-2">
            <p className="text-text-secondary text-sm">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-black font-semibold hover:underline"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 shadow-lg z-50">
          {toast}
        </div>
      ) : null}
    </div>
  )
}
