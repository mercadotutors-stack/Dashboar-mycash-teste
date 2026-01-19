import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { Icon } from '../../ui/Icon'
import { ROUTES } from '../../../constants'

interface UserProfileProps {
  isExpanded: boolean
}

export function UserProfile({ isExpanded }: UserProfileProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  const userEmail = user?.email || ''
  const userName = userEmail.split('@')[0] || 'Usuário'
  const userInitial = userName.charAt(0).toUpperCase()

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
          className="flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'var(--color-sidebar-avatar-bg)',
          }}
        >
          {userInitial}
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
