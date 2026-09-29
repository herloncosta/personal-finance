# AGENTS.md — Personal Finance

> Instruções para agentes (e humanos) operando neste repositório. Verdades duráveis primeiro, comandos depois.

## O que é

Fullstack de finanças pessoais: contas, transações, categorias, orçamentos mensais, dashboard e insights por IA (com fallback local). PT-BR, moeda BRL.

## Stack

- **Backend** (`backend/`): NestJS 10, Prisma 5, PostgreSQL 16. Rotas sob `/api/v1` (prefixo `api` + versionamento URI). Sem `ConfigModule`/dotenv — variáveis vêm do ambiente do shell.
- **Frontend** (`frontend/`): React 18, Vite 5, TypeScript, Tailwind 3, TanStack Query 5, Recharts, RHF + Zod, react-select, react-datepicker, framer-motion.
- **Infra**: `docker-compose.yml` provisiona **só** o Postgres na porta **5432**.

## Portas e serviços

| Serviço  | Endereço                          |
|----------|-----------------------------------|
| API      | `http://localhost:3000/api/v1`    |
| Health   | `GET /api/v1/health`              |
| Front    | `http://localhost:5173/`          |
| Postgres | `localhost:5432` (db `finance`)   |
| LAN      | `http://192.168.88.253:5173/` e `:3000` (ufw libera `3000` e `5173` p/ `192.168.88.0/24`; Vite roda com `--host 0.0.0.0`) |

## Ambiente e banco

- `.env` fica na **raiz** (ignorado pelo git). `DATABASE_URL=postgresql://fin:fin@localhost:5432/finance`.
- **Atenção volume Docker**: o volume `pgdata` foi criado com usuário `fin` — `root:root` do compose atual **não autentica** enquanto o volume persistir. Não recrie o volume sem backup.
- Backend **não** lê `.env` sozinho: exporte antes de subir (`set -a; . ../.env; set +a` a partir de `backend/`), com override de `DATABASE_URL` se preciso. Não exporte `VITE_API_URL` para o front em dev (o proxy `/api` do Vite resolve; valor absoluto fura o proxy).
- `OPENAI_API_KEY` vazia = provedor local `keyword` (correto). Chave nunca vai para o git.
- Seed: `npx prisma db seed` → `demo@finance.local / demo1234` (idempotente).

## Comandos

```bash
# db
docker compose up -d db

# backend (de backend/)
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev          # watch; recarrega sozinho
npm test                   # jest (src/**/*.spec.ts)

# frontend (de frontend/)
npm install
npm run dev -- --host 0.0.0.0
npm run build              # tsc --noEmit + vite build (validação oficial)
```

## Convenções de código

- **Frontend**: uma página = um componente; lógica de domínio em `features/<domínio>/` (`api.ts`, `hooks.ts`, componentes `TxModal.tsx`, `TxRow.tsx`, `BudgetSection.tsx`, `AccountEditModal.tsx`). Compartilhados em `components/` (`fields.tsx`, `icons.tsx`, `motion.ts`, `MonthStepper.tsx`, `Layout.tsx`, `InsightCard.tsx`).
- **Formulários**: RHF + Zod com `Controller` para `SelectField`/`DateField`; forms simples com `useState`.
- **Datas**: API fala ISO (`YYYY-MM-DD`, `YYYY-MM` para mês). Conversões sem shift de timezone em `components/fields.tsx` (`isoToDate`/`dateToISO`) e `lib/format.ts` (`shiftMonth`, `monthLabel`, `currentMonth`, `brl`).
- **Cache**: chaves `['transactions',f]`, `['accounts']`, `['dashboard',month]`, `['categories']`, `['insights',month]`. Mutações invalidam `transactions` + `accounts` (+ `dashboard` quando afeta totais).
- **Design system**: verdade em `DESIGN.md` (tokens) e `PRODUCT.md` (produto/direção). Raio único **8px** (só dots e círculos decorativos ficam redondos). Roxo `#820AD1`/`#3C0A5E`, fundo `#F6F2FA`, Poppins nos números. Ícones: SVG próprio em `icons.tsx` — nunca emoji como ícone. Animações via `components/motion.ts` (`MotionConfig reducedMotion="user"` global).
- **Backend**: DTOs com `class-validator`; `ValidationPipe{whitelist:true}` descarta campo não declarado (para expor campo novo no PATCH, declare no `Update*Dto`). Regras de negócio no service (409 conta com lançamentos, 400 categoria de tipo divergente, 400 orçamento só `expense`). Saldo da conta é calculado (`initialBalance + lançamentos`) — edição de "saldo atual" recalcula o inicial no front.
- Idioma do produto e mensagens: **PT-BR**. Sem emojis no código salvo se a UI pedir.

## Git

- Commits em **conventional commits** (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`), em PT-BR ou EN consistente com o histórico.
- Nunca commitar `.env`, `node_modules/`, `dist/`, `*.log`. `preview.png` na raiz é o screenshot oficial e **vai** para o git (referenciado no README).
- Branch principal: `main` (remoto `origin`). Push direto só para trabalho local em andamento; PR para o resto.
