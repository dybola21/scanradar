# Refino completo de UI/UX do ScanRadar

Auditoria feita antes deste plano. O que existe hoje:

- Rotas: `/auth`, `/dashboard`, `/search`, `/history`, `/results/$searchId`, `/settings`.
- Dados de lead reais: nome, telefone, bairro, cidade, uf, website, email, email2, created_at. **Não existem** categoria do negócio nem avaliação (rating).
- Buscas: termo, cidade, uf, status (pending | processing | completed | failed), total_leads, sheet_url, error_message, created_at, completed_at. **Não existe** status "cancelado" nem campo de arquivamento.
- Classificação de presença digital já existe em `website-utils.ts` (site próprio, WhatsApp, Instagram, rede social, link de bio, plataforma/marketplace, encurtador, sem link). Não há verificação de site "indisponível" (exigiria requisição HTTP por lead).
- Configurações n8n: webhook_url, webhook_secret (mascarado, nunca volta ao browser), integration_name, is_connected. **Não existe** registro de data do último teste nem campo de ambiente.

## O que será feito

### 1. Sistema visual e tokens
Consolidar em `src/styles.css` a paleta pedida (fundo #F7F9FC, superfície branca, primária #16213B, ciano #38BDF8, verde/âmbar/vermelho de status, cinzas frios), raios (cards 16px, inputs/botões 12px), sombras discretas, transições 150–250ms. Remover glassmorphism, glow e gradientes remanescentes. Tipografia recalibrada (títulos 700 em vez de 900, KPIs com números tabulares, `text-wrap: balance/pretty`).

### 2. Componentes compartilhados novos
- `PageHeader` (ícone, título, descrição, ações à direita; empilha no mobile).
- `StatCard` (KPI com tooltip de critério, clicável só quando leva a um filtro real).
- `StatusBadge` (status de busca e presença digital, com ícone + texto, nunca só cor).
- `EmptyState`, `TableSkeleton`/`CardSkeleton`, `Toolbar` de filtros.
- Botões padronizados: altura mínima 44px, variantes primário/secundário/terciário/destrutivo/ícone, estado de loading interno com bloqueio de clique duplo.

### 3. Sidebar
Marca ScanRadar clicável para `/dashboard` (radar animado preservado), recolher/expandir no desktop (280px ↔ 72px) com tooltips nos ícones, drawer no mobile, item ativo com barra + ícone além da cor, foco visível. Rodapé: card do usuário com sair (ação real) e indicador de conexão n8n em quatro estados derivados de dados reais (verde conectado, amarelo não testado, vermelho falha, cinza não configurado). Remover qualquer menção fictícia a plano.

### 4. Dashboard
- Cabeçalho com seletor de período (hoje / 7 dias / 30 dias / tudo), "Nova busca", "Ver histórico" e horário da última atualização dos dados.
- KPIs: total de leads, buscas realizadas, leads com contato (telefone ou e-mail), oportunidades sem site próprio. Sem percentuais inventados.
- Distribuição digital: barras horizontais com contagem real por categoria da classificação existente.
- "Oportunidades prioritárias": até 5 leads com regra determinística documentada — alta (sem site próprio + telefone/WhatsApp), média (apenas rede social/agregador/plataforma), baixa (site próprio). Cada linha com nome, cidade, presença, contato e "Ver empresa" (abre os resultados da busca correspondente).
- Atividade recente: últimas buscas com nicho, local, data/hora, status, leads e "Abrir resultados". Empty state com "Fazer primeira busca".

### 5. Nova busca
Formulário em duas áreas: dados principais (nicho, cidade, estado — labels permanentes, validação inline, valores preservados em erro) e "Filtros avançados" recolhível contendo **apenas filtros aplicados no frontend sobre os resultados** (priorizar sem site, somente com contato, remover duplicados) — nada de parâmetros novos enviados ao n8n, já que o contrato do webhook não muda. Resumo antes do envio ("Buscar X em Cidade/UF"), "Repetir última busca" (a partir do histórico real), "Limpar campos", botão com loading e bloqueio de envio duplo, confirmação com o identificador da extração. Card "Fluxo de Extração" compacto, sem Markdown visível.

### 6. Histórico
Toolbar com busca por nicho/local, filtro de status, filtro de período, ordenação (recente, antigo, mais leads), "Limpar filtros" e contador. Tabela no desktop / cards no mobile. Ações: abrir resultados (principal) e, em menu de três pontos, repetir busca, exportar e tentar novamente (só em falhas). Paginação a partir de 15 registros. Sem exclusão/arquivamento (não há suporte no banco).

### 7. Resultados
Toolbar com busca por empresa, filtro por cidade, por presença digital, por oportunidade e por disponibilidade de contato, ordenação, seleção de colunas e exportação. Colunas: seleção, empresa, localização, telefone, e-mail, presença digital, oportunidade, ações (sem categoria e sem avaliação, que não existem nos dados). Ações por lead exibidas somente quando o dado existe: abrir no Google Maps, abrir link detectado, WhatsApp, copiar telefone, copiar e-mail, ver detalhes. Barra contextual de seleção com "Exportar selecionados" e "Copiar contatos" (sem "marcar como contatado", pois não há persistência).

### 8. Configurações
Três seções: Conexão (nome, URL do webhook com botão copiar, status, último teste, testar, salvar), Segurança (segredo mascarado, mostrar/ocultar apenas do que for digitado, aviso de que já existe segredo salvo, nunca exposto) e Diagnóstico com verificações reais: webhook configurado, conexão respondendo, última extração recebida e último payload válido — cada uma com estado aprovado/pendente/erro e ação sugerida.

### 9. Estados, responsividade e acessibilidade
Skeletons no formato final, empty states úteis, erros inline com "tentar novamente", toasts (sonner) — sem `window.alert`. Validação em 375/768/1024/1440px sem overflow horizontal, alvos de toque ≥44px, navegação por teclado, foco visível, `aria-label` em botões de ícone, `aria-live` no acompanhamento de busca, respeito a `prefers-reduced-motion`.

## Detalhes técnicos

- Alteração de banco necessária: adicionar `last_tested_at` e `last_test_error` em `n8n_settings` para o diagnóstico e o status da sidebar refletirem dados reais. Migração com GRANTs e RLS já no padrão da tabela.
- `scraper.functions.ts` ganha: contagem de distribuição digital por período, lista de oportunidades prioritárias e leitura dos campos de diagnóstico. Nenhum contrato de webhook é alterado.
- A classificação de presença digital continua sendo a de `website-utils.ts`; "site indisponível" não será exibido como categoria porque exigiria checagem HTTP por lead (fora do escopo atual).
- Sem novas dependências: React 19, TanStack Start, Tailwind v4, shadcn/ui, framer-motion, xlsx e sonner já instalados.

## Limitações declaradas

- Categoria do negócio e avaliação do Google não existem no schema, então não entram como colunas.
- Cancelamento, arquivamento e exclusão de buscas não têm suporte no backend e ficam fora da interface.
- O teste real do webhook n8n depende da instância do usuário; será validado o fluxo, não a resposta externa.
