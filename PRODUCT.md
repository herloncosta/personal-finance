# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoa física em uso solo, controlando as próprias finanças pessoais no dia a dia (lançamentos frequentes, consulta mensal do panorama). Acesso em desktop e rede local/mobile via browser.

## Product Purpose

Dar compreensão clara do fluxo financeiro pessoal: ver o mês em segundos, personalizar a organização (contas, categorias, orçamentos) e gerar relatórios/análises com IA — evoluindo para "conversar" com o próprio fluxo financeiro em linguagem natural.

Sucesso = usuário entende para onde o dinheiro foi, quanto pode gastar e o que mudar, sem abrir planilha.

## Positioning

Planilhas exigem montar tudo; apps de banco mostram só o extrato. Este produto junta painel relevante + personalização total + IA que explica e responde sobre o próprio dinheiro.

## Operating Context

Uso recorrente: lançamentos ao longo do mês, revisão mensal (receitas × despesas, por categoria, vs. orçamento). Stack existente: backend NestJS + Prisma/PostgreSQL (`/api/v1`), frontend React + Vite + TanStack Query + Recharts. Rotas atuais: `/` dashboard, `/transactions`, `/accounts`, `/categories`, `/login`, `/register`. API e front servidos na rede local (portas 3000/5173).

## Capabilities and Constraints

- Capacidades confirmadas: contas, categorias (receita/despesa), transações com filtro por mês/tipo/conta/categoria, orçamentos mensais por categoria, dashboard (KPIs, pizza por categoria, série diária, status de orçamento), categorização por IA com fallback local, insights mensais com cache 24h.
- Direção confirmada: dashboard relevante, personalização completa, relatórios com IA, interação conversacional com o fluxo financeiro.
- Em aberto: escopo da conversa com IA nesta entrega (painel de chat completo vs. relatórios gerados); nível de personalização do dashboard (layout editável agora ou depois).
- Moeda/idioma: PT-BR e BRL (preservar salvo pedido explícito).

## Brand Commitments

Direção visual por escolha do usuário (standing exit do processo de direção): **padrão fintech canônico, barra de acabamento Nubank** — roxo profundo como cor primária, cards brancos limpos sobre fundo claro, tipografia geométrica, numerais grandes, sem ironia ou quirk contrabandeado. Nome, fluxos e telas livres para repensar; PT-BR e BRL preservados.

## Evidence on Hand

Código-funcional existente como evidência de conteúdo real: `backend/src/modules/` (auth, accounts, categories, transactions, budgets, dashboard, ai), `frontend/src/` (pages, features por domínio, Recharts). Sem depoimentos, logos ou assets de marca — não fabricar prova social.

## Product Principles

1. Clareza antes de densidade: o mês explicado em segundos, detalhe a um clique.
2. Tudo personalizável: categorias, contas e orçamentos refletem a vida do usuário, não o contrário.
3. IA que responde, não que decora: toda análise precisa ser acionável e auditável nos dados.
4. Confiança silenciosa: dinheiro exige precisão — números, estados e erros sempre explícitos.
5. Evolução sem ruptura: o fluxo de lançar e revisar nunca pode ficar mais difícil.

## Accessibility & Inclusion

Necessidade básica web: contraste legível, navegação por teclado nos fluxos principais, layout utilizável em telas pequenas (uso mobile na rede local).
