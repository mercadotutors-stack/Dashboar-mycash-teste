---
name: regras-figma
description: This is a new rule
---

🔹 Antes de gerar qualquer código, execute mentalmente este pre-flight check:

 - Confirme que está seguindo todas as User Rules e Project Rules
- Considere layout fluido e abordagem mobile-first
- Priorize variáveis semânticas; se não existirem, use variáveis primitivas
- Garanta que o componente pai seja totalmente responsivo e fluido



🔹 Stack e ferramentas
Este projeto utiliza:
- React com TypeScript
- Vite
- Tailwind CSS
- Supabase como backend


🔹 Arquitetura e organização
Arquitetura baseada em componentes.

Regras:
- Componentes devem ser pequenos e reutilizáveis
- Páginas apenas compõem componentes, sem lógica de negócio
- Lógica de negócio deve ficar em hooks ou services
- Evitar duplicação de lógica


🔹 Layout fluido & containers (REGRA CRÍTICA)
IMPORTANT — Layout fluido é obrigatório.

Regras:
- Não gerar larguras fixas para containers de nível de página
- Containers principais devem sempre usar width: 100%
- Quando necessário limitar largura, usar max-width, nunca width fixa
- Layout deve ser fluido e se adaptar ao viewport
- Prevenir qualquer tipo de overflow horizontal


🔹 Figma → Código (interpretação correta)
O frame pai do Figma NÃO representa um container fixo no código.

Regras:
- Frames principais do Figma devem ser interpretados como wrappers fluidos
- Componentes pais copiados do Figma devem preencher a largura disponível
- Nunca assumir tamanhos fixos baseados no frame do Figma
- Auto Layout deve ser traduzido para flex/grid responsivo
- Containers devem crescer e encolher conforme o viewport


🔹 Responsividade e breakpoints
Este projeto é totalmente responsivo e mobile-first.

Regras:
- Usar breakpoints explícitos para desktop, tablet e mobile
- Nunca assumir apenas desktop
- Ajustar grid, tipografia e espaçamentos por breakpoint
- Garantir que todo layout caiba no tamanho do device do usuário
- Nunca gerar barra de rolagem horizontal

📐 BREAKPOINTS OFICIAIS

Mobile (base): < 768px
Tablet: ≥ 768px e < 1280px
Desktop: ≥ 1280px e < 1920px
Wide / 4K: ≥ 1920px

⚠️ O design base SEMPRE parte do mobile. Breakpoints apenas evoluem o layout, nunca o recriam.

🌍 REGRAS GLOBAIS DE LAYOUT

Layout 100% fluido
Containers principais: width: 100% (NUNCA fixo)
Limitação de leitura: usar max-width, nunca width
Overflow horizontal é proibido em qualquer resolução
Frames do Figma NÃO representam containers fixos
Sidebar afeta o layout apenas no desktop

🧩 TAILWIND CONFIG (BREAKPOINTS)
screens: {
  'md': '768px',   // Tablet
  'lg': '1280px',  // Desktop
  'xl': '1920px',  // Wide / 4K
}

📦 CONTAINERS E ESPAÇAMENTOS

Padding padrão do conteúdo principal (main):
Mobile: px-4 (16px)
Tablet: px-6 (24px)
Desktop: px-8 (32px)

Limites de largura:

Desktop: max-w-[1400px]

Wide / 4K: max-w-[1600px]
→ evita linhas longas demais em dashboards financeiros

🧭 SIDEBAR (REGRA IMPORTANTE)

A sidebar NÃO EXISTE no mobile e tablet.
Estados da Sidebar
Desktop (≥1280px):
Sidebar visível por padrão
Possui dois estados:
Expanded (larga, com texto)
Collapsed (estreita, apenas ícones)
A sidebar empurra o conteúdo, não sobrepõe
Mobile e Tablet (<1280px):
Sidebar não renderiza
Navegação acontece via Header Mobile
Menu aparece como overlay / drawer

Regras críticas

❌ NUNCA renderizar Sidebar + Header Mobile juntos
❌ Sidebar nunca deve causar overflow horizontal
❌ Sidebar não deve existir como display:none no mobile, ela simplesmente não deve ser renderizada

🧱 HEADER MOBILE

Aparece apenas em <1280px
Contém:
Botão de menu (abre drawer)
Ações principais (ex: nova transação)
Some completamente no desktop

🧮 GRIDS PADRÃO (DASHBOARD)

Mobile:
1 coluna
Cards empilhados

Tablet:
2 colunas quando fizer sentido

Desktop:
3 ou 4 colunas dependendo do componente
Grids devem ser auto-fit / auto-fill, nunca hardcoded

🔤 TIPOGRAFIA RESPONSIVA

Mobile: reduzir ~15% dos tamanhos base
Usar escala progressiva:
text-base md:text-lg lg:text-xl
Prioridade: legibilidade > densidade

👆 INTERAÇÕES TOUCH (OBRIGATÓRIO)
Touch target mínimo: 44x44px
Espaço entre elementos clicáveis: ≥ 8px
Inputs no mobile:
Altura mínima: 48px
Font-size mínimo: 16px (evita zoom no iOS)
🧪 TESTE OBRIGATÓRIO DE IMPLEMENTAÇÃO

