# Deploy — Hostinger + Render + Neon

## Arquitetura atual

Frontend Next.js 16/React 19 exportado estaticamente para Apache; API Express 5 independente no Render; PostgreSQL/Neon via Prisma 7. Cadastro, login JWT, tarefas, subtarefas e isolamento entre usuários foram preservados. Notebook disponível a usuários autenticados, ainda como prévia em memória sem persistência de fontes/IA.

Pagamentos foram removidos por solicitação do responsável. Nenhuma migration, exclusão de dados ou alteração da conta de pagamentos foi executada. Eventuais assinaturas antigas devem ser conferidas pelo responsável na conta externa.

**Compatível com exportação estática:** páginas `/`, `/notebook` e 404 exportadas. O antigo proxy Next `/api/v1/*` foi removido: todas as chamadas da interface usam a URL absoluta do Express. Não há mais rotas de API no Next. Consumidores externos do antigo proxy devem passar a usar diretamente o Render.

URLs definitivas informadas:

- Frontend: https://startnet.app.br/tecti/2026/gpec17/projeto-eliseu/
- API: https://reieliseu-av2-terceiro-bm.onrender.com/api/v1
- Origem CORS: https://startnet.app.br

## 1. Desenvolvimento e build local

Node 24.11.1 ou patch 24.x posterior; pnpm 10.28.0. Na raiz:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm api:typecheck
pnpm build:web
pnpm check:export
```

O `.env` local já contém:

```env
NEXT_PUBLIC_API_URL=https://reieliseu-av2-terceiro-bm.onrender.com/api/v1
```

O frontend não precisa de DATABASE_URL/JWT_SECRET. Segredos nunca devem receber prefixo NEXT_PUBLIC_. O build web não executa Prisma nem acessa o banco. `pnpm build` adicionalmente gera o Prisma Client e verifica os tipos do backend.

Configuração em `next.config.mjs`: `output: "export"`, `trailingSlash: true`, imagens não otimizadas. O caminho está centralizado em `config/site.mjs`: `/tecti/2026/gpec17/projeto-eliseu`. Não há assetPrefix. `next/link` recebe rotas sem prefixo duplicado; ícones públicos recebem o prefixo explícito. Mudanças no caminho ou na API exigem novo build.

`pnpm start` agora serve **somente uma prévia local da pasta out**, sem runtime Next.js, em:

http://localhost:3000/tecti/2026/gpec17/projeto-eliseu/

O servidor de prévia não interpreta `.htaccess`; Apache real deve ser verificado depois do upload. `pnpm web:dev` abre Next em desenvolvimento no mesmo caminho. `pnpm dev` inicia Next e Express; para backend local, preencher DATABASE_URL/JWT_SECRET, usar FRONTEND_URL=http://localhost:3000 e NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1. Voltar à URL HTTPS do Render antes de gerar o build de publicação. Para usar a API Render durante desenvolvimento local, localhost precisa estar explicitamente autorizado no CORS remoto.

## 2. Neon

Manter DATABASE_URL privada no Render com SSL. Migration versionada: `20261111000000_tasks_users`. O README original registra sua aplicação via Neon MCP; o estado real do banco não foi consultado nesta preparação.

Não executar `migrate reset`, `db push`, `migrate deploy` ou remoção automática de tabelas/colunas. Alterações futuras devem seguir revisão e aplicação autorizada via Neon MCP. Colunas/tabelas antigas de pagamentos podem permanecer sem uso. `prisma generate` e health check HTTP não comprovam a conexão com PostgreSQL.

## 3. Render

O backend público respondeu ao health check no passo anterior. Nesta preparação, o preflight OPTIONS para `/api/v1/tasks`, com origem `https://startnet.app.br`, método POST e headers authorization/content-type, retornou **204** e `Access-Control-Allow-Origin: https://startnet.app.br`. Isso verifica CORS para essa requisição, não CRUD ou conexão com banco.

Configuração manual compatível com `render.yaml`:

```text
Service Type: Web Service
Repository: https://github.com/reieliseu/reieliseu-av2-terceiro-bm
Branch: main
Root Directory: . (raiz)
Runtime: Node
Build Command: pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm api:typecheck
Start Command: pnpm api:start
Health Check Path: /api/v1/health
Auto Deploy: Off
```

Variáveis:

```env
NODE_ENV=production
FRONTEND_URL=https://startnet.app.br
```

