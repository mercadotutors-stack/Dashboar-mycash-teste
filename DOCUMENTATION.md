# mycash+ — Documentação

## Progresso

### Fundação (1-4)
- [x] PROMPT 0: Análise e Planejamento Inicial
- [ ] PROMPT 1: Estrutura Base e Configuração
- [ ] PROMPT 2: Sistema de Layout e Navegação Desktop
- [ ] PROMPT 3: Sistema de Layout e Navegação Mobile
- [ ] PROMPT 4: Context Global e Gerenciamento de Estado

### Dashboard Core (5-11)
- [ ] PROMPT 5: Cards de Resumo Financeiro
- [ ] PROMPT 6: Header do Dashboard com Controles
- [ ] PROMPT 7: Carrossel de Gastos por Categoria
- [ ] PROMPT 8: Gráfico de Fluxo Financeiro
- [ ] PROMPT 9: Widget de Cartões de Crédito
- [ ] PROMPT 10: Widget de Próximas Despesas
- [ ] PROMPT 11: Tabela de Transações Detalhada

### Modais e Formulários (12-16)
- [ ] PROMPT 12: Modal de Nova Transação
- [ ] PROMPT 13: Modal de Adicionar Membro
- [ ] PROMPT 14: Modal de Adicionar Cartão
- [ ] PROMPT 15: Modal de Detalhes do Cartão
- [ ] PROMPT 16: Modal de Filtros Mobile

### Views Completas (17-20)
- [ ] PROMPT 17: View Completa de Cartões
- [ ] PROMPT 18: View Completa de Transações
- [ ] PROMPT 19: View de Perfil - Aba Informações
- [ ] PROMPT 20: View de Perfil - Aba Configurações

### Polimento Final (21-24)
- [ ] PROMPT 21: Animações e Transições Globais
- [ ] PROMPT 22: Formatação e Utilitários
- [ ] PROMPT 23: Responsividade e Ajustes Finais
- [ ] PROMPT 24: Testes e Validação Final

---

## PROMPT 0: Análise e Planejamento Inicial

**Status:** ✅ Em análise | **Data:** 2026-01-17 | **Build:** N/A

### 📋 Objetivo
Mapear todos os componentes visuais, variáveis do design system, estrutura de navegação e definir arquitetura do projeto antes de iniciar implementação.

### 🎨 Componentes Identificados na Dashboard

#### Layout Principal
- **Sidebar Desktop** (expanded/collapsed)
  - Logo "Mycash+"
  - Navegação: Home (ativo), Cartões
  - Perfil do usuário (avatar + email)
  - Estado colapsado: apenas ícones

- **Header Desktop**
  - Logo + botão de toggle sidebar
  - Barra de pesquisa "Pesquisar"
  - Filtro/sort + seletor de data (01 Jan - 31 Jan 2026)
  - Avatares de membros (3 círculos)
  - Botão "Nova transação" (destaque)

- **Header Mobile** (< 1280px)
  - Botão menu (abre drawer)
  - Ações principais
  - Não renderiza junto com sidebar

#### Componentes de Conteúdo

1. **Cards de Categorias de Despesas** (grid 4 colunas)
   - Progresso circular (verde)
   - Percentual
   - Nome da categoria
   - Valor (R$)

2. **Resumo Financeiro** (3 cards)
   - Saldo total (ícone $, valor azul)
   - Receitas (seta verde para baixo)
   - Despesas (seta vermelha para cima)

3. **Cards & Contas**
   - Lista de contas/cartões
   - Logo do banco (Nubank, Inter, Picpay)
   - Valor disponível
   - Data de vencimento
   - Últimos 4 dígitos do cartão

4. **Gráfico de Fluxo Financeiro**
   - Tipo: área/linha
   - Eixo Y: R$ 0,00 - R$ 17.500 (incrementos de R$ 2.500)
   - Eixo X: meses (JAN - DEZ)
   - Legenda: Receitas (amarelo/verde), Despesas (vermelho/rosa)

5. **Próximas Despesas**
   - Lista de despesas pendentes
   - Ícone de check
   - Valor, data de vencimento
   - Forma de pagamento

6. **Extrato Detalhado** (tabela)
   - Barra de busca "Buscar lançamentos"
   - Dropdown de filtro "Despesas"
   - Colunas: Membro, Datas, Descrição, Categorias, Conta/cartão, Parcelas, Valor
   - Paginação (1 2 3 4 5)

### 🎨 Variáveis do Design System

#### Cores (inferidas da análise visual)