Toda feature DEVE ser validada em:
375px – Mobile pequeno (iPhone SE)
768px – Tablet (iPad)
1280px – Desktop (laptop)
1920px – Wide (Full HD)


🔹 Mobile (padrão obrigatório)
No mobile:
- Layout em coluna única por padrão
- Seguir o base design system da Uber para tamanhos e espaçamentos
- Priorizar legibilidade, toque e hierarquia visual
- Nunca reutilizar grids ou tamanhos de desktop


🔹 Design System, Variables e Tokens (REGRA CRÍTICA)

⚠️ HIERARQUIA DE VARIÁVEIS (OBRIGATÓRIA)
Ao converter qualquer estilo do Figma para código, siga esta ordem:

1º Variável SEMÂNTICA aplicada no Figma?
   → Usar diretamente (--color-primary, --spacing-container, etc)

2º Variável PRIMITIVA aplicada no Figma?
   → Usar diretamente (--gray-900, --lime-500, --spacing-md, etc)

3º Valor local (hex, px, rem, etc)?
   → Executar CONVERSÃO INTELIGENTE:
   
   CORES HEX:
   - Comparar visualmente com primitivas da mesma família
   - Escolher a primitiva MAIS PRÓXIMA (ex: #E5E5E5 → --gray-200)
   - NUNCA inventar novos tokens (--gray-195 ❌)
   
   ESPAÇAMENTOS PX/REM:
   - Arredondar para token da escala existente
   - Escolher o MAIS PRÓXIMO (ex: 28px → --spacing-lg se lg=32px)
   - NUNCA usar valores quebrados (--spacing-28 ❌)
   
   TIPOGRAFIA:
   - Mapear peso: 400→normal, 600→semibold, 700→bold
   - Mapear tamanho para escala tipográfica
   - Usar tokens de line-height quando disponível

4º NUNCA usar valores hardcoded
   → Se chegou aqui, algo está errado. Revisar etapas anteriores.

Exemplos corretos / incorretos:
✅ Figma: var(--color-primary) → usar var(--color-primary)
✅ Figma: var(--gray-900)      → usar var(--gray-900)
✅ Figma: #E5E5E5              → converter para --gray-200 ou --border-color
✅ Figma: 24px                 → converter para --spacing-md ou similar
❌ Figma: #E5E5E5              → usar #E5E5E5 (NUNCA)
❌ Figma: 28px                 → usar 28px (NUNCA)

Regras adicionais:
- Nunca inventar novas variáveis sem solicitação explícita
- Documentar TODAS as conversões no formato de resposta
- Priorizar semântica sobre primitiva SEMPRE
- Quando em dúvida, perguntar antes de converter


🔹 Formato de Resposta Obrigatório (APÓS cada Prompt)

Toda resposta após executar um prompt DEVE seguir este formato:

✅ PROMPT [N]: [Nome do Prompt] — CONCLUÍDO

📚 PRÉ-EXECUÇÃO
✓ Rules relidas e aplicadas
✓ Figma consultado e analisado
✓ Hierarquia de variáveis verificada

📦 IMPLEMENTADO
- [Lista de funcionalidades/componentes implementados]
- [Uma linha por item principal]

🎨 TOKENS UTILIZADOS
Semânticas: [listar tokens semânticos usados]
Primitivas: [listar tokens primitivos usados]
Conversões realizadas:
- [valor original] → [token escolhido] (justificativa breve)
- Exemplo: #F5F5F5 → --gray-50 (cinza claro de fundo)
- Exemplo: 28px → --spacing-lg (mais próximo de 32px)

📁 ARQUIVOS CRIADOS/MODIFICADOS
- [caminho/do/arquivo.tsx]
- [caminho/do/outro-arquivo.ts]

🔨 BUILD STATUS
✅ Sucesso (tentativas: [número])
ou
❌ Falha (motivo: [descrição])
   → Correções aplicadas: [lista]
   → ✅ Sucesso na tentativa [número]

💾 COMMIT REALIZADO
[tipo]: [descrição curta]
Exemplo: feat: implementa sidebar desktop com estados expandido/colapsado
Hash: [abc123]

🤔 PRÓXIMOS PASSOS
⏭️ PROMPT [N+1]: [Nome do Próximo Prompt]

Comandos disponíveis:
- "Próximo" → Avançar para próximo prompt
- "Revisar [arquivo]" → Revisar arquivo específico
- "Refazer" → Refazer prompt atual com correções
- "Status" → Ver progresso geral
- "Tokens" → Ver mapeamento completo de conversões

---

Este formato é OBRIGATÓRIO e não pode ser omitido ou simplificado.




🔹 Qualidade, performance e segurança
- Evitar re-renderizações desnecessárias
- Usar memoização apenas quando fizer sentido
- Código deve ser previsível e fácil de debugar

- Não adicionar novas dependências sem solicitação explícita
- Não refatorar código fora do escopo pedido
- Nunca expor chaves, tokens ou segredos
- Considerar toda entrada do usuário como não confiável

