# mycash+ - Gestão Financeira Familiar

Sistema completo de gestão financeira familiar desenvolvido com React, TypeScript, Vite e Tailwind CSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para maior segurança
- **Vite** - Build tool e dev server ultra-rápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento SPA
- **date-fns** - Manipulação e formatação de datas
- **Recharts** - Gráficos e visualizações
- **Supabase** - Backend como serviço (autenticação e banco de dados)
- **Heroicons** - Biblioteca de ícones

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React organizados por domínio
│   ├── layout/         # Componentes de layout (Sidebar, Header)
│   │   ├── Sidebar/    # Sidebar desktop com estados expanded/collapsed
│   │   └── Header/     # Header mobile para tablets/mobile
│   ├── dashboard/      # Componentes específicos do dashboard
│   │   ├── SummaryCards.tsx           # Cards de resumo financeiro
│   │   ├── ExpensesByCategoryCarousel.tsx  # Carrossel de categorias
│   │   ├── FinancialFlowChart.tsx     # Gráfico de fluxo financeiro
│   │   ├── CreditCardsWidget.tsx       # Widget de cartões
│   │   ├── UpcomingExpensesWidget.tsx # Próximas despesas
│   │   └── TransactionsTable.tsx      # Tabela de transações
│   ├── modals/         # Componentes de modais
│   │   ├── NewTransactionModal.tsx
│   │   ├── EditTransactionModal.tsx
│   │   ├── AddMemberModal.tsx
│   │   ├── EditMemberModal.tsx
│   │   ├── AddAccountCardModal.tsx
│   │   └── CardDetailsModal.tsx
│   └── ui/             # Componentes base reutilizáveis
│       ├── Icon.tsx
│       ├── CurrencyInput.tsx
│       ├── Tooltip.tsx
│       └── ModalWrapper.tsx
├── context/            # React Contexts para estado global
│   ├── AuthContext.tsx      # Autenticação de usuários
│   └── FinanceContext.tsx   # Gerenciamento financeiro completo
├── hooks/              # Custom hooks
│   ├── useAnimatedNumber.ts  # Animação de contagem de valores
│   └── useSidebar.ts         # Gerenciamento da sidebar
├── types/              # Definições TypeScript
│   └── index.ts        # Todas as interfaces e tipos
├── utils/              # Funções utilitárias
│   ├── currency.utils.ts    # Formatação de moeda
│   ├── date.utils.ts        # Formatação de datas
│   ├── array.utils.ts       # Manipulação de arrays
│   ├── calculation.utils.ts # Cálculos financeiros
│   ├── validation.utils.ts  # Validações
│   └── id.utils.ts          # Geração de IDs
├── constants/          # Constantes do sistema
│   └── index.ts        # Rotas, navegação, breakpoints
├── pages/              # Páginas/rotas principais
│   ├── Dashboard.tsx
│   ├── Cards.tsx
│   ├── Accounts.tsx
│   ├── Transactions.tsx
│   ├── Profile.tsx
│   └── MemberProfile.tsx   # Perfil individual de membros
├── styles/             # Estilos globais e tokens CSS
│   ├── tokens.css      # Variáveis do design system
│   └── globals.css     # Estilos globais e animações
└── lib/                # Bibliotecas e configurações
    ├── supabaseClient.ts   # Cliente Supabase
    └── uploadImage.ts      # Upload de imagens
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Lint do código
npm run lint
```

## 🔐 Configuração do Supabase

O projeto requer configuração do Supabase para funcionar completamente:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis de ambiente:
   ```env
   VITE_SUPABASE_URL=sua-url-do-supabase
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```
3. Execute o schema SQL em `supabase/schema.sql` no seu projeto Supabase
4. Crie um bucket chamado `avatars` no Storage do Supabase para upload de imagens

## 📐 Breakpoints Responsivos

O sistema é **100% mobile-first**:

- **Mobile (base)**: < 768px
- **Tablet (md)**: ≥ 768px e < 1280px
- **Desktop (lg)**: ≥ 1280px e < 1920px
- **Wide / 4K (xl)**: ≥ 1920px

### Comportamento por Breakpoint

- **Mobile/Tablet**: Header mobile com drawer, sidebar não renderiza
- **Desktop**: Sidebar expandida/collapsada, header mobile não renderiza
- **Sidebar e Header Mobile nunca coexistem**

## 🎨 Design System

O projeto utiliza variáveis CSS semânticas e primitivas mapeadas do design system Figma, organizadas em `src/styles/tokens.css`.

### Hierarquia de Variáveis

1. **Semânticas**: `--color-primary`, `--spacing-card`, `--border-radius-lg`
2. **Primitivas**: `--gray-900`, `--green-500`, `--red-600`
3. **NUNCA hardcoded**: sempre usar tokens do design system

### Cores Principais

- `--color-primary`: Verde (#22C55E)
- `--color-danger`: Vermelho (#DC2626)
- `--color-text-primary`: Preto/Cinza escuro (#171717)
- `--color-sidebar-active`: Verde-limão (#CDFF00)

## 🎭 Animações e Transições

O sistema possui animações suaves e consistentes:

- **Transições de navegação**: Fade-out/fade-in (200ms)
- **Cards**: Fade-in + slide-up (300ms) com stagger
- **Modais**: Overlay fade-in (200ms) + modal scale-in (250ms)
- **Toasts**: Slide-in da direita (300ms)
- **Hover**: Transições suaves em botões e cards
- **Respeita `prefers-reduced-motion`**: Desabilita animações quando necessário

## 📝 Entidades Principais

O sistema gerencia 5 entidades principais:

- **Transaction** - Transações financeiras (receitas/despesas)
- **Goal** - Objetivos financeiros
- **CreditCard** - Cartões de crédito
- **BankAccount** - Contas bancárias
- **FamilyMember** - Membros da família

## 🗺️ Rotas

- `/` - Dashboard (página inicial)
- `/cards` - Gerenciamento de cartões
- `/accounts` - Gerenciamento de contas bancárias
- `/transactions` - Visualização e gerenciamento de transações
- `/profile` - Perfil do usuário e membros da família
- `/profile/:memberId` - Perfil individual de um membro

## ✨ Funcionalidades Implementadas

### ✅ Navegação e Layout
- Sidebar desktop com estados expanded/collapsed
- Header mobile para tablets e mobile
- Navegação fluida entre seções
- Transições suaves de página

### ✅ Dashboard
- Cards de resumo financeiro (Saldo, Receitas, Despesas)
- Carrossel de gastos por categoria
- Gráfico de fluxo financeiro
- Widget de cartões de crédito
- Próximas despesas
- Tabela de transações com paginação

### ✅ Gerenciamento de Transações
- Adicionar nova transação (receita/despesa)
- Editar transações existentes
- Deletar transações
- Filtros avançados (membro, período, tipo, busca)
- Validações completas

### ✅ Gerenciamento de Membros
- Adicionar membros da família
- Editar perfil de membros
- Upload de avatar para Supabase Storage
- Perfil individual com estatísticas
- Filtros por membro

### ✅ Gerenciamento de Cartões e Contas
- Adicionar cartões de crédito
- Adicionar contas bancárias
- Editar cartões e contas
- Visualizar detalhes completos
- Cálculo automático de limites e saldos

### ✅ Filtros e Busca
- Busca em tempo real
- Filtro por tipo de transação
- Filtro por membro da família
- Seletor de período de datas
- Filtros combinados (AND lógico)

### ✅ Formatação e Utilitários
- Formatação de moeda brasileira (R$ 1.234,56)
- Formatação de datas (DD/MM/AAAA)
- Formatação compacta para gráficos
- Validações (email, CPF, datas)
- Cálculos financeiros (percentuais, diferenças)

### ✅ Acessibilidade
- Navegação completa por teclado
- Foco visível em elementos interativos
- aria-labels em botões de ícone
- Contraste WCAG AA
- Suporte a leitores de tela

## 🧪 Testes e Validação

Para validar o sistema:

1. **Fluxo de usuário completo**:
   - Login → Dashboard → Adicionar transação → Filtrar → Ver perfil

2. **Validação de cálculos**:
   - Verifique se saldos, receitas e despesas estão corretos
   - Confirme percentuais de categoria

3. **Validação de responsividade**:
   - Teste em 375px, 768px, 1280px e 1920px
   - Verifique que sidebar/header alternam corretamente
   - Confirme que não há overflow horizontal

4. **Validação de acessibilidade**:
   - Navegue apenas com teclado (Tab, Enter, Escape)
   - Use leitor de tela para verificar anúncios

## 📦 Próximos Passos

- [ ] Integração completa com Supabase (atualmente parcial)
- [ ] Testes unitários automatizados
- [ ] Testes E2E com Playwright/Cypress
- [ ] Modo escuro
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações push
- [ ] App mobile (React Native)

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuidores

Desenvolvido para gestão financeira familiar.

---

**Versão**: 1.0.0  
**Última atualização**: 2024
