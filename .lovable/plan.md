# Maps Leads — painel de geração de leads via n8n

Painel SaaS profissional que dispara o workflow n8n de scraping do Google Maps, exibe os leads retornados, permite filtrar, baixar em CSV/Excel e consultar o histórico. O scraping continua 100% no n8n.

## Acesso

Login por e-mail e senha. Cada usuário vê apenas suas próprias pesquisas, leads e configuração de integração.

## Telas

**Login / Cadastro** — e-mail e senha, com mensagens de erro amigáveis.

**Dashboard** — cards de resumo (pesquisas realizadas, leads encontrados, leads com e-mail, leads com website) e lista de pesquisas recentes com atalho para os resultados.

**Nova pesquisa** — título "Google Maps Lead Scraper", subtítulo "Encontre empresas e potenciais clientes em poucos minutos.". Campos: Termo da busca, Cidade, UF (select com os 27 estados). Botão "Encontrar Leads". Validação de campos obrigatórios, trim automático e bloqueio de envio duplicado enquanto houver pesquisa em andamento.

**Processando** — painel de etapas (Preparando pesquisa, Buscando empresas, Analisando websites, Extraindo contatos, Salvando resultados) exibidas como progresso indeterminado, sem porcentagens inventadas, mostrando termo e local pesquisados.

**Resultados** — "Pesquisa concluída" + subtítulo com termo, cidade e UF. Cards de resumo (empresas encontradas, com website, com e-mail, com telefone). Tabela profissional no desktop (Empresa, Telefone, Bairro, Cidade, Website, E-mail, E-mail 2) e cards expansíveis no mobile. Filtros: busca por empresa, com/sem e-mail, com/sem website, bairro, cidade, UF; ordenação por nome, bairro ou cidade. Botões "Baixar CSV", "Baixar Excel" e, quando o n8n informar, aviso "Pesquisa salva no Google Sheets" com botão "Ver no Google Sheets".

**Histórico** — linhas/cards com termo, cidade, UF, data, quantidade de leads, nome da aba e status, com ações Ver resultados, Baixar e Google Sheets. Persistido no banco, acessível sem rodar o scraper de novo.

**Configurações → Integração** — status 🟢 Conectado / 🔴 Não configurado, campos Webhook URL, Webhook Secret (exibido apenas como ••••••••, nunca o valor real) e nome da integração. Botões "Salvar configuração" e "Testar conexão", com retorno amigável de sucesso ou falha.

## Backend e segurança

- Lovable Cloud (banco, autenticação e execução server-side) será ativado.
- A URL e o secret do webhook ficam em tabela protegida, sem nenhuma política de leitura pelo navegador: apenas o código server-side lê o valor real. O frontend recebe somente status e uma máscara.
- O navegador nunca chama o n8n: chama uma função server-side da própria aplicação, que valida o usuário, valida o payload, monta a requisição, envia o header `X-Webhook-Secret` e devolve apenas os dados tratados.
- Proteção contra abuso: exige sessão autenticada, limite de disparos por usuário por minuto, bloqueio de pesquisa idêntica já em andamento via requestId/idempotência, validação de tamanho e formato de todos os campos.
- Erros técnicos são registrados no servidor; o usuário vê apenas mensagens amigáveis (falha de conexão, pesquisa falhou, nenhum resultado, integração indisponível, timeout).

## Dados

- `searches`: id, user_id, request_id, termo, cidade, uf, sheet_name, sheet_url, status, total_leads, created_at, completed_at, error_message.
- `leads`: id, search_id, nome, telefone, bairro, cidade, uf, website, email, email2, created_at.
- Relação 1:N; acesso restrito ao dono dos registros.

## Fluxo de execução

1. Usuário envia termo/cidade/uf.
2. A aplicação cria a pesquisa com status "processando" e chama o n8n com `{ termo, cidade, uf }`.
3. O n8n responde na mesma requisição com `success`, `requestId`, `pesquisa`, `resultado.leads`, `resultado.aba`, `totalLeads` e `googleSheet`.
4. A resposta é validada, os leads são gravados no banco e a pesquisa é marcada como concluída.
5. Se a chamada estourar o tempo limite, a pesquisa fica marcada como pendente e o usuário é orientado a verificar o histórico.

## Exportação

CSV em UTF-8 com BOM (acentuação correta) e Excel (.xlsx) com as colunas Nome, Telefone, Bairro, Cidade, UF, Website, E-mail, E-mail2. Nome do arquivo derivado da pesquisa, ex.: `dentistas-duque-de-caxias-rj.xlsx`.

## Design

Estética de ferramenta SaaS profissional: paleta sóbria (azul-petróleo/grafite com acento discreto), muito espaço em branco, bordas sutis, sombras leves, tipografia com hierarquia clara, microanimações contidas. Sem gradientes chamativos nem aparência de landing page. Sidebar fixa no desktop que vira menu no mobile; tabelas viram cards e filtros ficam recolhíveis em telas pequenas.

## Detalhes técnicos

- TanStack Start + React + Tailwind; rotas protegidas sob o layout autenticado.
- Camada `scraperService` com `startSearch`, `getSearch`, `getSearchHistory`, `downloadCsv`, `downloadExcel`; nenhum fetch solto em componentes.
- Tipos TypeScript: `Search`, `Lead`, `SearchStatus`, `ScraperResponse`, `WebhookResponse`.
- Validação com Zod no cliente e no servidor.
- `xlsx` (SheetJS) para a exportação Excel.
- README interno documentando a configuração da integração pelo painel.
