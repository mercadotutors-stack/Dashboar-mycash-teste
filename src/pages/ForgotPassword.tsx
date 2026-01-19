import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Icon } from '../components/ui/Icon'
import { ROUTES } from '../constants'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!email.trim()) {
      nextErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'E-mail inválido'
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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      })

      if (error) {
        setErrors({ submit: error.message })
        setToast(`Erro: ${error.message}`)
        setTimeout(() => setToast(null), 4000)
      } else {
        setEmailSent(true)
        setToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
        setTimeout(() => setToast(null), 5000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar e-mail de recuperação'
      setErrors({ submit: errorMessage })
      setToast(`Erro: ${errorMessage}`)
      setTimeout(() => setToast(null), 4000)
    }

    setLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8 flex flex-col gap-6 items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="check" className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-heading-xl font-bold text-text-primary">E-mail Enviado!</h1>
              <p className="text-text-secondary text-sm mt-2">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </p>
              <p className="text-text-secondary text-sm mt-2">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
            </div>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="h-12 rounded-full bg-black text-white font-semibold hover:opacity-90 w-full"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon name="lock_reset" className="w-10 h-10 text-blue-600" />
            </div>
            <div className="text-center">
              <h1 className="text-heading-xl font-bold text-text-primary">Recuperar Senha</h1>
              <p className="text-text-secondary text-sm mt-1">
                Digite seu e-mail para receber um link de recuperação
              </p>
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
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>

          {/* Links */}
          <div className="text-center pt-2 flex flex-col gap-2">
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
