# Redesign de Branding: ScanRadar

Este plano detalha a transição da identidade visual de "Maps Leads" para **ScanRadar**, focando na implementação de um componente de radar animado premium e na atualização da consistência da marca em toda a interface.

## Alterações Visuais

### 1. Novo Componente: `AnimatedRadarLogo`
Criar um componente reutilizável em `src/components/AnimatedRadarLogo.tsx` usando SVG e CSS para máxima performance.
- **Estrutura**: Container circular 38x38px, fundo azul-marinho profundo.
- **Elementos**: Três círculos concêntricos finos, ponto central fixo, feixe de varredura rotativo e um "blip" (ponto detectado) com pulsação suave.
- **Animação**: Rotação linear de 360° do feixe (2.5s a 3.5s).
- **Acessibilidade**: Suporte a `prefers-reduced-motion` e atributos ARIA.

### 2. Barra Lateral (`DashboardLayout.tsx`)
Substituir o cabeçalho atual pela nova marca.
- **Logotipo**: Integrar o `AnimatedRadarLogo` com o texto **ScanRadar**.
- **Tipografia**: Peso 700-800, cor escura sólida (sem gradientes neon), alinhamento vertical perfeito.
- **Responsividade**: Em modo compacto, mostrar apenas o radar centralizado.

### 3. Metadados e SEO (`__root.tsx` e páginas de conteúdo)
Atualizar o título da aplicação e metadados para refletir o novo nome.
- Substituir "Lovable App" / "Maps Leads" por **ScanRadar**.
- Configurar títulos específicos para cada rota (ex: "ScanRadar | Dashboard").

## Detalhes Técnicos
- **Estilos**: Uso de `oklch` para cores e Tailwind para layout.
- **Animações**: CSS nativo no SVG para o feixe giratório; Framer Motion para entradas de página se necessário.
- **Performance**: Zero dependências externas extras; SVG puro.

## Arquivos a serem modificados
- `src/components/AnimatedRadarLogo.tsx` (Novo)
- `src/components/DashboardLayout.tsx` (Logo e Sidebar)
- `src/routes/__root.tsx` (Metadados raiz)
- `src/routes/_authenticated.dashboard.tsx` (Head)
- `src/routes/_authenticated.search.tsx` (Head)
- `src/routes/_authenticated.history.tsx` (Head)
- `src/routes/_authenticated.settings.tsx` (Head)
- `src/routes/_authenticated.results.$searchId.tsx` (Head)
