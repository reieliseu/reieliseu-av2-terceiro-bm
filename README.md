# Mentor Estudantil — Organizador de Estudos

Aplicação full stack para organizar tarefas de estudo por matéria, prazo, prioridade e situação. Cada estudante acessa apenas seus próprios registros. A API bloqueia a conclusão de uma tarefa enquanto houver subtarefas pendentes.

## Tecnologias

- Frontend: Next.js 16 / React 19 e Tailwind CSS **4.3.0**.
- Backend: Node.js, Express **5.1.0** e TypeScript, organizado em rotas, controllers, services, middleware e validações.
- Persistência: PostgreSQL no Neon com Prisma ORM e `@prisma/client` **7.10.0**.
- Autenticação: JWT com validade de 6 horas; senhas protegidas com bcryptjs.
- Validação: Zod; carregamento e atualização de tarefas no frontend com SWR.

## Requisitos

- Node.js 20 ou superior e pnpm.
- PostgreSQL acessível pela aplicação (Neon em desenvolvimento/produção).
- `DATABASE_URL` e `JWT_SECRET` configurados no ambiente. O segredo JWT deve ter pelo menos 32 caracteres.

## Configuração e execução local

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Copie `.env.example` para `.env` e configure `DATABASE_URL` com a conexão PostgreSQL e `JWT_SECRET` com um segredo aleatório de pelo menos 32 caracteres. Não envie `.env` ao repositório.
3. Gere o cliente Prisma:

   ```bash
   pnpm prisma:generate
   ```

   A migration versionada já foi aplicada ao branch principal do Neon. Mudanças futuras no schema devem ser aplicadas via Neon MCP; não execute `prisma migrate deploy` contra este projeto.
4. Inicie a interface e a API em processos de desenvolvimento:

   ```bash
   pnpm dev
   ```

   A interface inicia em `http://localhost:3000` e a API Express em `http://localhost:4000`. Para iniciar apenas a API: `pnpm api:dev`.

## Testes automatizados

Execute `pnpm test` para validar os schemas de cadastro/login e as regras de validação do CRUD. Execute `pnpm api:typecheck` para checar os tipos do backend. A validação de ponta a ponta com o banco deve ser feita após configurar o ambiente e publicar a API; o roteiro está na seção Publicação.

## API REST

Prefixo: `/api/v1`. Todas as respostas são JSON. Exceto saúde, as rotas de tarefas e `/auth/me` exigem `Authorization: Bearer <token>`. 

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `GET` | `/health` | Público | Verifica disponibilidade da API. |
| `POST` | `/auth/register` | Público | Cria usuário, armazena hash e retorna JWT. |
| `POST` | `/auth/login` | Público | Autentica e retorna JWT. |
| `GET` | `/auth/me` | JWT | Retorna o usuário da sessão atual. |
| `GET` | `/tasks` | JWT | Lista tarefas próprias; aceita `status`, `subject` e `q`. |
| `POST` | `/tasks` | JWT | Cria uma tarefa; `parentId` opcional vincula uma subtarefa. |
| `PATCH` | `/tasks/:id` | JWT | Atualiza campos e situação de uma tarefa própria. |
| `DELETE` | `/tasks/:id` | JWT | Exclui tarefa própria sem subtarefas. |

### Regra de negócio e autorização

A API impede concluir uma tarefa que ainda tenha subtarefas não concluídas, respondendo HTTP `409`. Também impede excluir tarefas que ainda possuam subtarefas, criar ciclos na hierarquia e vincular tarefas entre contas. Todas as consultas e alterações filtram pelo usuário autenticado; a interface não é considerada uma barreira de segurança.

### Códigos HTTP principais

- `200`: consulta, login ou atualização concluída.
- `201`: usuário ou tarefa criada.
- `204`: exclusão concluída.
- `400`: dados inválidos.
- `401`: token ausente, inválido ou expirado; credenciais inválidas.
- `403`: origem não autorizada.
- `404`: recurso inexistente ou de outra conta.
- `409`: conflito com a regra de negócio ou cadastro duplicado.
- `500`: erro inesperado, com mensagem sem detalhes internos.

## Estrutura

```text
app/                         Interface React/Next
components/                  Formulário de acesso, painel, formulário e cartão de tarefa
backend/src/
  app.ts                      Configuração Express, CORS e middlewares
  server.ts                   Inicialização e encerramento gracioso
  routes/                     Definição das rotas REST
  controllers/                Tradução HTTP e validação de entrada
  services/                   Regras de negócio e operações Prisma
  middleware/                 JWT, rate limit, erros e tipos Express
  validators/                 Schemas Zod
prisma/schema.prisma          Modelos relacionais
prisma/migrations/             SQL versionado; alterações aplicadas via Neon MCP
```

## Variáveis de ambiente

| Variável | Onde configurar | Uso |
| --- | --- | --- |
| `DATABASE_URL` | API | URL de conexão PostgreSQL/Neon. |
| `JWT_SECRET` | API | Segredo privado (mínimo 32 caracteres). |
| `PORT` | API | Porta HTTP; o servidor usa a porta definida pela hospedagem ou `4000`. |
| `FRONTEND_URL` | API | Origem principal permitida pelo CORS. |
| `ALLOWED_ORIGINS` | API | Origens adicionais, separadas por vírgula, se necessário. |
| `NEXT_PUBLIC_API_URL` | Frontend | URL pública da API terminada em `/api/v1`; localmente usa `http://localhost:4000/api/v1`. |

O arquivo `.env.example` contém somente nomes e valores vazios/de desenvolvimento; não coloque segredos no frontend, no código ou no repositório.

## Publicação (AV2)

A configuração `render.yaml` prepara o serviço Express no Render. Configure no serviço `DATABASE_URL`, `JWT_SECRET` e `FRONTEND_URL` usando os valores privados do ambiente. Publique a interface Next.js na Vercel e defina `NEXT_PUBLIC_API_URL` como `https://<host-da-api>/api/v1`; defina `FRONTEND_URL` na API como a origem pública exata da interface. Publique primeiro a API e o banco, depois a interface, e teste cadastro, login, CRUD, regra de subtarefas, logout e acesso sem token pela URL pública.

**URL pública da interface:** preencher após publicar na Vercel.  
**URL pública da API:** preencher após publicar no Render.

## Componentes e fontes

Os componentes de interface específicos do projeto foram escritos neste repositório (`components/auth-panel.tsx`, `components/study-dashboard.tsx`, `components/task-form.tsx` e `components/task-card.tsx`); não foi copiado um template de terceiros. Ícones: [Lucide React](https://lucide.dev/guide/packages/lucide-react). Estilos utilitários: [documentação oficial Tailwind CSS](https://tailwindcss.com/docs).
