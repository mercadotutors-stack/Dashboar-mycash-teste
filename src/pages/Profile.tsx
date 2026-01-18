import { useMemo, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { Icon } from '../components/ui/Icon'
import { AddMemberModal } from '../components/modals/AddMemberModal'

type Tab = 'info' | 'settings'

export default function Profile() {
  const { familyMembers, transactions } = useFinance()
  const [tab, setTab] = useState<Tab>('info')
  const [showAdd, setShowAdd] = useState(false)

  const mainUser = familyMembers[0]

  const incomeCats = useMemo(() => {
    const set = new Set<string>()
    transactions.filter((t) => t.type === 'income').forEach((t) => set.add(t.category))
    return Array.from(set)
  }, [transactions])

  const expenseCats = useMemo(() => {
    const set = new Set<string>()
    transactions.filter((t) => t.type === 'expense').forEach((t) => set.add(t.category))
    return Array.from(set)
  }, [transactions])

  return (
    <div className="min-h-screen w-full bg-bg-primary px-page py-6 flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-heading-xl font-bold text-text-primary">Perfil</h1>
        <div className="flex border-b border-border gap-4">
          <button
            onClick={() => setTab('info')}
            className={`pb-2 text-body font-semibold ${
              tab === 'info' ? 'text-text-primary border-b-2 border-black' : 'text-text-secondary'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`pb-2 text-body font-semibold ${
              tab === 'settings' ? 'text-text-primary border-b-2 border-black' : 'text-text-secondary'
            }`}
          >
            Configurações
          </button>
        </div>
      </header>

      {tab === 'info' ? (
        <div className="flex flex-col gap-6">
          {mainUser ? (
            <div className="rounded-xl border border-border bg-white p-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="w-28 h-28 rounded-full bg-gray-100 border border-border flex items-center justify-center text-heading-lg font-bold">
                {mainUser.name.charAt(0)}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h2 className="text-heading-lg font-semibold text-text-primary">{mainUser.name}</h2>
                <p className="text-body text-text-secondary">{mainUser.role}</p>
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <Icon name="user" className="w-4 h-4" />
                  {mainUser.email || 'email@exemplo.com'}
                </p>
                <p className="text-body font-semibold text-text-primary flex items-center gap-2">
                  <Icon name="credit-card" className="w-4 h-4" />
                  Renda mensal: R$ {mainUser.monthlyIncome?.toLocaleString('pt-BR') ?? '0,00'}
                </p>
              </div>
              <button className="h-10 px-4 rounded-full border border-border text-text-primary hover:bg-gray-100 text-sm">
                Editar Perfil
              </button>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-white p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-heading-md font-semibold text-text-primary">Membros da Família</h3>
              <button
                onClick={() => setShowAdd(true)}
                className="h-10 px-4 rounded-full bg-black text-white text-sm font-semibold flex items-center gap-2"
              >
                <Icon name="add" className="w-4 h-4" />
                Adicionar Membro da Família
              </button>
            </div>

            {familyMembers.length === 1 ? (
              <div className="rounded-lg border border-border bg-gray-50 p-4 text-text-secondary text-sm">
                Você ainda não adicionou outros membros. Inclua familiares para compartilhar o controle financeiro.
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg bg-gray-50 hover:bg-gray-100 transition border border-border px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white border border-border flex items-center justify-center text-body font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body font-semibold text-text-primary">{member.name}</span>
                      <span className="text-sm text-text-secondary">{member.role}</span>
                    </div>
                  </div>
                  <span className="text-body font-semibold text-text-primary">
                    R$ {member.monthlyIncome?.toLocaleString('pt-BR') ?? '0,00'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button className="h-11 px-5 rounded-full bg-red-500 text-white font-semibold flex items-center gap-2">
                <Icon name="logout" className="w-5 h-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <SectionCard title="Preferências de Exibição">
            <div className="flex flex-col gap-3">
              <Toggle label="Modo Escuro (em breve)" disabled />
              <Select
                label="Moeda padrão"
                options={[{ value: 'brl', label: 'Real Brasileiro (R$)' }]}
                value="brl"
                onChange={() => {}}
              />
              <Select
                label="Formato de data"
                options={[{ value: 'br', label: 'DD/MM/AAAA' }]}
                value="br"
                onChange={() => {}}
              />
            </div>
          </SectionCard>

          <SectionCard title="Notificações">
            <div className="flex flex-col gap-3">
              <Toggle label="Lembrete de vencimento de contas" defaultChecked />
              <Toggle label="Alerta de aproximação do limite de cartão" defaultChecked />
              <Toggle label="Resumo mensal por email" />
              <Toggle label="Notificações de novos objetivos alcançados" defaultChecked />
            </div>
          </SectionCard>

          <SectionCard title="Gerenciar Categorias">
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-text-primary">Categorias de Receita</h4>
              <TagList items={incomeCats} />
              <button className="h-10 px-4 rounded-full border border-border text-text-primary text-sm hover:bg-gray-100">
                Adicionar Categoria
              </button>
              <h4 className="text-sm font-semibold text-text-primary mt-2">Categorias de Despesa</h4>
              <TagList items={expenseCats} />
              <button className="h-10 px-4 rounded-full border border-border text-text-primary text-sm hover:bg-gray-100">
                Adicionar Categoria
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Dados e Privacidade">
            <div className="flex flex-col gap-3">
              <button className="h-10 px-4 rounded-full border border-border text-text-primary text-sm hover:bg-gray-100">
                Exportar Todos os Dados
              </button>
              <button className="h-10 px-4 rounded-full border border-red-500 text-red-600 text-sm hover:bg-red-50">
                Limpar Todos os Dados
              </button>
              <span className="text-xs text-text-secondary">Esta ação não pode ser desfeita</span>
            </div>
          </SectionCard>

          <SectionCard title="Sobre o mycash+">
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <span>Versão do sistema: v1.0.0</span>
              <span>Sistema de gestão financeira familiar</span>
              <div className="flex gap-4">
                <button className="text-text-primary underline">Termos de Uso</button>
                <button className="text-text-primary underline">Política de Privacidade</button>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      <AddMemberModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-3">
      <h3 className="text-heading-md font-semibold text-text-primary">{title}</h3>
      {children}
    </div>
  )
}

function Toggle({
  label,
  defaultChecked,
  disabled,
}: {
  label: string
  defaultChecked?: boolean
  disabled?: boolean
}) {
  const [checked, setChecked] = useState(!!defaultChecked)
  return (
    <label className={`flex items-center justify-between gap-2 ${disabled ? 'opacity-60' : ''}`}>
      <span className="text-body text-text-primary">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => setChecked(e.target.checked)}
        className="h-5 w-5"
      />
    </label>
  )
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-border bg-white px-3 text-body text-text-primary"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-text-secondary text-sm">Nenhuma categoria cadastrada.</span>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-text-secondary text-sm px-3 py-1"
        >
          {item}
          <Icon name="close" className="w-3 h-3" />
        </span>
      ))}
    </div>
  )
}
