interface UserProfileProps {
  isExpanded: boolean
}

export function UserProfile({ isExpanded }: UserProfileProps) {
  // Dados mock do usuário (futuramente virá do contexto)
  const user = {
    name: 'Lucas Marte',
    email: 'lucasmarte@gmail.com',
    avatar: '👤', // Temporário, será substituído por imagem
  }

  return (
    <div className={`
      flex-shrink-0
      border-t border-sidebar-border
      ${isExpanded ? 'w-[236px] pt-4' : 'w-full pt-md'}
    `}>
      <div className={`
        flex items-center
        ${isExpanded ? 'gap-3' : 'justify-center'}
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
          {user.avatar}
        </div>

        {/* Informações (apenas quando expandido) */}
        {isExpanded && (
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
              {user.name}
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
              {user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
