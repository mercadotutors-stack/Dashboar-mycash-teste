import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar estado da sidebar
 * Armazena preferência no localStorage para persistência
 */
export function useSidebar() {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Tenta carregar preferência do localStorage
    const saved = localStorage.getItem('sidebar-expanded')
    return saved ? saved === 'true' : true // Padrão: expandido
  })

  const toggle = () => {
    setIsExpanded((prev) => !prev)
  }

  // Salva preferência no localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', String(isExpanded))
  }, [isExpanded])

  return {
    isExpanded,
    toggle,
    setIsExpanded,
  }
}
