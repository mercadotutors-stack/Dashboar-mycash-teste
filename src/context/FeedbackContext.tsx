import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Toast } from '../components/ui/Toast'

type FeedbackType = 'success' | 'error' | 'info'

type FeedbackState = {
  message: string
  type: FeedbackType
}

type FeedbackContextValue = {
  show: (message: string, type?: FeedbackType, duration?: number) => void
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<FeedbackState | null>(null)
  const [duration, setDuration] = useState<number>(3000)

  const show = useCallback((message: string, type: FeedbackType = 'info', dur = 3000) => {
    setToast({ message, type })
    setDuration(dur)
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={duration}
          onClose={() => setToast(null)}
        />
      ) : null}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback deve ser usado dentro de FeedbackProvider')
  return ctx
}
