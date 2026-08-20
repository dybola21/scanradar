import { createFileRoute } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-8 max-w-4xl mx-auto prose dark:prose-invert">
      <h2>9. INTEGRAÇÃO COM O WORKFLOW N8N EXISTENTE</h2>
      <p>
        A aplicação deve ser implementada já preparada para o workflow n8n que será conectado posteriormente.
      </p>
      <p>O workflow recebe:</p>
      <pre>
        {`{
  "termo": "Dentistas",
  "cidade": "Duque de Caxias",
  "uf": "RJ"
}`}
      </pre>
      <p>e deverá retornar uma estrutura semelhante a:</p>
      <pre>
        {`{
  "success": true,
  "requestId": "abc123",
  "pesquisa": {
    "termo": "Dentistas",
    "cidade": "Duque de Caxias",
    "uf": "RJ"
  },
  "resultado": {
    "aba": "Dentistas - Duque de Caxias - RJ",
    "totalLeads": 54,
    "leads": [
      {
        "Nome": "Empresa X",
        "Telefone": "21999999999",
        "Bairro": "Centro",
        "Cidade": "Duque de Caxias",
        "UF": "RJ",
        "Website": "https://...",
        "E-mail": "contato@empresa.com",
        "E-mail2": ""
      }
    ]
  },
  "googleSheet": {
    "name": "Dentistas - Duque de Caxias - RJ",
    "url": "https://docs.google.com/..."
  }
}`}
      </pre>
      <p>Não criar lógica falsa ou mockada de scraping.</p>
      <p>
        Durante desenvolvimento, criar apenas uma camada de serviço que permita testar com dados mockados localmente, mas deixar a integração real pronta.
      </p>

      <h3>Contrato da integração</h3>
      <p>Criar:</p>
      <p><code>startSearch(payload)</code></p>
      <p>Payload:</p>
      <pre>
        {`{
  termo: string;
  cidade: string;
  uf: string;
}`}
      </pre>
      <p>A implementação real deverá ficar exclusivamente no backend/server-side.</p>
      <p>Nunca executar:</p>
      <p><code>fetch(N8N_WEBHOOK_URL)</code></p>
      <p>diretamente em componentes React.</p>
      <p>O frontend deve chamar somente uma API interna da aplicação.</p>

      <h3>API interna</h3>
      <p>Criar:</p>
      <p><code>POST /api/scraper/start</code></p>
      <p>Responsabilidades:</p>
      <ol>
        <li>Verificar autenticação.</li>
        <li>Validar payload com Zod.</li>
        <li>Verificar limite de requisições.</li>
        <li>Criar <code>requestId</code>.</li>
        <li>Criar registro em <code>searches</code> com status <code>processing</code>.</li>
        <li>Recuperar N8N_WEBHOOK_URL e N8N_WEBHOOK_SECRET do ambiente seguro.</li>
        <li>Fazer POST para o n8n.</li>
        <li>Enviar:</li>
      </ol>
      <pre>
        {`Content-Type: application/json
X-Webhook-Secret: <secret>

Body:
{
  "termo": "...",
  "cidade": "...",
  "uf": "..."
}`}
      </pre>
      <ol start={9}>
        <li>Validar a resposta com Zod.</li>
        <li>Persistir os leads.</li>
        <li>Atualizar a pesquisa.</li>
        <li>Retornar ao frontend somente os dados necessários.</li>
      </ol>

      <h3>Resposta normal</h3>
      <p>Retornar:</p>
      <pre>
        {`{
  "success": true,
  "searchId": "...",
  "requestId": "...",
  "status": "completed",
  "resultado": {
    "totalLeads": 54,
    "leads": [...]
  },
  "googleSheet": {
    "name": "...",
    "url": "..."
  }
}`}
      </pre>

      <h3>Timeout</h3>
      <p>Se o n8n não responder dentro do limite configurado:</p>
      <ol>
        <li>Não apagar a pesquisa.</li>
        <li>Alterar status para <code>pending</code>.</li>
        <li>Registrar o erro apenas nos logs server-side.</li>
        <li>Retornar uma resposta amigável ao usuário.</li>
        <li>Não exibir stack trace ou detalhes internos.</li>
      </ol>
      <p>
        Criar a arquitetura de forma que posteriormente possa ser substituída por processamento assíncrono com:
      </p>
      <p>searchId, requestId, status</p>
      <p>sem necessidade de refazer o frontend.</p>

      <h3>Status</h3>
      <p>Utilizar exclusivamente:</p>
      <p>pending, processing, completed, failed</p>
      <p>Não criar porcentagens fictícias.</p>

      <h3>Idempotência</h3>
      <p>Toda requisição deverá possuir:</p>
      <p>requestId</p>
      <p>Gerar um UUID no backend.</p>
      <p>Impedir duas pesquisas idênticas simultaneamente para o mesmo usuário.</p>
      <p>Uma pesquisa será considerada idêntica quando:</p>
      <p>termo + cidade + UF</p>
      <p>forem iguais e existir outra pesquisa daquele usuário com status:</p>
      <p>pending ou processing</p>

      <h3>Segurança adicional</h3>
      <p>Não permitir que o usuário envie:</p>
      <ul>
        <li>webhook URL;</li>
        <li>webhook secret;</li>
        <li>headers;</li>
        <li>endpoint;</li>
        <li>código;</li>
        <li>comandos arbitrários.</li>
      </ul>
      <p>O usuário somente informa:</p>
      <p>Termo, Cidade, UF</p>
      <p>Toda a configuração da integração acontece exclusivamente na tela administrativa.</p>

      <h3>Google Sheets</h3>
      <p>O frontend não deve tentar criar ou editar abas do Google Sheets.</p>
      <p>O n8n continua responsável por:</p>
      <ul>
        <li>criar a aba;</li>
        <li>definir o nome da aba;</li>
        <li>inserir os leads;</li>
        <li>retornar <code>sheet_name</code>;</li>
        <li>retornar <code>sheet_url</code>.</li>
      </ul>
      <p>O site somente salva essas informações no banco e fornece o botão "Ver no Google Sheets".</p>

      <h3>Banco</h3>
      <p>Ao receber os leads:</p>
      <p>Criar <code>searches</code> primeiro.</p>
      <p>Depois inserir os registros em <code>leads</code>.</p>
      <p>Relacionamento: <code>searches.id → leads.search_id</code></p>
      <p>Ao reabrir uma pesquisa no histórico, os resultados devem ser carregados do banco da aplicação e NÃO disparar novamente o n8n.</p>

      <h3>Exportações</h3>
      <p>As exportações devem utilizar os dados já armazenados em <code>leads</code>.</p>
      <p>Nunca chamar o n8n apenas para gerar um download.</p>
      <p>CSV: UTF-8 + BOM. Separador: <code>,</code></p>
      <p>Excel: XLSX usando SheetJS.</p>
      <p>Colunas: Nome, Telefone, Bairro, Cidade, UF, Website, E-mail, E-mail2</p>

      <h3>Critério de conclusão</h3>
      <p>A implementação só será considerada concluída quando for possível:</p>
      <ol>
        <li>Criar usuário.</li>
        <li>Fazer login.</li>
        <li>Configurar URL e Secret do n8n.</li>
        <li>Testar conexão.</li>
        <li>Criar pesquisa.</li>
        <li>Enviar <code>{`{ termo, cidade, uf }`}</code>.</li>
        <li>Receber a resposta do webhook.</li>
        <li>Salvar a pesquisa.</li>
        <li>Salvar todos os leads.</li>
        <li>Visualizar resultados.</li>
        <li>Filtrar resultados.</li>
        <li>Baixar CSV.</li>
        <li>Baixar XLSX.</li>
        <li>Ver o histórico.</li>
        <li>Reabrir uma pesquisa antiga.</li>
        <li>Abrir o Google Sheets.</li>
        <li>Garantir que um usuário não consiga acessar pesquisas ou leads de outro usuário.</li>
      </ol>
    </div>
  );
}
