# Plano de Refinamento Premium UI/UX - ScanRadar

Refinar a aplicação operacional ScanRadar para uma experiência de elite, focada em densidade de dados, clareza hierárquica e eficiência comercial, seguindo os princípios da Taste UI.

## 1. Sistema Visual e Design Tokens (`src/styles.css`)
- **Paleta de Cores**: Consolidar `oklch` para Azul-marinho (#16213B), Ciano Radar (#38BDF8), Sucesso (#16A34A), Atenção (#D97706) e Erro (#DC2626).
- **Superfícies**: Fundo levemente azulado (#F7F9FC) e cards brancos puros.
- **Geometria**: Border-radius de 16px para cards, 12px para inputs/botões.
- **Tipografia**: Ajustar pesos (evitar 900) e escalas fluidas. Títulos 32-36px, corpo 14-16px.

## 2. Estrutura Global (`DashboardLayout.tsx`)
- **Sidebar**: Implementar colapsibilidade (280px a 72px) com tooltips nos ícones.
- **Navegação**: Tornar a marca ScanRadar clicável para o Dashboard.
- **Status da Engine**: Adicionar indicador de conexão real com n8n na parte inferior da sidebar.
- **Responsividade**: Garantir comportamento de drawer no mobile e alinhamento centralizado do conteúdo.

## 3. Dashboard Central de Decisão (`Dashboard.tsx`)
- **KPIs Avançados**: Mostrar "Leads sem site" como oportunidade prioritária. Adicionar tooltips explicativos.
- **Oportunidades Prioritárias**: Nova seção com lista das top 5 empresas sem presença digital detectada.
- **Atividade Recente**: Lista funcional das últimas buscas com link direto para resultados.
- **Distribuição Digital**: Gráfico de barras horizontais com a saúde digital dos leads capturados.

## 4. Fluxo de Busca Inteligente (`SearchPage.tsx`)
- **Formulário**: Organizar em "Dados Principais" e "Opções Avançadas" (recolhível).
- **UX**: Labels permanentes, validação pré-envio, estados de loading claros e prevenção de clique duplo.
- **Contrato n8n**: Preservar o envio atual de `termo`, `cidade` e `uf`.

## 5. Gerenciamento de Histórico (`HistoryPage.tsx`)
- **Tabela Operacional**: Adicionar filtros por status, período e pesquisa por nicho.
- **Ações**: Menu de três pontos para repetir busca, exportar ou tentar novamente em caso de erro.
- **Empty States**: Ilustrações e CTAs claros quando não houver dados.

## 6. Resultados e Prospecção (`ResultsPage.tsx`)
- **Toolbar de Dados**: Adicionar pesquisa global, filtros por presença digital e ordenação por oportunidade comercial.
- **Classificação Digital**: Diferenciar badges para Site Próprio, WhatsApp, Instagram e Linktree usando `website-utils.ts`.
- **Ações em Lote**: Barra contextual para exportar leads selecionados.
- **Visualização**: Manter alternância entre Tabela e Grid, otimizando densidade de informação.

## 7. Configurações e Diagnóstico (`SettingsPage.tsx`)
- **Interface**: Organizar em cards de Conexão, Segurança e Diagnóstico Real.
- **Funcionalidade**: Adicionar botão de cópia rápida para o webhook e checklist de saúde da integração.

## Detalhes Técnicos
- **Stack**: Framer Motion para entradas staggered, Tailwind v4 para tokens, TanStack Query para persistência.
- **Segurança**: Manter lógica de secrets no servidor via `scraper.functions.ts`.
- **Acessibilidade**: Foco visível, navegação por teclado e contraste WCAG AA.