Além delas, DATABASE_URL e JWT_SECRET (mínimo 32 caracteres) privados; ALLOWED_ORIGINS somente se precisar de outras origens exatas. PORT é fornecida pelo Render. Não incluir `/tecti/...` em FRONTEND_URL. Nenhuma chave de pagamento é necessária. Instalar devDependencies no build para Prisma CLI/TypeScript.

Nenhuma configuração do Render foi alterada nesta sessão. Se houver código local ainda não enviado ao GitHub, revisar e fazer commit/push manualmente, depois publicar a revisão correta no Render. Não foi verificado qual commit o serviço remoto executa.

## 4. Hostinger / Apache / FileZilla

Build já produzido em `out/`. Estrutura principal:

```text
out/
  .htaccess
  index.html
  404.html
  notebook/
    index.html
  _next/
  ícones e demais recursos públicos
  arquivos auxiliares de navegação gerados pelo Next.js
```

Enviar **todo o conteúdo de out**, incluindo `.htaccess`, arquivos `.txt`/auxiliares e `_next`, para o diretório remoto que atende:

`https://startnet.app.br/tecti/2026/gpec17/projeto-eliseu/`

O caminho físico FTP depende da configuração institucional; não foi presumido `public_html` ou outro document root. Navegue pelo FileZilla até a pasta do projeto correspondente à URL. Não envie a pasta `out` como um nível adicional: `index.html` deve ficar diretamente na pasta `projeto-eliseu`.

Passos:

1. Conectar ao FTP institucional já configurado.
2. Localizar a pasta remota correspondente à URL do projeto; preservar arquivos institucionais e guardar cópia de eventual `.htaccess` existente antes de reconciliá-lo.
3. No painel local, abrir `out/` e selecionar todo o conteúdo, inclusive o arquivo oculto `.htaccess`.
4. Enviar os arquivos, conferir transferências com falha e repetir as que forem necessárias. Não apagar arquivos remotos fora do projeto.
5. Abrir a URL pública e testar `/notebook/` diretamente e com atualização da página.

Não enviar `.next`, `node_modules`, `.env`, fontes ou configurações privadas.

O `.htaccess` é gerado automaticamente por `scripts/prepare-export.mjs` após o build. Define DirectoryIndex, ErrorDocument 404 com subpasta e headers equivalentes aos anteriores do Next. Não existe fallback de SPA que esconda páginas inexistentes. Apache precisa permitir essas diretivas via AllowOverride; se responder 500, conferir o log/configuração institucional antes de publicar. `mod_headers` é aplicado condicionalmente; verificar os headers reais após o upload. O Analytics Vercel não é carregado no build local para Apache; permanece condicionado ao ambiente Vercel.

## 5. Testes integrados após publicação

- Página inicial, navegação por links/fragmentos e Notebook em acesso direto/reload.
- Ícones, CSS/JS e arquivos de navegação sem 404; testar uma URL inexistente (status 404).
- Cadastro/login, expiração/ausência de token e logout.
- Listagem, criação, atualização e exclusão de tarefas em ambiente autorizado.
- Subtarefas: impedir concluir pai com pendências e excluir pai com filhos.
- Duas contas: impedir consultar/alterar/excluir tarefas da outra conta.
- Notebook exige sessão, sem oferta de plano pago.
- Network: chamadas à URL Render `/api/v1`, sem localhost; Console sem erros de CORS/hidratação.
- Logs Render sem segredos. Complementar health com uma consulta autenticada para verificar banco.

## Checklist real desta preparação

| Verificação | Estado |
| --- | --- |
| Exportação com subpasta real | CONCLUÍDO — `pnpm build:web` gerou out |
| Testes automatizados | CONCLUÍDO — 10 aprovados |
| Typecheck Express | CONCLUÍDO |
| HTML/ícones/CSS/JS com prefixo, API real no bundle e .htaccess | CONCLUÍDO — `pnpm check:export`, 3 páginas e 15 recursos/links |
| Prévia HTTP estática | CONCLUÍDO — páginas/ícones 200, diretório 301, inexistente 404 |
| CORS público Render para startnet.app.br | CONCLUÍDO — preflight 204 com origem correta |
| Interação visual/hidratação em navegador | NÃO TESTADO nesta preparação |
| Cadastro/login válidos, CRUD e isolamento com banco real | NÃO TESTADO |
| Upload FTP e comportamento Apache real | PENDENTE — publicação manual |
| Deploy/commit/push e mudanças remotas | NÃO REALIZADOS |

Build exportado não equivale a teste integrado aprovado. Nenhum dado foi modificado no Neon e nenhum arquivo foi enviado ao servidor.
