# Plano de Redesign Premium e Refino de UI

Transformar a aplicação "Maps Leads" em uma experiência visual extraordinária, focada em luxo, minimalismo moderno e fluidez, utilizando a **Taste Skill** e os princípios de design de elite.

## Alterações Visuais e Estéticas

- **Tipografia**: Implementar escala tipográfica fluida e editorial (Inter/SF Pro) com hierarquia clara e line-height otimizado.
- **Cores e Profundidade**: Aplicar paleta sóbria (Dark/Glassmorphism) com Soft Shadows e gradientes sutis para criar profundidade.
- **Grade e Espaçamento**: Ajustar todo o layout para o sistema de grade de 8px, garantindo ritmo visual e uso estratégico de espaço em branco.
- **Layout Moderno**: Transformar o dashboard e as listagens em estruturas contemporâneas (Bento Grids onde apropriado).

## Experiência e Movimento (Motion)

- **Micro-interações**: Adicionar hover effects suaves e feedbacks visuais refinados com curvas `cubic-bezier`.
- **Animações de Entrada**: Implementar `staggered fade-in/slide-up` para conteúdo dinâmico (leads e estatísticas).
- **Transições de Rota**: Suavizar a navegação entre Dashboard, Busca e Resultados.

## Refino Técnico

- **Arquitetura CSS**: Unificar variáveis de design (tokens) no `src/styles.css`.
- **Pixel Perfection**: Corrigir desalinhamentos em cards, badges de classificação de leads e tabelas mobile.
- **Consistência**: Garantir que o dashboard reflita a autoridade e sofisticação descritas no prompt de redesign.

## Detalhes Técnicos

- Utilização de `framer-motion` (se disponível/necessário) ou Tailwind `tw-animate-css` para transições fluidas.
- Refatoração dos componentes `Dashboard`, `DashboardLayout`, `SearchPage` e `ResultsPage` para aplicar o novo sistema visual.
- Preservação integral da lógica de scraping e integração n8n.
