# Preparação para deploy — planejador de estudos

## Estado atual

O projeto mantém Next.js 16 / React 19, Express 5, Prisma 7 e PostgreSQL/Neon. Cadastro, login JWT, tarefas, subtarefas, filtros e regras de autorização foram preservados.

Por solicitação do responsável, a integração de pagamentos foi removida: checkout, webhook Stripe, assinaturas, cancelamento, plano Premium, produtos/pedidos de compra e camada Drizzle utilizada por esses endpoints. O Notebook agora valida apenas a sessão em `/api/v1/auth/me`; qualquer usuário autenticado pode acessá-lo. Fontes e notas continuam sendo uma prévia em memória, sem persistência ou serviço de IA.

Os campos de cobrança foram retirados do schema e do cliente Prisma gerado. **Nenhuma migration foi executada e nenhum dado foi apagado do Neon.** Colunas/tabelas antigas, se existirem, podem permanecer sem uso. Não executar `migrate reset`, `db push` ou remoções automáticas. A migration versionada de usuários e tarefas permanece inalterada; o procedimento de atualização continua sendo revisão e aplicação autorizada via Neon MCP.

Remover o código não cancela eventuais assinaturas já existentes na conta Stripe. Caso tenham sido usadas cobranças reais, o responsável deve verificar a conta e encerrar a operação comercial manualmente. Esta tarefa não acessou nem alterou essa conta.

## Compatibilidade com Hostinger

O bloqueio financeiro para exportação foi eliminado. Porém **o build atual ainda não é uma exportação estática**: `next.config.mjs` mantém a configuração de runtime e `app/api/v1/[...path]/route.ts` continua existindo como proxy de compatibilidade. Não envie `.next/` ao Apache.

A interface já chama diretamente `NEXT_PUBLIC_API_URL`, então uma preparação posterior para exportação pode retirar o proxy após confirmar consumidores, configurar `output: "export"`, `trailingSlash: true`, o `basePath` real e adaptar ícones/headers. O caminho institucional e a URL final da API ainda não foram informados. Não foi inventado um destino nem gerada uma pasta `out/` nesta remoção de pagamentos.

## Ambiente local

Node 24.11.1 ou patch 24.x posterior; pnpm 10.28.0. Na raiz:

```bash
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm test
pnpm api:typecheck
pnpm dev
```

Copie `.env.example` para `.env` somente se não existir e configure:

| Variável | Uso |
| --- | --- |
| DATABASE_URL | Segredo PostgreSQL/Neon exclusivo do Express, com SSL |
| JWT_SECRET | Segredo exclusivo do Express, mínimo 32 caracteres |
| PORT | 4000 local; porta fornecida pelo Render em produção |
| FRONTEND_URL | Origem permitida pelo CORS: protocolo e domínio, sem subpasta |
| ALLOWED_ORIGINS | Outras origens exatas separadas por vírgula, se necessárias |
| NEXT_PUBLIC_API_URL | URL absoluta da API terminada em `/api/v1`; HTTPS obrigatório em produção |

Nenhuma chave de pagamento é necessária. Variáveis públicas são incorporadas durante o build e não podem conter segredos.

`pnpm web:dev` inicia somente Next.js; `pnpm api:dev` inicia somente Express. `pnpm build:web` compila apenas o frontend, sem Prisma ou credenciais privadas. `pnpm build` gera o cliente Prisma, compila o frontend e faz typecheck do backend. `pnpm start` inicia o runtime Next.js; `pnpm api:start` inicia Express separadamente.

O build de validação usa `https://api.example.invalid/api/v1`, endereço sintético sem serviço. Refaça o build com o endereço real antes da publicação.

## Neon

Manter PostgreSQL e o procedimento existente via Neon MCP. O README original registra que a migration `20261111000000_tasks_users` foi aplicada; o estado real não foi consultado nesta sessão. A remoção de campos no schema local não remove suas colunas remotas.

Antes de publicar, o responsável deve verificar conexão e estruturas em ambiente autorizado, sem expor DATABASE_URL. `prisma generate` e `/api/v1/health` não comprovam conexão com o banco. Nenhuma alteração de dados é necessária para retirar os pagamentos do código.

## Render — publicação manual

```text
Service Type: Web Service
Repository: https://github.com/reieliseu/reieliseu-av2-terceiro-bm
Branch: main
Root Directory: . (raiz)
Runtime: Node
Build Command: pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm api:typecheck
Start Command: pnpm api:start
Health Check Path: /api/v1/health
Environment Variables: NODE_ENV=production, DATABASE_URL, JWT_SECRET, FRONTEND_URL, ALLOWED_ORIGINS opcional
Auto Deploy: Off
```

Deixar o Render fornecer PORT. O YAML preserva o plano existente e não foi aplicado no provedor. Instalar as devDependencies no build para disponibilizar Prisma CLI e TypeScript. CORS compara apenas origem, nunca a subpasta do frontend. O health check confirma processo HTTP, não o banco.

## Frontend — configuração atual

Enquanto a exportação não for preparada, usar runtime Next.js (por exemplo Vercel): preset Next.js, raiz do repositório, Node 24.x, instalação `pnpm install --frozen-lockfile`, build `pnpm build:web`, saída padrão. Definir somente `NEXT_PUBLIC_API_URL` para a API real do Render. O Next.js não precisa mais de acesso ao banco ou chaves de pagamento.

Para Hostinger/FTP, ainda é necessário concluir e testar a configuração estática descrita acima; domínio, caminho público e diretório remoto são pendentes. Não enviar `.env`, `node_modules`, `.next` ou código-fonte pelo FTP.

## Validação desta alteração

Resultados finais registrados após executar os comandos:

- Build completo, geração Prisma e typecheck do backend: concluídos, exit 0.
- Testes automatizados: 10 aprovados, incluindo autenticação obrigatória, CORS e 404 nas antigas rotas de cobrança.
- Instalação com lockfile congelado: concluída; versões das dependências mantidas, Stripe/Drizzle removidos.
- Smoke HTTP Next.js: `/` e `/notebook` retornam 200; produtos, checkout e webhook removidos retornam 404.
- Banco real, CRUD autenticado e navegação visual: não testados nesta alteração.
- Deploy, FTP, alterações no Render/Neon e commit/push: não realizados.

Antes de publicar, testar cadastro/login, consulta/criação/edição/exclusão de tarefas, bloqueio de conclusão com subtarefas pendentes, isolamento entre duas contas, logout, Notebook autenticado, links e assets. Conferir Network/Console e logs do Render. Os antigos endpoints de cobrança devem responder 404 e nenhuma tela deve solicitar assinatura.
