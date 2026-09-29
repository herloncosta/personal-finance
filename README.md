# Personal Finance

Aplicação fullstack para gestão de finanças pessoais, com controle de contas, transações, categorias, orçamentos mensais, painel analítico e geração de insights por inteligência artificial.

![Preview da aplicação](./preview.png)

## Visão geral

O sistema oferece um painel mensal com a evolução de receitas e despesas, a distribuição de gastos por categoria e o acompanhamento do orçamento definido para cada categoria. As transações podem ser registradas, editadas e filtradas por período, conta e categoria, com sugestão automática de categoria. Os resumos mensais são complementados por análises geradas por provedor compatível com a API da OpenAI, com mecanismo local de contingência quando nenhuma chave está configurada. A autenticação utiliza tokens JWT de acesso e de atualização, e todas as rotas da aplicação exigem sessão válida.

## Arquitetura

O backend é construído em NestJS com persistência em PostgreSQL por meio do Prisma, organizado em módulos de autenticação, contas, categorias, transações, orçamentos, painel e inteligência artificial. O frontend é uma aplicação React com Vite e TypeScript, com gerenciamento de estado de servidor, gráficos e formulários validados. O Docker Compose é utilizado exclusivamente para provisionar o banco de dados em ambiente de desenvolvimento.

| Camada | Tecnologias |
|---|---|
| Backend | NestJS 10, Prisma 5, PostgreSQL 16, JWT, OpenAI SDK |
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS, TanStack Query, Recharts, React Hook Form, Zod |
| Infraestrutura | Docker Compose para PostgreSQL 16 |

## Pré-requisitos

Para executar o projeto é necessário ter Node.js 20 ou superior, Docker com Docker Compose para o banco de dados e acesso a um terminal com permissões para expor as portas 5433, 3000 e 5173.

## Configuração inicial

Copie o arquivo de exemplo de variáveis de ambiente e ajuste os valores conforme o ambiente local. O banco de dados é exposto na porta 5433 para evitar conflito com instalações locais na porta padrão.

```bash
copy .env.example .env
docker compose up -d db
```

Com o banco em execução, configure a conexão no arquivo `.env` para `postgresql://fin:fin@localhost:5432/finance` e inicie o backend. O comando de migração prepara o esquema e o seed cria o usuário de demonstração com as categorias padrão.

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Em outro terminal, inicie o frontend, disponível por padrão em `http://localhost:5173`, com consumo da API em `http://localhost:3000/api/v1`.

```bash
cd frontend
npm install
npm run dev
```

O acesso de demonstração utiliza o e-mail `demo@finance.local` com a senha `demo1234`. O endpoint `GET /api/v1/health` pode ser usado para verificação operacional da API. Em rede local, substitua `localhost` pelo endereço IP do hospedeiro; o frontend resolve chamadas a `/api` por meio do proxy de desenvolvimento do Vite.

## Variáveis de ambiente

| Variável | Aplicação | Descrição |
|---|---|---|
| `DATABASE_URL` | Backend | Cadeia de conexão PostgreSQL, apontando para `localhost:5433` no uso com Compose |
| `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` | Backend | Segredos para assinatura dos tokens, que devem ser substituídos em produção |
| `OPENAI_API_KEY` | Backend | Chave da OpenAI ou do OpenRouter; sem ela, o sistema usa o provedor local de contingência |
| `OPENAI_BASE_URL` | Backend | URL base do provedor, por exemplo `https://openrouter.ai/api/v1` |
| `OPENAI_MODEL` | Backend | Modelo utilizado, com padrão `gpt-4o-mini` |
| `PORT` | Backend | Porta HTTP da API, com padrão `3000` |
| `VITE_API_URL` | Frontend | Quando vazio, utiliza `/api/v1` por meio do proxy do Vite |

O arquivo `.env` real está incluído no `.gitignore` e não deve ser versionado. Chaves de IA devem ser tratadas como segredos.

## Scripts de desenvolvimento

No backend, `npm run start:dev` inicia a API em modo de observação, `npm run build` gera a versão de produção, `npm test` executa a suíte Jest e `npx prisma studio` abre a interface visual do banco. No frontend, `npm run dev` inicia o servidor de desenvolvimento e `npm run build` executa verificação de tipos seguida da compilação.

## Estrutura do repositório

```text
backend/            Camada NestJS com Prisma
backend/prisma/     Esquema, migrações e seed
backend/src/modules/ Módulos de autenticação, contas, categorias, transações, orçamentos, painel e IA
frontend/           Aplicação React com Vite
frontend/src/       Páginas, recursos por domínio, componentes e utilitários
docker-compose.yml  Provisionamento do PostgreSQL na porta 5433
.env.example        Modelo de configuração de ambiente
```

## Licença

Projeto de uso pessoal e educacional. Adaptações são permitidas conforme a necessidade.