**Semânticas:**
- `--color-background-primary` (branco #FFFFFF)
- `--color-background-secondary` (cinza claro - cards, sidebar inativo)
- `--color-primary` (verde brilhante - navegação ativa, indicadores positivos)
- `--color-secondary` (azul - saldo total)
- `--color-danger` (vermelho - despesas, indicadores negativos)
- `--color-text-primary` (cinza escuro/preto)
- `--color-text-secondary` (cinza médio - datas, números de cartão)
- `--color-border` (cinza claro)
- `--color-accent-receita` (amarelo/verde - receitas no gráfico)
- `--color-accent-despesa` (vermelho/rosa - despesas no gráfico)

**Primitivas (a confirmar no Figma):**
- Família de cinzas: `--gray-50` até `--gray-900`
- Verde: `--green-*` (variantes)
- Azul: `--blue-*` (variantes)
- Vermelho: `--red-*` (variantes)
- Amarelo: `--yellow-*` (variantes)

#### Espaçamento

**Semânticas:**
- `--spacing-page` (padding do conteúdo principal)
- `--spacing-section` (margem entre seções)
- `--spacing-card` (padding interno dos cards)
- `--spacing-grid` (gap entre cards no grid)

**Primitivas:**
- `--spacing-xs` (4px)
- `--spacing-sm` (8px)
- `--spacing-md` (16px)
- `--spacing-lg` (24px)
- `--spacing-xl` (32px)
- `--spacing-2xl` (48px)

**Responsivo:**
- Mobile: `px-4` (16px)
- Tablet: `px-6` (24px)
- Desktop: `px-8` (32px)

#### Tipografia

**Semânticas:**
- `--font-family-sans` (fonte sans-serif padrão)
- `--font-size-heading-lg`
- `--font-size-heading-md`
- `--font-size-body`
- `--font-size-caption`
- `--font-weight-bold`
- `--font-weight-medium`
- `--font-weight-regular`

**Escala Responsiva:**
- Mobile: reduzir ~15% dos tamanhos base
- Desktop: tamanhos completos
- Progressivo: `text-base md:text-lg lg:text-xl`

#### Shapes

**Semânticas:**
- `--border-radius-sm` (bordas pequenas)
- `--border-radius-md` (cards, inputs)
- `--border-radius-lg` (botões grandes)
- `--border-radius-full` (círculos - avatares, progresso)
- `--shape-circle` (avatares, indicadores)

### 🧭 Estrutura de Navegação

#### Desktop (≥ 1280px)
- **Sidebar visível** por padrão
- **Estados:** Expanded (larga com texto) | Collapsed (estreita, apenas ícones)
- **Comportamento:** Sidebar empurra conteúdo (não sobrepõe)
- **Navegação:**
  - Home (ativo)
  - Cartões
  - Transações (implícito)
  - Perfil (implícito)

#### Mobile/Tablet (< 1280px)
- **Sidebar não renderiza**
- **Header Mobile** aparece
- **Menu drawer** via botão de menu
- **Navegação:** overlay/drawer

#### Transições
- Toggle sidebar (desktop): animação suave de largura
- Mudança de página: feedback visual claro no item ativo
- Responsive: breakpoint em 1280px muda layout completamente

### 📐 Breakpoints Oficiais

```
Mobile (base): < 768px
Tablet: ≥ 768px e < 1280px
Desktop: ≥ 1280px e < 1920px
Wide / 4K: ≥ 1920px
```

### 🏗️ Arquitetura Proposta

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── Header/
│   │   │   ├── HeaderDesktop.tsx
│   │   │   └── HeaderMobile.tsx
│   │   └── Layout.tsx
│   ├── dashboard/
│   │   ├── ExpenseCategoryCard.tsx
│   │   ├── FinancialSummary.tsx
│   │   ├── CardsAccounts.tsx
│   │   ├── FinancialFlowChart.tsx
│   │   ├── UpcomingExpenses.tsx
│   │   └── DetailedStatement.tsx
│   ├── cards/
│   │   └── CardItem.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   └── TransactionItem.tsx
│   ├── profile/
│   │   └── ProfileSection.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       ├── Avatar.tsx
│       └── ProgressCircle.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Cards.tsx
│   ├── Transactions.tsx
│   └── Profile.tsx
├── hooks/
│   ├── useSidebar.ts
│   └── useResponsive.ts
├── services/
│   └── api.ts (Supabase)
├── types/
│   └── index.ts
├── styles/
│   ├── tokens.css (variáveis CSS)
│   └── globals.css
├── utils/
│   └── formatCurrency.ts
└── App.tsx
```

### 🎯 Princípios de Arquitetura

1. **Mobile-First:** Base sempre em < 768px, evolução para breakpoints maiores
2. **Layout Fluido:** Containers com `width: 100%`, nunca fixo
3. **Componentização:** Componentes pequenos, reutilizáveis e compostos
4. **Separação de Responsabilidades:**
   - Páginas apenas compõem componentes
   - Lógica de negócio em hooks/services
   - UI pura em componentes

5. **Hierarquia de Variáveis:**
   1. Semânticas (`--color-primary`)
   2. Primitivas (`--gray-900`)
   3. Conversão inteligente (hex/px → token mais próximo)
   4. **NUNCA hardcoded**

### 🔄 Estratégia de Componentização

- **Atômicos:** Button, Input, Badge, Avatar
- **Moléculas:** Card, SidebarItem, TransactionItem
- **Organismos:** Sidebar, Header, FinancialSummary
- **Templates:** Layout (Sidebar + Header + Main)
- **Páginas:** Dashboard, Cards, Transactions, Profile

### 📝 Próximos Passos

1. Validar variáveis no Figma (via MCP)
2. Confirmar valores exatos de cores e espaçamentos
3. Criar estrutura de pastas (PROMPT 1)
4. Definir tokens no CSS (PROMPT 2)
5. Implementar layout base (PROMPT 3)

---

## Notas Importantes

### Regras Críticas
- **PROMPT 4**: NÃO usar localStorage/sessionStorage, apenas React state (useState, useReducer)
- **Breakpoints**: Desktop ≥1024px, Tablet 641-1023px, Mobile ≤640px
- **Hierarquia de variáveis**: Semântica → Primitiva → Conversão → NUNCA hardcoded
- **Layout Fluido**: Containers principais sempre `width: 100%`, nunca fixo
- **Mobile-First**: Base sempre em <768px, evolução progressiva

---

## PROMPT 1: Estrutura Base e Configuração

**Status:** ⏳ Pendente | **Categoria:** Fundação | **Dependências:** PROMPT 0

### Objetivo
Configurar estrutura base do projeto React com TypeScript, Vite, Tailwind CSS e organizar estrutura de pastas seguindo boas práticas.

### Componentes a Criar
- Estrutura de pastas: components, contexts, hooks, types, utils, constants
- Configuração Tailwind CSS
- Tipos TypeScript: Transaction, Goal, CreditCard, BankAccount, FamilyMember
- Configuração React Router com 5 rotas principais

### Requisitos Técnicos
- Configurar estrutura de pastas com organização por domínio
- Configurar Tailwind para reconhecer variáveis do Figma
- Mapear todos tokens semânticos e primitivos no tailwind.config
- Criar tipos TypeScript completos para 5 entidades principais
- Configurar React Router (single page application)

### Responsividade
- Desktop (≥1024px): [a definir em implementação]
- Tablet (641-1023px): [a definir em implementação]
- Mobile (≤640px): [a definir em implementação]

### Tokens Utilizados
- Serão definidos no PROMPT 2 (Design System)

---

## PROMPT 2: Sistema de Layout e Navegação Desktop

**Status:** ⏳ Pendente | **Categoria:** Fundação | **Dependências:** PROMPT 1

### Objetivo
Implementar sidebar desktop com estados expandido e colapsado, com transições suaves e sistema de tooltips.

### Componentes a Criar
- Sidebar.tsx (estados expanded/collapsed)
- SidebarItem.tsx
- UserProfile.tsx
- Botão toggle sidebar
- Sistema de tooltips

### Requisitos Técnicos
- Sidebar ocupa lado esquerdo com altura total viewport
- Dois estados: expandido (logo + texto) e colapsado (ícones apenas)
- Botão circular na borda direita para toggle
- Transições suaves de largura (~300ms)
- Conteúdo principal ajusta margem esquerda de forma animada
- Tooltips aparecem ao hover em itens quando colapsado
- Item ativo: fundo preto, texto branco, ícone verde-limão
- Itens inativos: fundo transparente, texto cinza

### Responsividade
- Desktop (≥1024px): Sidebar visível, dois estados funcionais
- Tablet (641-1023px): Sidebar não renderiza
- Mobile (≤640px): Sidebar não renderiza

### Tokens Utilizados
- Semânticas: `--color-primary`, `--color-text-primary`, `--color-text-secondary`, `--spacing-*`
- Primitivas: `--gray-*`, `--green-*`

---

## PROMPT 3: Sistema de Layout e Navegação Mobile

**Status:** ⏳ Pendente | **Categoria:** Fundação | **Dependências:** PROMPT 1

### Objetivo
Implementar header mobile que substitui sidebar em viewports <1024px, com menu dropdown e navegação via drawer.

### Componentes a Criar
- HeaderMobile.tsx (fixo no topo)
- MenuDropdown.tsx (drawer que desliza)
- Overlay escuro semi-transparente

### Requisitos Técnicos
- Header fixo no topo, largura total, visível durante scroll
- Logo "mycash+" à esquerda, avatar clicável à direita
- Menu dropdown desliza de cima para baixo com animação
- Dropdown não é fullscreen (cobre conteúdo mas não tela inteira)
- Lista todos itens de navegação com ícone e texto
- Item atual destacado com fundo preto
- Botão "Sair" vermelho na parte inferior
- Fechamento: clicar item, clicar X, clicar fora (overlay)

### Responsividade
- Desktop (≥1024px): Header mobile não renderiza
- Tablet (641-1023px): Header mobile visível, sidebar não existe
- Mobile (≤640px): Header mobile visível, sidebar não existe

### Tokens Utilizados
- Semânticas: `--color-danger`, `--color-bg-primary`, `--spacing-*`
- Primitivas: `--gray-*`, `--red-*`

---

## PROMPT 4: Context Global e Gerenciamento de Estado

**Status:** ⏳ Pendente | **Categoria:** Fundação | **Dependências:** PROMPT 1

### Objetivo
Criar FinanceProvider com gerenciamento de estado global para todas as entidades e cálculos financeiros.

### Componentes a Criar
- FinanceProvider.tsx (Context Provider)
- useFinance.ts (hook customizado)
- Funções CRUD para 5 entidades
- Funções de cálculo derivadas

### Requisitos Técnicos
**⚠️ REGRA CRÍTICA: NÃO usar localStorage/sessionStorage/browser storage. Apenas React state (useState, useReducer).**

- Provider no nível mais alto da árvore
- Arrays: transactions, goals, creditCards, bankAccounts, familyMembers
- Funções CRUD: adicionar, atualizar, deletar para cada entidade
- Estados de filtros: selectedMember, dateRange, transactionType, searchText
- Funções de cálculo:
  - getFilteredTransactions (aplica todos filtros)
  - calculateTotalBalance
  - calculateIncomeForPeriod
  - calculateExpensesForPeriod
  - calculateExpensesByCategory
  - calculateCategoryPercentage
  - calculateSavingsRate
- Hook useFinance encapsula useContext
- Dados mock iniciais: 3 membros, 3 cartões, 20-30 transações, 4 objetivos

### Responsividade
- N/A (lógica de estado, não afeta layout)

### Tokens Utilizados
- N/A (gerenciamento de estado)

---

## PROMPT 5: Cards de Resumo Financeiro

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4

### Objetivo
Criar três cards de resumo: Saldo Total, Receitas e Despesas, com animações de contagem.

### Componentes a Criar
- BalanceCard.tsx (Saldo Total - fundo preto)
- IncomeCard.tsx (Receitas - fundo branco)
- ExpenseCard.tsx (Despesas - fundo branco)

### Requisitos Técnicos
- BalanceCard: fundo preto, texto branco, círculo verde-limão desfocado decorativo
- Badge com crescimento percentual vs mês anterior
- IncomeCard: fundo branco, seta verde diagonal (baixo-esquerda)
- ExpenseCard: fundo branco, seta vermelha diagonal (cima-direita)
- Valores formatados como moeda brasileira (R$ X.XXX,XX)
- Valores vêm do contexto (calculateTotalBalance, etc)
- Animações de contagem: zero até valor final em ~800ms
- Layout: horizontal no desktop, vertical no mobile

### Responsividade
- Desktop (≥1024px): 3 cards horizontais, proporções variáveis
- Tablet (641-1023px): 3 cards verticais ou 2+1
- Mobile (≤640px): 3 cards verticais, largura total cada

### Tokens Utilizados
- Semânticas: `--color-primary`, `--color-danger`, `--color-text-primary`, `--spacing-card`
- Primitivas: `--gray-*`, `--green-*`, `--red-*`

---

## PROMPT 6: Header do Dashboard com Controles

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4

### Objetivo
Implementar barra de controles superior com busca, filtros, seletor de período e avatares de membros.

### Componentes a Criar
- DashboardHeader.tsx
- SearchBar.tsx (busca em tempo real)
- FilterPopover.tsx (desktop)
- FilterModal.tsx (mobile)
- DateRangePicker.tsx
- MemberAvatars.tsx

### Requisitos Técnicos
- Busca em tempo real (sem Enter), case-insensitive, busca em descrição e categoria
- Botão filtros: popover no desktop, modal no mobile
- FilterPopover: glassmorphism, opções de tipo (Todos/Receitas/Despesas)
- DateRangePicker: calendário interativo, seleção de intervalo, atalhos rápidos
- MemberAvatars: avatares sobrepostos, hover cresce, clique filtra por membro
- Botão "Nova Transação" destacado preto, largura total no mobile

### Responsividade
- Desktop (≥1024px): Barra completa horizontal, larguras fixas
- Tablet (641-1023px): Alguns elementos se adaptam
- Mobile (≤640px): Busca largura total, filtros em modal fullscreen

### Tokens Utilizados
- Semânticas: `--color-border`, `--spacing-*`, `--border-radius-*`
- Primitivas: `--gray-*`

---

## PROMPT 7: Carrossel de Gastos por Categoria

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4

### Objetivo
Criar carrossel horizontal com cards de categorias mostrando gráfico donut e percentual.

### Componentes a Criar
- ExpensesByCategoryCarousel.tsx
- CategoryDonutCard.tsx

### Requisitos Técnicos
- Cards de 160px largura, fundo branco, borda cinza
- Gráfico donut 64px: anel externo colorido (percentual), interno vazio
- Cores rotativas: verde-limão, preto, cinza médio
- Percentual centralizado no donut (1 casa decimal)
- Nome da categoria (truncado se longo)
- Valor formatado como moeda
- Scroll horizontal: mouse wheel, arrastar, setas de navegação
- Setas aparecem no hover, deslocam ~200px
- Gradiente fade nas bordas do carrossel
- Hover: borda muda para verde-limão

### Responsividade
- Desktop (≥1024px): Setas visíveis no hover
- Tablet (641-1023px): Scroll touch + setas
- Mobile (≤640px): Apenas scroll touch, sem setas

### Tokens Utilizados
- Semânticas: `--color-primary`, `--border-radius-md`
- Primitivas: `--gray-*`, `--green-*`

---

## PROMPT 8: Gráfico de Fluxo Financeiro

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4

### Objetivo
Implementar gráfico de área mostrando evolução de receitas e despesas ao longo dos meses.

### Componentes a Criar
- FinancialFlowChart.tsx (usando Recharts ou similar)

### Requisitos Técnicos
- Card grande com título "Fluxo Financeiro" e legenda
- Gráfico de área com altura 300px, largura 100%
- Eixo X: meses abreviados (Jan, Fev, etc)
- Eixo Y: valores monetários compactos (R$ 2k, R$ 4k, etc)
- Grid horizontal tracejado sutil
- Área receitas: linha verde-limão, gradiente verde 30% opaco
- Área despesas: linha preta, gradiente preto 10% opaco
- Tooltip interativo com linha vertical seguindo mouse
- Tooltip mostra: mês, receitas, despesas (formatados)
- Dados mock de 7 meses por enquanto

### Responsividade
- Desktop (≥1024px): Gráfico completo, tooltip detalhado
- Tablet (641-1023px): Altura reduzida proporcionalmente
- Mobile (≤640px): Altura menor, labels simplificados

### Tokens Utilizados
- Semânticas: `--color-primary`, `--color-text-secondary`, `--spacing-section`
- Primitivas: `--gray-*`, `--green-*`

---

## PROMPT 9: Widget de Cartões de Crédito

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4

### Objetivo
Criar widget listando cartões de crédito com informações de fatura e limite.

### Componentes a Criar
- CreditCardsWidget.tsx
- CardItem.tsx (item individual de cartão)

### Requisitos Técnicos
- Container com fundo cinza claro, bordas arredondadas
- Header: ícone + título "Cartões", botão "+" para adicionar
- Lista vertical de cartões do contexto
- Cada cartão: bloco quadrado colorido (tema), nome, fatura, limite disponível, percentual
- Badge circular com percentual de uso
- Hover: card eleva (translateY), sombra aumenta
- Clique: abre modal de detalhes
- Paginação se >3 cartões visíveis

### Responsividade
- Desktop (≥1024px): Lista vertical completa
- Tablet (641-1023px): Grid 2 colunas se apropriado
- Mobile (≤640px): 1 coluna, swipe horizontal para paginação

### Tokens Utilizados
- Semânticas: `--color-bg-secondary`, `--border-radius-md`, `--spacing-card`
- Primitivas: `--gray-*`

---

## PROMPT 10: Widget de Próximas Despesas

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4

### Objetivo
Criar widget listando despesas pendentes ordenadas por data de vencimento.

### Componentes a Criar
- UpcomingExpenses.tsx

### Requisitos Técnicos
- Widget branco, borda clara, cantos arredondados
- Header: ícone carteira + "Próximas despesas", botão "+"
- Lista de despesas tipo "expense" não pagas
- Ordenação: data de vencimento crescente
- Cada item: descrição, data "Vence dia DD/MM", conta/cartão, valor
- Botão check: ao clicar, marca como paga, remove da lista, anima
- Se despesa recorrente, cria próxima ocorrência automaticamente
- Estado vazio: ícone check verde, mensagem "Nenhuma despesa pendente"

### Responsividade
- Desktop (≥1024px): Lista vertical completa
- Tablet (641-1023px): Ajuste de espaçamento
- Mobile (≤640px): Items mais compactos, touch-friendly

### Tokens Utilizados
- Semânticas: `--color-primary`, `--color-text-secondary`, `--border-radius-md`
- Primitivas: `--gray-*`, `--green-*`

---

## PROMPT 11: Tabela de Transações Detalhada

**Status:** ⏳ Pendente | **Categoria:** Dashboard Core | **Dependências:** PROMPT 4, PROMPT 6

### Objetivo
Implementar tabela completa de transações com filtros, busca e paginação.

### Componentes a Criar
- TransactionsTable.tsx
- Pagination.tsx

### Requisitos Técnicos
- Header da tabela: busca "Buscar lançamentos", dropdown tipo "Despesas"
- 7 colunas: Avatar, Datas, Descrição, Categorias, Conta/cartão, Parcelas, Valor
- Busca filtra em descrição OU categoria
- Filtro tipo: Todos/Receitas/Despesas
- Filtros combinados (AND lógico) com filtros globais
- Ordenação: data decrescente (mais recente primeiro)
- Paginação: 5 transações por vez
- Controles: Anterior, números páginas, Próxima
- Zebra striping sutil
- Hover: linha destacada com fundo cinza
- Estado vazio: "Nenhum lançamento encontrado"

### Responsividade
- Desktop (≥1024px): Tabela completa horizontal
- Tablet (641-1023px): Ocultar colunas secundárias
- Mobile (≤640px): Cards verticais ao invés de tabela

### Tokens Utilizados
- Semânticas: `--color-text-secondary`, `--color-bg-secondary`, `--spacing-*`
- Primitivas: `--gray-*`

---

## PROMPT 12: Modal de Nova Transação

**Status:** ⏳ Pendente | **Categoria:** Modais e Formulários | **Dependências:** PROMPT 4

### Objetivo
Criar modal completo para adicionar nova transação com todos os campos e validações.

### Componentes a Criar
- NewTransactionModal.tsx

### Requisitos Técnicos
- Modal fullscreen com fundo branco
- Header fixo: ícone circular (64px) muda por tipo, título, botão X
- Conteúdo scrollável centralizado (max 600-700px)
- Toggle tipo: Receita/Despesa (botões grandes lado a lado)
- Campos: Valor (R$), Descrição, Categoria, Membro, Conta/Cartão
- Campo parcelamento: aparece se cartão + despesa
- Checkbox despesa recorrente: aparece se despesa, destaque azul
- Validações: valor >0, descrição ≥3 chars, categoria e conta obrigatórios
- Footer: botões Cancelar e Salvar (preto)
- Ao salvar: adiciona ao contexto, fecha modal, toast de sucesso

### Responsividade
- Desktop (≥1024px): Modal centralizado, largura máxima
- Tablet (641-1023px): Modal quase fullscreen
- Mobile (≤640px): Modal 100% viewport

### Tokens Utilizados
- Semânticas: `--color-primary`, `--color-danger`, `--border-radius-lg`, `--spacing-*`
- Primitivas: `--gray-*`, `--blue-*`

---

## PROMPT 13: Modal de Adicionar Membro

**Status:** ⏳ Pendente | **Categoria:** Modais e Formulários | **Dependências:** PROMPT 4

### Objetivo
Criar modal para adicionar novos membros da família.

### Componentes a Criar
- AddMemberModal.tsx

### Requisitos Técnicos
- Estrutura similar ao modal de transação
- Campos: Nome completo (obrigatório, ≥3 chars), Função/papel (obrigatório, combobox com sugestões)
- Campo Avatar: duas opções (URL ou Upload), opcional, avatar padrão se não fornecido
- Campo Renda mensal (opcional, numérico formatado)
- Validações: nome e função obrigatórios
- Ao salvar: adiciona ao contexto familyMembers, toast de sucesso

### Responsividade
- Desktop (≥1024px): Modal centralizado
- Tablet (641-1023px): Modal adaptado
- Mobile (≤640px): Modal fullscreen

### Tokens Utilizados
- Semânticas: `--color-danger`, `--border-radius-md`, `--spacing-card`
- Primitivas: `--gray-*`

---

## PROMPT 14: Modal de Adicionar Cartão

**Status:** ⏳ Pendente | **Categoria:** Modais e Formulários | **Dependências:** PROMPT 4

### Objetivo
Criar modal para adicionar contas bancárias ou cartões de crédito.

### Componentes a Criar
- AddCardModal.tsx

### Requisitos Técnicos
- Toggle tipo: Conta Bancária / Cartão de Crédito
- Campos comuns: Nome, Titular (dropdown membros)
- Campos conta: Saldo inicial (obrigatório)
- Campos cartão: Dia fechamento (1-31), Dia vencimento (1-31), Limite total, Últimos 4 dígitos (opcional), Tema visual (3 cards: Black, Lime, White)
- Validações: nome ≥3 chars, titular obrigatório, campos específicos por tipo
- Ao salvar: adiciona ao array apropriado no contexto

### Responsividade
- Desktop (≥1024px): Modal 500-600px largura
- Tablet (641-1023px): Modal adaptado
- Mobile (≤640px): Modal 90% largura

### Tokens Utilizados
- Semânticas: `--color-primary`, `--border-radius-lg`
- Primitivas: `--gray-*`, `--green-*`

---

## PROMPT 15: Modal de Detalhes do Cartão

**Status:** ⏳ Pendente | **Categoria:** Modais e Formulários | **Dependências:** PROMPT 4, PROMPT 9

### Objetivo
Criar modal mostrando informações completas do cartão e transações vinculadas.

### Componentes a Criar
- CardDetailsModal.tsx

### Requisitos Técnicos
- Modal maior para mais informações
- Área informações: limite, fatura, disponível, percentual, datas, dígitos
- Grid 2-3 colunas no desktop, 1 no mobile
- Representação visual de uso (donut ou barra progresso)
- Tabela despesas vinculadas (filtra por accountId + type expense)
- Paginação 10 itens por vez se muitas despesas
- Botões ação: Ver Extrato, Adicionar Despesa, Editar, Fechar

### Responsividade
- Desktop (≥1024px): Modal grande, grid 3 colunas
- Tablet (641-1023px): Grid 2 colunas
- Mobile (≤640px): 1 coluna, scroll vertical

### Tokens Utilizados
- Semânticas: `--color-primary`, `--spacing-section`
- Primitivas: `--gray-*`

---

## PROMPT 16: Modal de Filtros Mobile

**Status:** ⏳ Pendente | **Categoria:** Modais e Formulários | **Dependências:** PROMPT 6

### Objetivo
Criar modal de filtros específico para mobile com animação slide-in vertical.

### Componentes a Criar
- FiltersMobileModal.tsx

### Requisitos Técnicos
- Slide-in de baixo para cima (300ms)
- Header fixo: título "Filtros", botão X
- Conteúdo scrollável
- Footer fixo: botão grande "Aplicar Filtros" (56px altura)
- Seções: Tipo transação (grid 3), Membro família (botões com avatar), Período (calendário 1 mês)
- Estado temporário local até aplicar
- Ao aplicar: copia para contexto global, fecha modal

### Responsividade
- Desktop (≥1024px): Não renderiza (usa popover)
- Tablet (641-1023px): Modal slide-in
- Mobile (≤640px): Modal fullscreen slide-in

### Tokens Utilizados
- Semânticas: `--color-primary`, `--spacing-*`
- Primitivas: `--gray-*`

---

## PROMPT 17: View Completa de Cartões

**Status:** ⏳ Pendente | **Categoria:** Views Completas | **Dependências:** PROMPT 4, PROMPT 9

### Objetivo
Criar página dedicada mostrando todos os cartões em grid detalhado.

### Componentes a Criar
- CardsView.tsx

### Requisitos Técnicos
- Header: título "Cartões de Crédito", botão "Novo Cartão"
- Grid responsivo de cartões grandes e detalhados
- Cada card mostra: nome, logo, limite, fatura, disponível, percentual, datas, tema, dígitos
- Barra progresso ou donut mostrando uso visualmente
- Ordenação: por fatura decrescente ou alfabética
- Hover: card eleva, sombra aumenta
- Clique: abre modal detalhes
- Estado vazio: ícone, mensagem, botão "Cadastrar Primeiro Cartão"

### Responsividade
- Desktop (≥1024px): Grid 3 colunas
- Tablet (641-1023px): Grid 2 colunas
- Mobile (≤640px): 1 coluna

### Tokens Utilizados
- Semânticas: `--color-primary`, `--spacing-grid`
- Primitivas: `--gray-*`

---

## PROMPT 18: View Completa de Transações

**Status:** ⏳ Pendente | **Categoria:** Views Completas | **Dependências:** PROMPT 4, PROMPT 11

### Objetivo
Criar página dedicada de transações com filtros avançados e visualização expandida.

### Componentes a Criar
- TransactionsView.tsx

### Requisitos Técnicos
- Header: título "Transações", botão "Nova Transação"
- Barra filtros avançados: busca, tipo, categoria, conta/cartão, membro, período, status
- Linha resumo: total receitas, total despesas, diferença (verde/vermelho), quantidade
- Tabela usando TransactionsTable em modo expandido (10 por página)
- Ordenação clicável nos headers
- Botão Exportar (CSV/PDF)
- Estado vazio apropriado

### Responsividade
- Desktop (≥1024px): Filtros horizontal, tabela completa
- Tablet (641-1023px): Filtros adaptados
- Mobile (≤640px): Filtros verticais, cards ao invés de tabela

### Tokens Utilizados
- Semânticas: `--color-primary`, `--color-danger`
- Primitivas: `--gray-*`, `--green-*`, `--red-*`

---

## PROMPT 19: View de Perfil - Aba Informações

**Status:** ⏳ Pendente | **Categoria:** Views Completas | **Dependências:** PROMPT 4

### Objetivo
Criar aba "Informações" da view de perfil mostrando dados do usuário e membros da família.

### Componentes a Criar
- ProfileView.tsx (com abas)
- ProfileInformationTab.tsx

### Requisitos Técnicos
- Sistema de abas no topo: "Informações" e "Configurações"
- Aba Informações ativa por padrão
- Seção perfil: card grande com avatar 120px, nome, função, email, renda
- Seção membros família: lista vertical de todos membros (avatar 48px, nome, função, renda)
- Hover em items: fundo muda
- Clique em membro: abre modal editar
- Se apenas 1 membro: mensagem incentivando adicionar mais
- Botão vermelho "Sair" com ícone logout

### Responsividade
- Desktop (≥1024px): Layout horizontal com cards lado a lado
- Tablet (641-1023px): Cards empilhados
- Mobile (≤640px): 1 coluna, tudo vertical

### Tokens Utilizados
- Semânticas: `--color-danger`, `--color-bg-secondary`, `--spacing-card`
- Primitivas: `--gray-*`

---

## PROMPT 20: View de Perfil - Aba Configurações

**Status:** ⏳ Pendente | **Categoria:** Views Completas | **Dependências:** PROMPT 19

### Objetivo
Criar aba "Configurações" com preferências, notificações, categorias e privacidade.

### Componentes a Criar
- ProfileSettingsTab.tsx

### Requisitos Técnicos
- Seção Preferências: Toggle modo escuro (desabilitado "Em breve"), Select moeda (R$), Select formato data
- Seção Notificações: 4 toggles (lembrete vencimento, alerta limite, resumo email, objetivos alcançados)
- Seção Categorias: Lista categorias receita e despesa, botões adicionar, ícones editar/deletar
- Seção Dados: Botão exportar dados (JSON/CSV), Botão limpar dados (vermelho com confirmação)
- Seção Sobre: Versão, descrição, links Termos e Privacidade
- Cards organizados verticalmente

### Responsividade
- Desktop (≥1024px): Alguns cards lado a lado
- Tablet (641-1023px): Cards empilhados
- Mobile (≤640px): Tudo vertical, touch-friendly

### Tokens Utilizados
- Semânticas: `--color-danger`, `--spacing-section`
- Primitivas: `--gray-*`

---

## PROMPT 21: Animações e Transições Globais

**Status:** ⏳ Pendente | **Categoria:** Polimento Final | **Dependências:** Todos anteriores

### Objetivo
Implementar animações e transições suaves em todo o sistema.

### Componentes a Criar
- Utilitários de animação (Framer Motion ou CSS transitions)

### Requisitos Técnicos
- Transições navegação: fade-out (200ms) + fade-in (200ms) defasadas
- Entrada cards: fade-in + slide-up (300ms) com stagger (50-100ms)
- Hover botões: transição background-color (200ms)
- Hover cards: translateY + box-shadow (250ms)
- Loading valores: contagem zero até final (800ms, ease-out)
- Barras progresso: preenchimento esquerda-direita (1000ms)
- Abertura modais: overlay fade-in (200ms), modal fade-in + scale (250ms)
- Fechamento modais: fade-out + scale (200ms)
- Toast: slide-in direita (300ms), slide-out após delay (250ms)
- Skeleton loaders: pulse (opacity 0.6-1 em 1500ms infinito)
- Micro-interações: checkboxes scale (1→1.1→1), inputs borda cor (200ms)
- Respeitar prefers-reduced-motion

### Responsividade
- N/A (animações funcionam em todos os tamanhos)

### Tokens Utilizados
- Timing: duração e easing definidos nas constantes de animação

---

## PROMPT 22: Formatação e Utilitários

**Status:** ⏳ Pendente | **Categoria:** Polimento Final | **Dependências:** PROMPT 1

### Objetivo
Criar funções utilitárias para formatação consistente (moeda, datas, cálculos).

### Componentes a Criar
- currency.utils.ts
- date.utils.ts
- array.utils.ts
- validation.utils.ts
- calculation.utils.ts
- id.utils.ts

### Requisitos Técnicos
- formatCurrency: Intl.NumberFormat pt-BR, BRL, 2 decimais
- formatCompactCurrency: valores compactos (R$ 2,5k, R$ 1,2M)
- parseCurrencyInput: remove R$, pontos, troca vírgula
- formatDate: DD/MM/AAAA (date-fns pt-BR)
- formatDateLong: "15 de Janeiro de 2024"
- formatDateRange: "01 jan - 31 jan, 2024"
- formatRelativeDate: "Hoje", "Ontem", "Há 3 dias"
- groupByCategory, filterByDateRange, sortByDate
- calculatePercentage, calculateDifference, calculateInstallmentValue
- isValidEmail, isValidCPF, isValidDate, isPositiveNumber
- generateUniqueId (UUID v4 ou crypto.randomUUID)
- JSDoc em todas funções
- Testes unitários básicos

### Responsividade
- N/A (utilitários de lógica)

### Tokens Utilizados
- N/A

---

## PROMPT 23: Responsividade e Ajustes Finais

**Status:** ⏳ Pendente | **Categoria:** Polimento Final | **Dependências:** Todos anteriores

### Objetivo
Revisar e ajustar responsividade completa, sem refatorar arquitetura existente.

### Componentes a Criar
- Ajustes incrementais em componentes existentes

### Requisitos Técnicos
- **Mobile-First**: Confirmar base <768px, evolução progressiva
- **Breakpoints**: <768px (mobile), ≥768px <1280px (tablet), ≥1280px (desktop), ≥1920px (wide)
- **Layout Fluido**: width: 100%, max-width para leitura (1400px desktop, 1600px wide)
- **Sidebar**: Só desktop ≥1280px, nunca renderiza mobile/tablet
- **Header Mobile**: Só <1280px, nunca coexiste com sidebar
- **Grids**: 1 coluna mobile, 2 tablet, 3-4 desktop (auto-fit/auto-fill)
- **Espaçamentos**: px-4 mobile, px-6 tablet, px-8 desktop
- **Tipografia**: -15% mobile, progressivo (text-base md:text-lg lg:text-xl)
- **Tabela**: Cards no mobile, híbrida tablet, completa desktop
- **Gráficos**: Altura reduzida mobile, labels simplificados
- **Modais**: Fullscreen mobile, max-width desktop
- **Touch targets**: mínimo 44x44px, inputs 48px altura, font 16px mínimo
- **Acessibilidade**: Navegação teclado, focus:ring, aria-labels, contraste 4.5:1
- **Validação**: 375px, 768px, 1280px, 1920px

### Responsividade
- Aplicar a todos os componentes do sistema

### Tokens Utilizados
- Semânticas: `--spacing-page` (responsivo)
- Primitivas: `--spacing-*` (escala)

---

## PROMPT 24: Testes e Validação Final

**Status:** ⏳ Pendente | **Categoria:** Polimento Final | **Dependências:** Todos anteriores

### Objetivo
Executar testes completos e validação final do sistema.

### Componentes a Criar
- Fluxo de testes documentado
- Checklist de validação

### Requisitos Técnicos
- **Fluxo de teste**: Jornada completa do usuário (primeira abertura → filtros → nova transação → navegação → perfil)
- **Validação cálculos**: Testar com valores conhecidos, verificar exatidão
- **Validação filtros**: Filtros combinados, contar manualmente, verificar resultado
- **Validação formatação**: Verificar R$ X.XXX,XX, DD/MM/AAAA, 35,5%
- **Validação responsividade**: Testar em 375px, 768px, 1280px, 1920px
- **Validação modais**: Abrir/fechar todos, validar X/fora/Escape, validações formulários
- **Validação acessibilidade**: Navegação teclado, foco visível, ordem tab, leitor de tela
- **Validação performance**: Performance DevTools, navegação suave, 100 transações + paginação, sem memory leaks
- **Correção bugs**: Corrigir problemas encontrados
- **Tratamento erros**: Divisão por zero, arrays vazios, validação formulários
- **Mensagens feedback**: Toasts sucesso/erro, estados vazios, validações descritivas
- **Documentação**: JSDoc funções complexas, comentários lógica não-óbvia, remover console.logs
- **Otimização performance**: Verificar re-renders, imagens, bundle size
- **Preparação Supabase**: Identificar pontos integração, comentários TODO
- **Relatório final**: Totais de componentes, linhas código, funcionalidades

### Responsividade
- Validação em todos os breakpoints

### Tokens Utilizados
- N/A (validação geral)

---

**Última atualização:** 2026-01-17
