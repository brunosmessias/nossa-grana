# STATE - Nossa Grana V2

## Decisões

- Projeto novo, sem branch longa do legado.
- TLC obrigatório em qualquer entrega.
- Arquitetura orientada a domínios.
- **Lib de gráficos**: Recharts (leve, SSR-friendly, boa integração com Tailwind/shadcn).
- **Contas com meta**: types GOAL, SAVINGS, INVESTMENT terão `targetAmountCents` + `targetDate` para progresso e projeção.
- **Orçamento por categoria**: `monthlyBudgetCents` na tabela categories — sem tabela separada (mais simples).
- **Dashboard como hub**: não é mais a página única — redireciona para páginas dedicadas com inteligência.
- **Cada página tem camada de inteligência**: não é CRUD puro — gráficos, comparadores, insights embutidos.

## Status atual

- Fase 1 completa: auth, onboarding, auditoria, design-system.
- MVP funcional: dashboard monolítico com criação de contas, categorias, transações.
- O dashboard atual é um componente único (`ui.tsx`, ~475 linhas) que precisa ser decomposto em páginas.
- Nenhuma lib de gráficos instalada ainda.
- Nenhum campo de meta/orçamento no banco.

## Bloqueios

- Nenhum no momento.

## Próximos passos

1. Adicionar `recharts` ao projeto.
2. Adicionar colunas `targetAmountCents`, `targetDate` em `accounts` e `monthlyBudgetCents` em `categories`.
3. Gerar e rodar migration.
4. Implementar páginas P1-P5 (ver ROADMAP.md).
5. Refatorar dashboard monolítico para hub com links para páginas dedicadas.

## Débitos técnicos registrados

- Executar migrations reais do Better Auth/Drizzle e validar tabelas geradas.
- Dashboard `page.tsx` tem bug: referencia `session.user.id` sem declarar `session`.
- E2E smoke test está stale: procura heading errado.
- `src/modules/` existe mas está vazio — estrutura planejada mas não finalizada.
- `bun.lock` junto com `bun-workspace.yaml` — projeto usa bun.

## Preferências

- Linguagem da UI: pt-BR.
- Dark mode default.
- Valores monetários sempre em centavos (integer).
