import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useFinance } from '../../../context/FinanceContext'
import { Icon } from '../../ui/Icon'
import { ROUTES } from '../../../constants'

interface UserProfileProps {
  isExpanded: boolean
}

export function UserProfile({ isExpanded }: UserProfileProps) {
  const { user, signOut } = useAuth()
  const { familyMembers } = useFinance()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  // Busca o membro da família correspondente ao email do usuário logado
  // Se não encontrar, usa o primeiro membro (geralmente é o dono da conta)
  const currentMember = useMemo(() => {
    if (!user?.email || familyMembers.length === 0) return null
    
    const userEmail = user.email.toLowerCase()
    
    // Primeiro tenta encontrar por email
    const foundByEmail = familyMembers.find((member) => member.email.toLowerCase() === userEmail)
    if (foundByEmail) return foundByEmail
    
    // Se não encontrar, usa o primeiro membro (dono da conta)
    return familyMembers[0] || null
  }, [user?.email, familyMembers])

  const userEmail = user?.email || ''
  const userName = currentMember?.name || userEmail.split('@')[0] || 'Usuário'
  const userInitial = userName.charAt(0).toUpperCase()
  const avatarUrl = currentMember?.avatarUrl

  return (
    <div className={`
      flex-shrink-0
      border-t border-sidebar-border
      ${isExpanded ? 'w-[236px] pt-4' : 'w-full pt-md'}
    `}>
      <div className={`
        flex items-center
        ${isExpanded ? 'gap-3' : 'justify-center flex-col gap-2'}
      `}>
        {/* Avatar */}
        <div 
          className="flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden transition-avatar"
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--color-sidebar-avatar-bg)',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.textContent = userInitial
                }
              }}
            />
          ) : (
            userInitial
          )}
        </div>

        {/* Informações (apenas quando expandido) */}
        {isExpanded && (
          <>
            <div className="min-w-0 flex-1 flex flex-col" style={{ gap: '7px' }}>
              <p 
                className="truncate font-semibold"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '20px',
                  letterSpacing: '0.3px',
                  color: 'var(--color-sidebar-active-text)',
                }}
              >
                {userName}
              </p>
              <p 
                className="truncate"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  letterSpacing: '0.3px',
                  color: 'var(--color-sidebar-active-text)',
                }}
              >
                {userEmail}
              </p>
            </div>
            {/* Botão de logout */}
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-8 h-8 rounded-full border border-sidebar-border flex items-center justify-center hover:bg-red-50 hover:border-red-500 transition-colors"
              aria-label="Sair"
              title="Sair"
            >
              <Icon name="logout" className="w-4 h-4 text-red-600" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
