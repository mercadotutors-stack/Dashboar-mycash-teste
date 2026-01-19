import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Icon } from '../components/ui/Icon'
import { ROUTES } from '../constants'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se há um hash de recuperação na URL
    const hash = searchParams.get('hash')
    if (!hash) {
      // Se não houver hash, redireciona para login
      navigate(ROUTES.LOGIN)
    }
  }, [searchParams, navigate])

  const validate = () => {
    const nextErrors: Record<string, string> = {}
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

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrors({ submit: error.message })
        setToast(`Erro: ${error.message}`)
        setTimeout(() => setToast(null), 4000)
      } else {
        setToast('Senha redefinida com sucesso! Redirecionando...')
        setTimeout(() => {
          navigate(ROUTES.LOGIN)
        }, 2000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao redefinir senha'
      setErrors({ submit: errorMessage })
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="lock" className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-center">
              <h1 className="text-heading-xl font-bold text-text-primary">Redefinir Senha</h1>
              <p className="text-text-secondary text-sm mt-1">Digite sua nova senha</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Nova Senha</label>
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
              <label className="text-sm font-semibold text-text-primary">Confirmar Nova Senha</label>
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
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>

          {/* Link para login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-black font-semibold hover:underline text-sm"
            >
              Voltar para Login
            </button>
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
