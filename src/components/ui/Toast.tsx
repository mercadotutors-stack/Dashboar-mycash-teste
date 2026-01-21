import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

/**
 * Componente de Toast com animação slide-in-right
 */
export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 250) // Aguarda animação de saída
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
        ? 'bg-red-500'
        : 'bg-black'

  return (
    <div
      className={`fixed bottom-6 right-6 rounded-full ${bgColor} text-white px-4 py-2 shadow-lg z-[9999] ${
        isVisible ? 'animate-slide-in-right' : 'animate-slide-out-right'
      }`}
      style={{ animationDuration: isVisible ? '300ms' : '250ms' }}
    >
      {message}
    </div>
  )
}
