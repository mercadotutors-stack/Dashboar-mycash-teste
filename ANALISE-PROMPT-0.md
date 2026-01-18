# 📋 PROMPT 0: Análise e Planejamento Inicial — Relatório Completo

## ✅ Status: CONCLUÍDO

**Data:** 2026-01-17  
**Fonte de Verdade:** [Design Figma - Dashboard Mycash+](https://www.figma.com/design/hFflSV9rm1P89Ev1Wyy4So/Workshop---Do-figma-MCP-ao-Cursor-AI-v.2?node-id=42-3096&t=VocsxaQzQvHCuiPj-4)

---

## 1️⃣ MAPEAMENTO DE COMPONENTES VISUAIS

### 🎨 Hierarquia Visual da Dashboard

#### **A. Layout Principal (Estrutura de Navegação)**

**1. Sidebar Desktop (Esquerda)**
- **Logo:** "Mycash+" (topo)
- **Navegação:**
  - Botão "Home" (verde brilhante, ativo) com ícone de casa
  - Botão "Cartões" (cinza, inativo) com ícone de cartão
- **Perfil do Usuário (rodapé):**
  - Avatar circular (Lucas Marte)
  - Email: lucasmarte@gmail.com
- **Estado Colapsado:** Seta para esquerda no header sugere toggle para modo ícones apenas

**2. Header Desktop (Topo)**
- **Esquerda:**
  - Logo "Mycash+" + seta para esquerda (toggle sidebar)
- **Centro:**
  - Barra de pesquisa "Pesquisar" (magnifying glass)
  - Ícone de filtro/sort
  - Seletor de data: "01 Jan - 31 Jan 2026"
- **Direita:**
  - 3 avatares circulares (membros da família)
  - Botão "Nova transação" (preto, destaque, ícone +)

**3. Header Mobile** (inferido das regras)
- Aparece apenas < 1280px
- Botão de menu (abre drawer)
- Ações principais (nova transação)
- Não renderiza junto com sidebar

#### **B. Conteúdo Principal (Dashboard)**

**1. Cards de Categorias de Despesas** (grid 4 colunas - desktop)
- **Estrutura:** Card quadrado com:
  - Indicador de progresso circular (verde, borda)
  - Percentual (%)
  - Nome da categoria
  - Valor (R$)
- **Exemplos:**
  - "Aluguel": 25%, R$ 4.000,00
  - "Alimentação": 15%, R$ 2.000,00
  - "Mercado": 5%, R$ 1.500,00
  - "Academia": 3%, R$ 120,00

**2. Resumo Financeiro** (3 cards horizontais)
- **Card 1 - Saldo Total:**
  - Ícone de dólar ($)
  - Valor: R$ 2.000,00 (azul)
- **Card 2 - Receitas:**
  - Seta verde para baixo (↓)
  - Valor: R$ 12.000,00
- **Card 3 - Despesas:**
  - Seta vermelha para cima (↑)
  - Valor: R$ 10.000,00

**3. Cards & Contas** (seção lateral direita)
- **Título:** "Cards & contas" com ícone + e seta →
- **Lista de contas:**
  - **Nubank** (logo roxo): R$ 120,00 | Vence dia 10 | **** 5897
  - **Inter** (logo laranja): R$ 2.300,00 | Vence dia 21 | **** 5897
  - **Picpay** (logo verde): R$ 17.000,00 | Vence dia 12 | **** 5897

**4. Gráfico de Fluxo Financeiro** (área principal inferior esquerda)
- **Tipo:** Gráfico de área/linha
- **Eixo Y:** R$ 0,00 até R$ 17.500 (incrementos de R$ 2.500)
- **Eixo X:** Meses (JAN a DEZ)
- **Legenda:**
  - Receitas (amarelo/verde)
  - Despesas (vermelho/rosa)
- **Dados:** Receitas geralmente acima das despesas, com leve queda no meio do ano

**5. Próximas Despesas** (card inferior direito)
- **Título:** "Próximas despesas" com ícone +
- **Lista:** 5 itens idênticos
  - "Conta de Luz"
  - R$ 154,00
  - "Vence dia 21/01"
  - "Crédito Nubank **** 5897"
  - Ícone de check verde

**6. Extrato Detalhado** (tabela completa inferior)
- **Controles:**
  - Busca: "Buscar lançamentos"
  - Dropdown: "Despesas"
- **Colunas da Tabela:**
  - Membro (avatar)
  - Datas
  - Descrição
  - Categorias
  - Conta/cartão
  - Parcelas
  - Valor
- **Exemplos de Linhas:**
  - Avatar escuro | 17/01/2026 | ↑ Conta de água | Manutenção | Conta corrente | - | R$ 100,00
  - Avatar azul | 17/01/2026 | ↑ Conta de Luz | Manutenção | Conta corrente | - | R$ 150,00
  - Avatar roxo | 17/01/2026 | ↑ Passeio no parque | Lazer | Cartão XP | 1/1 | R$ 750,00
- **Paginação:** ← 1 2 3 4 5 →

---

## 2️⃣ VARIÁVEIS DO DESIGN SYSTEM

### 🎨 Cores Identificadas

#### **Semânticas (conversão recomendada)**

| Semântica | Uso | Valor Aproximado |
|-----------|-----|------------------|
| `--color-bg-primary` | Fundo principal (branco) | #FFFFFF |
| `--color-bg-secondary` | Fundo de cards, sidebar inativo | Cinza claro |
| `--color-primary` | Botão ativo, indicadores positivos | Verde brilhante |
| `--color-secondary` | Saldo total (texto) | Azul |
| `--color-danger` | Despesas, indicadores negativos | Vermelho |
| `--color-text-primary` | Texto principal | Cinza escuro/preto |
| `--color-text-secondary` | Datas, números de cartão | Cinza médio |
| `--color-border` | Bordas, separadores | Cinza claro |
| `--color-accent-receita` | Receitas no gráfico | Amarelo/Verde |
| `--color-accent-despesa` | Despesas no gráfico | Vermelho/Rosa |
| `--color-brand-nubank` | Logo Nubank | Roxo |
| `--color-brand-inter` | Logo Inter | Laranja |
| `--color-brand-picpay` | Logo Picpay | Verde |

#### **Primitivas (a confirmar no Figma)**

**Grays (família de cinzas):**
- `--gray-50` até `--gray-900` (escala completa)

**Cores de Acento:**
- Verde: `--green-*` (variantes: 100, 200, 300, 400, 500, 600, 700, 800, 900)
- Azul: `--blue-*` (variantes)
- Vermelho: `--red-*` (variantes)
- Amarelo: `--yellow-*` (variantes)

**Neutras:**
- Branco: `--white` (#FFFFFF)
- Preto: `--black` (#000000)

### 📏 Espaçamento

#### **Semânticas**

| Semântica | Uso | Valor Base |
|-----------|-----|------------|
| `--spacing-page` | Padding do conteúdo principal | Responsivo |
| `--spacing-section` | Margem entre seções grandes | 32px |
| `--spacing-card` | Padding interno dos cards | 16-24px |
| `--spacing-grid` | Gap entre cards no grid | 16-24px |
| `--spacing-item` | Espaço entre itens de lista | 8-12px |

#### **Primitivas (escala sugerida)**

```
--spacing-xs:  4px
--spacing-sm:  8px
--spacing-md:  16px
--spacing-lg:  24px
--spacing-xl:  32px
--spacing-2xl: 48px
```

#### **Responsivo (Padding do main)**

- **Mobile:** `px-4` (16px)
- **Tablet:** `px-6` (24px)
- **Desktop:** `px-8` (32px)

### 🔤 Tipografia

#### **Semânticas**

| Semântica | Uso | Tamanho Base |
|-----------|-----|--------------|
| `--font-family-sans` | Fonte padrão do sistema | - |
| `--font-size-heading-xl` | Títulos principais | 28-32px |
| `--font-size-heading-lg` | Títulos de seção | 24px |
| `--font-size-heading-md` | Subtítulos | 20px |
| `--font-size-body` | Texto corrido | 16px |
| `--font-size-caption` | Labels, datas | 14px |
| `--font-size-small` | Texto auxiliar | 12px |

**Pesos:**
- `--font-weight-regular`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

**Responsivo (Mobile reduz ~15%):**
- Desktop: 100%
- Mobile: ~85% dos valores base
- Escala: `text-base md:text-lg lg:text-xl`

### 🔲 Shapes (Bordas e Formas)

#### **Semânticas**

| Semântica | Uso | Valor |
|-----------|-----|-------|
| `--border-radius-sm` | Inputs pequenos | 4px |
| `--border-radius-md` | Cards, inputs padrão | 8-12px |
| `--border-radius-lg` | Botões grandes | 16px |
| `--border-radius-full` | Avatares, progresso circular | 50% |

**Shapes especiais:**
- `--shape-circle`: Para avatares e indicadores circulares

---

## 3️⃣ ESTRUTURA DE NAVEGAÇÃO

### 🖥️ Desktop (≥ 1280px)

**Sidebar:**
- **Expanded (padrão):**
  - Largura: ~240-280px (a confirmar)
  - Mostra: Logo + texto dos itens + perfil completo
- **Collapsed:**
  - Largura: ~64-80px (a confirmar)
  - Mostra: Apenas ícones

**Comportamento:**
- Sidebar **empurra** conteúdo (não sobrepõe)
- Toggle via seta no header
- Animação suave de largura

**Header:**
- Altura: ~64-80px
- Barra completa com todos os elementos

### 📱 Mobile/Tablet (< 1280px)

**Sidebar:**
- **NÃO renderiza** (nunca display:none, não existe no DOM)

**Header Mobile:**
- Altura: ~56-64px
- Botão menu (hamburger) + ações principais
- Drawer/overlay quando menu aberto

**Navegação:**
- Menu drawer via botão
- Overlay com opções de navegação

### 🔄 Transições

- **Toggle Sidebar:** Animação de largura (300ms ease-in-out)
- **Mudança de Página:** Feedback visual claro no item ativo
- **Breakpoint:** Em 1280px, layout muda completamente (não apenas esconde/mostra)

---

## 4️⃣ ARQUITETURA PROPOSTA

### 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx              # Container principal
│   │   │   ├── SidebarItem.tsx          # Item de navegação
│   │   │   ├── UserProfile.tsx          # Perfil na sidebar
│   │   │   └── useSidebarToggle.ts      # Hook de toggle
│   │   ├── Header/
│   │   │   ├── HeaderDesktop.tsx        # Header desktop completo
│   │   │   ├── HeaderMobile.tsx         # Header mobile + drawer
│   │   │   ├── SearchBar.tsx            # Barra de pesquisa
│   │   │   ├── DateRangePicker.tsx      # Seletor de data
│   │   │   └── MemberAvatars.tsx        # Avatares de membros
│   │   └── Layout.tsx                   # Layout principal (Sidebar + Header + Main)
│   ├── dashboard/
│   │   ├── ExpenseCategoryCard.tsx      # Card de categoria (progresso circular)
│   │   ├── FinancialSummary.tsx         # 3 cards: Saldo, Receitas, Despesas
│   │   ├── CardsAccounts.tsx            # Seção "Cards & contas"
│   │   ├── AccountItem.tsx              # Item individual de conta
│   │   ├── FinancialFlowChart.tsx       # Gráfico de fluxo financeiro
│   │   ├── UpcomingExpenses.tsx         # Próximas despesas
│   │   └── DetailedStatement.tsx        # Tabela de extrato detalhado
│   ├── cards/
│   │   └── CardItem.tsx                 # Componente de cartão (reutilizável)
│   ├── transactions/
│   │   ├── TransactionList.tsx          # Lista de transações
│   │   └── TransactionItem.tsx          # Item individual
│   ├── profile/
│   │   └── ProfileSection.tsx           # Seção de perfil
│   └── ui/
│       ├── Button.tsx                   # Botão base (variantes)
│       ├── Card.tsx                     # Card base
│       ├── Input.tsx                    # Input base
│       ├── Badge.tsx                    # Badge/etiqueta
│       ├── Avatar.tsx                   # Avatar circular
│       ├── ProgressCircle.tsx           # Indicador de progresso circular
│       ├── Table.tsx                    # Tabela base
│       └── Pagination.tsx               # Componente de paginação
├── pages/
│   ├── Dashboard.tsx                    # Página principal (dashboard)
│   ├── Cards.tsx                        # Página de cartões
│   ├── Transactions.tsx                 # Página de transações
│   └── Profile.tsx                      # Página de perfil
├── hooks/
│   ├── useSidebar.ts                    # Estado da sidebar
│   ├── useResponsive.ts                 # Breakpoints e responsividade
│   └── useTransactions.ts               # Lógica de transações (opcional)
├── services/
│   ├── api.ts                           # Cliente Supabase
│   └── transactions.ts                  # Service de transações
├── types/
│   ├── index.ts                         # Types principais
│   ├── transaction.ts                   # Types de transação
│   └── account.ts                       # Types de conta/cartão
├── styles/
│   ├── tokens.css                       # Variáveis CSS (tokens)
│   └── globals.css                      # Estilos globais
├── utils/
│   ├── formatCurrency.ts                # Formatação de moeda (R$)
│   ├── formatDate.ts                    # Formatação de datas
│   └── constants.ts                     # Constantes do app
└── App.tsx                              # Componente raiz
```

### 🏗️ Princípios de Arquitetura

1. **Mobile-First Design**
   - Base sempre em < 768px
   - Evolução progressiva para breakpoints maiores
   - Nunca recriar layout, apenas evoluir

2. **Layout Fluido**
   - Containers principais: `width: 100%` (NUNCA fixo)
   - Limitação de leitura: `max-width`, nunca `width` fixa
   - Zero overflow horizontal

3. **Componentização Hierárquica**
   - **Atômicos:** Button, Input, Badge, Avatar
   - **Moléculas:** Card, SidebarItem, TransactionItem
   - **Organismos:** Sidebar, Header, FinancialSummary
   - **Templates:** Layout (Sidebar + Header + Main)
   - **Páginas:** Dashboard, Cards, Transactions, Profile

4. **Separação de Responsabilidades**
   - Páginas: apenas compõem componentes (sem lógica)
   - Lógica de negócio: hooks e services
   - UI pura: componentes reutilizáveis

5. **Hierarquia de Variáveis (CRÍTICO)**
   ```
   1º Variável SEMÂNTICA (--color-primary)
      ↓ (se não existir)
   2º Variável PRIMITIVA (--gray-900)
      ↓ (se não existir)
   3º Conversão INTELIGENTE (hex/px → token mais próximo)
      ↓ (NUNCA)
   4º Hardcoded (PROIBIDO)
   ```

### 🔄 Estratégia de Componentização

**Reutilização:**
- Componentes UI (`ui/`) são base para tudo
- Componentes de domínio (`dashboard/`, `cards/`) usam UI
- Composição > herança

**Responsividade:**
- Cada componente é responsivo por si
- Breakpoints via Tailwind (`md:`, `lg:`, `xl:`)
- Mobile-first: classes base são mobile, breakpoints evoluem

**Estados:**
- Estados locais: useState quando apropriado
- Estado compartilhado: Context API ou Zustand (se necessário)
- Sidebar state: Context local ou Zustand

---

## 5️⃣ CONCLUSÕES E PRÓXIMOS PASSOS

### ✅ Análise Concluída

- ✅ Componentes mapeados (hierarquia visual)
- ✅ Variáveis inferidas (semânticas e primitivas)
- ✅ Estrutura de navegação analisada
- ✅ Arquitetura proposta

### ⚠️ Pendências (requer acesso ao Figma)

- ⏳ Confirmar valores exatos de cores (hex)
- ⏳ Confirmar escala completa de espaçamentos
- ⏳ Validar tokens primitivos do design system
- ⏳ Confirmar tipografia (família, tamanhos, line-heights)
- ⏳ Validar border-radius exatos
- ⏳ Confirmar largura exata da sidebar (expanded/collapsed)

### 🎯 Próximo Passo: PROMPT 1

**Estrutura Base do Projeto**
- Inicializar React + TypeScript + Vite
- Configurar Tailwind CSS
- Criar estrutura de pastas proposta
- Setup básico de rotas (se necessário)
- Configurar Supabase (conexão básica)

---

**Preparado para:** PROMPT 1 - Estrutura Base  
**Data de conclusão:** 2026-01-17  
**Status:** ✅ CONCLUÍDO
