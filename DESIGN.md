---
name: Personal Finance
description: Fintech BR canônica (barra Nubank) — roxo profundo, cards brancos, geométrica para números.
colors:
  primary: "#820ad1"
  primary-deep: "#3c0a5e"
  primary-ink: "#28073f"
  neutral-bg: "#f6f2fa"
  surface: "#ffffff"
  ink: "#221229"
  muted: "#6f5b7e"
  success: "#047857"
  danger: "#dc2626"
  warning: "#b45309"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  all: "8px"
spacing:
  section: "16px"
  page-x: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.all}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "#6b0aae"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.all}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.all}"
  badge:
    rounded: "{rounded.all}"
---

## Overview

Cânone fintech brasileiro, barra de acabamento Nubank: o mês sob controle à primeira vista. Hero ameixa escuro com saldo, cards brancos sobre fundo lilás, Poppins só em números e títulos curtos, pills para ações e filtros. Relatórios de IA vivem num cartão com faixa ameixa; chat conversacional fica de fora desta entrega.

## Colors

- Roxo próprio: `primary #820AD1` para CTAs e progresso saudável; `primary-deep #3C0A5E` para hero, sidebar desktop e faixa da IA; `primary-ink #28073F` para profundidade.
- Fundo `neutral-bg #F6F2FA` (lilás-claro), superfícies sempre `#FFFFFF`.
- Texto `ink #221229`; secundário `muted #6F5B7E` (tingido do roxo, nunca cinza puro).
- Semântica de dinheiro: verde `success` receitas/saudável, vermelho `danger` estouros/erros, âmbar `warning` atenção (80–99% do orçamento).
- Cores de categoria são dados do usuário e passam intactas (donut, dots, legendas).

## Typography

- Display: Poppins 500–700, `tracking-tight`, numerais grandes (saldo `text-4xl/5xl`). Títulos de seção `15px semibold`.
- Corpo: stack do sistema, `text-sm`, `leading-relaxed` em textos de IA.
- Títulos com `text-wrap: balance`. Sem kickers/eyebrows, sem texto em gradiente.

## Layout

- Desktop: sidebar ameixa fixa (`w-64`) com marca, 4 itens e perfil/sair; conteúdo `max-w-6xl`.
- Mobile: topbar compacta + bottom tab bar com safe-area; hero e grids empilham.
- Dashboard: hero saldo → donut + fluxo diário → orçamentos → análise IA. Páginas internas abrem com título + ação primária à direita.
- Espaçamento: grupos justos, seções separadas por `mt-4/6`, mais ar acima dos títulos que abaixo.

## Elevation & Depth

- Uma declaração de elevação: sombra suave colorida (`card: 0 14px 34px -16px rgba(60,10,94,.28)`; hero/modal `pop`). Sem borda sob sombra (sem ghost cards).
- Hero e faixa da IA ganham geometria plana translúcida (círculos roxos), nunca blur decorativo nem grain.

## Shapes

- Raio único `8px` em tudo: cards, hero, modal, menus, calendário, botões, inputs, filtros, badges, barras. Sem pílulas.
- Exceções: dots de status/cor e círculos decorativos de atmosfera permanecem redondos.

## Components

- `btn-primary` (retângulo roxo 8px, `active:scale`), `btn-ghost`, `field` (borda `brand-100`, foco `brand-500`), `seg`/`seg-active` (filtro sobre trilho lilás), `badge` (estado percentual e provedor IA).
- `components/fields.tsx`: `SelectField` (react-select com pele do sistema, dot de cor nas categorias), `DateField` e `MonthField` (react-datepicker pt-BR `dd/MM/yyyy` / `MM/yyyy`, calendário com pele própria, sem shift de timezone).
- Estados cobertos: skeleton pulse no carregamento, empty states com ação, erros com causa e recuperação, `focus-visible` roxo, `Esc` fecha o modal, `prefers-reduced-motion` desliga rise e barras.
- Movimento (framer-motion, `components/motion.ts`): stagger `0.07s` nas páginas, rise `14px/0.55s` ease `[0.22,1,0.36,1]`, modais com overlay fade + painel (slide+scale) via `AnimatePresence`; `MotionConfig reducedMotion="user"` global.
- Navegação fixa: sidebar desktop `sticky h-screen`; bottom tabs fixas no mobile; `scroll-behavior: smooth` só na página.
- Gráficos Recharts: donut com `paddingAngle`+`cornerRadius`, área receitas verde × despesas roxa, grade só horizontal em lilás.

## Do's and Don'ts

- Fazer: saldo gigante no hero; percentual de orçamento como badge colorido; IA com selo `local/IA · salvo`; excluir com hover-reveal e `aria-label`.
- Não fazer: cards cinzentos de KPI; bordas coloridas laterais; cards aninhados; mono como fantasia; sparklines no lugar de conteúdo; inventar prova social ou promessas na tela de login.
