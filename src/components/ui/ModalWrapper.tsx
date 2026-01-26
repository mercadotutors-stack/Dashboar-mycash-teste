import { useEffect, useState } from 'react'

interface ModalWrapperProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

/**
 * Wrapper para modais com animações de entrada/saída
 * Aplica overlay fade-in e modal scale-in/fade-in
 */
export function ModalWrapper({ open, onClose, children, className = '' }: ModalWrapperProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(open)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      // Pequeno delay para garantir que o DOM está pronto
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Aguarda animação de saída antes de remover do DOM
      setTimeout(() => setShouldRender(false), 200)
    }
  }, [open])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Previne scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${isAnimating ? 'animate-fade-in' : 'animate-fade-out'}`}
      style={{ zIndex: 100 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/50 ${isAnimating ? 'animate-fade-in' : 'animate-fade-out'}`}
        style={{ animationDuration: '200ms' }}
      />

      {/* Modal */}
      <div
        className={`relative w-full h-full ${isAnimating ? 'animate-scale-in' : 'animate-scale-out'} ${className}`}
        style={{ animationDuration: '250ms' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
