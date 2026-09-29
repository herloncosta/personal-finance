# Personal Finance

Aplicação fullstack para gestão de finanças pessoais: contas, transações, categorias, orçamentos mensais, dashboard com gráficos e insights gerados por IA.

## ✨ Funcionalidades

- **Dashboard** — resumo mensal com gráficos (receitas × despesas, por categoria)
- **Transações** — CRUD com filtros, categorização e sugestão de categoria por IA
- **Contas** — corrente, poupança, carteira e investimento, com saldo inicial
- **Categorias** — personalizáveis por usuário, com valores padrão no seed
- **Orçamentos** — limite mensal por categoria
- **Insights IA** — resumo mensal gerado via API compatível com OpenAI (OpenAI ou OpenRouter)
- **Autenticação** — JWT (access + refresh), rotas protegidas no frontend

## 🧱 Stack

| Camada   | Tecnologias |
|----------|-------------|
| Backend  | NestJS 10, Prisma 5, PostgreSQL 16, JWT, OpenAI SDK |
| Frontend | React 18, Vite 5, TypeScript, Tailwind, TanStack Query, Recharts, React Hook Form + Zod |
| Infra    | Docker Compose (db + backend + frontend) |

## ✅ Pré-requisitos

- Docker + Docker Compose (para o fluxo recomendado), **ou**
- Node 20+ e PostgreSQL 16 (para rodar sem Docker)

## 🚀 Quickstart (Docker — recomendado)

```bash
cp .env.example .env          # Windows: copy .env.example .env
docker compose up -d          # sobe db + backend (migra sozinho) + frontend
```

Na primeira vez, aplique o seed (usuário demo + categorias padrão):

```bash
docker compose exec backend npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts
```

Acesse:

| Serviço  | URL |
|----------|-----|
| App      | http://localhost:5173 |
| API      | http://localhost:3000/api/v1 |
| Health   | http://localhost:3000/api/v1/health |
| Banco    | localhost:5433 (usuário `fin` / senha `fin` / banco `finance`) |

> **Rede local:** troque `localhost` pelo IP da máquina host (ex.: `http://192.168.88.253:5173`). O frontend usa a API via caminho relativo (`/api`, proxy do Vite), então funciona sem configuração extra.

**Login demo:** `demo@finance.local` / `demo1234`

## 🛠️ Desenvolvimento local (sem Docker)

```bash
# 1. Banco
docker compose up -d db
# ajuste DATABASE_URL no .env para localhost:5433

# 2. Backend (:3000)
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# 3. Frontend (:5173)
cd ../frontend
npm install
npm run dev
```

## ⚙️ Variáveis de ambiente

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | backend / raiz | Conexão PostgreSQL |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | backend | Segredos JWT (troque em produção!) |
| `OPENAI_API_KEY` | backend | Chave OpenAI ou OpenRouter (IA opcional sem ela) |
| `OPENAI_BASE_URL` | backend | Ex.: `https://openrouter.ai/api/v1` |
| `OPENAI_MODEL` | backend | Padrão: `gpt-4o-mini` |
| `PORT` | backend | Padrão: `3000` |
| `VITE_API_URL` | frontend | Se vazio, usa `/api/v1` via proxy do Vite |
| `VITE_PROXY_TARGET` | compose | Destino do proxy `/api` no dev (padrão: `http://localhost:3000`) |

> ⚠️ Nunca commite o `.env` real — ele está no `.gitignore`. A chave de IA deve ser tratada como segredo.

## 📜 Scripts úteis

```bash
# backend
npm run start:dev     # dev com watch (:3000)
npm run build         # build de produção
npm test              # jest
npx prisma studio     # admin visual do banco

# frontend
npm run dev           # dev (:5173)
npm run build         # typecheck + build
```

## 🗂️ Estrutura

```
├── backend/            # NestJS + Prisma
│   ├── prisma/         # schema, migrations, seed
│   └── src/modules/    # auth, accounts, categories, transactions, budgets, dashboard, ai
├── frontend/           # React + Vite
│   └── src/            # pages, features, components, lib
├── docker-compose.yml  # db (5433) + backend (3000) + frontend (5173)
└── .env.example        # modelo de configuração
```

## 📄 Licença

Uso pessoal/educacional. Adapte como precisar.
