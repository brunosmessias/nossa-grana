# Contas — Página Dedicada

## Problem Statement

As contas hoje são apenas badges no dashboard monolítico. Não há como ver detalhes, acompanhar evolução de saldo, ou configurar metas em contas de poupança/investimento. O usuário perde a noção de progresso financeiro.

## Goals

- [ ] Decompor contas do dashboard para página própria com visão rica
- [ ] Permitir configurar metas em contas não-correntes com progresso visual
- [ ] Mostrar cálculos automáticos (aporte mensal necessário, projeção de conclusão)
- [ ] Permitir transferência entre contas ("Guardar dinheiro")

## Out of Scope

|| Feature | Reason |
|---------|--------|
| Integração bancária automática | Fase futura, requer API de banco |
| Multi-moeda | Escopo grande, sem demanda atual |
| Histórico de saldo diário (snapshot) | Performance — adicionar depois se necessário |

---

## User Stories

### P1: Listagem de contas com saldo ⭐ MVP

**User Story**: Como membro da família, quero ver todas as contas em uma página dedicada com saldo atual e tipo, para ter visão clara do patrimônio.

**Why P1**: Hoje as contas são badges inline sem detalhe. Uma página dedicada é a base para todas as outras funcionalidades.

**Acceptance Criteria**:

1. WHEN usuário navega para `/dashboard/contas` THEN sistema SHALL mostrar cards de todas as contas ativas com nome, tipo, ícone, cor e saldo atual
2. WHEN não há contas THEN sistema SHALL mostrar estado vazio com CTA para criar primeira conta
3. WHEN usuário clica em "Nova conta" THEN sistema SHALL abrir dialog de criação com nome, tipo, saldo inicial, ícone e cor
4. WHEN contas estão archivadas THEN sistema SHALL mostrar seção separada "Contas arquivadas" colapsável
5. WHEN usuário clica em uma conta THEN sistema SHALL abrir detalhes expandidos (ou drawer/expand inline)

**Independent Test**: Criar 3 contas de tipos diferentes, navegar para `/dashboard/contas` e ver os 3 cards com saldos corretos.

---

### P2: Contas com meta e progresso visual

**User Story**: Como membro da família, quero configurar uma meta em contas de poupança/investimento/meta e ver o progresso com cálculos automáticos, para saber se estou no caminho certo.

**Why P2**: É o diferencial de inteligência da página — vai além do CRUD. Depende de P1 existir.

**Acceptance Criteria**:

1. WHEN usuário cria/edita conta com type SAVINGS, INVESTMENT ou GOAL THEN sistema SHALL permitir configurar `targetAmountCents` (valor alvo) e `targetDate` (data alvo) opcionais
2. WHEN conta tem meta definida THEN card SHALL mostrar barra de progresso com % atingido (saldo atual / valor alvo) e cor semântica (< 50% amarelo, ≥ 50% verde, ≥ 100% verde com ícone de check)
3. WHEN conta tem meta com `targetDate` THEN sistema SHALL calcular e exibir "Guarde R$ X/mês para atingir a meta" onde X = (targetAmountCents - balanceCents) / meses restantes
4. WHEN conta tem meta sem `targetDate` THEN sistema SHALL mostrar apenas "Faltam R$ X para atingir a meta"
5. WHEN meta está atingida (balanceCents ≥ targetAmountCents) THEN sistema SHALL mostrar estado de celebração visual (badge "Meta atingida!", cor verde)
6. WHEN meses restantes ≤ 0 e meta não atingida THEN sistema SHALL mostrar "Prazo vencido" em vermelho sem sugerir aporte mensal

**Independent Test**: Criar conta POUPANÇA com saldo R$ 300 e meta R$ 1000 para Dez/2026. Ver barra de progresso 30%, mensagem "Guarde R$ X/mês".

---

### P3: Mini gráfico de evolução do saldo

**User Story**: Como membro da família, quero ver a evolução do saldo de uma conta ao longo dos meses, para entender se estou progredindo.

**Why P3**: Valor visual alto, mas depende de dados históricos suficientes. Nice-to-have inicial.

**Acceptance Criteria**:

1. WHEN usuário expande detalhes de uma conta THEN sistema SHALL mostrar mini gráfico de linha (sparkline) com saldo acumulado por mês dos últimos 6 meses
2. WHEN conta tem menos de 2 meses de dados THEN sistema SHALL mostrar mensagem "Dados insuficientes para gráfico"
3. WHEN saldo subiu no último mês THEN gráfico SHALL ter cor verde; WHEN desceu, cor vermelha

**Independent Test**: Criar transações em 3 meses diferentes numa conta, expandir detalhes e ver sparkline com 3 pontos.

---

### P4: Transferência entre contas

**User Story**: Como membro da família, quero transferir dinheiro entre contas (ex: corrente → poupança), para organizar melhor meu dinheiro.

**Why P4**: Funcionalidade esperada em app financeiro. O dialog já existe mas é placeholder.

**Acceptance Criteria**:

1. WHEN usuário clica "Guardar dinheiro" THEN sistema SHALL abrir dialog com select de conta origem (apenas CHECKING ativas), select de conta destino (todas exceto origem, não-arquivadas), valor e descrição
2. WHEN transferência é confirmada THEN sistema SHALL criar duas transações: EXPENSE na origem e INCOME no destino, ambas com descrição "Transferência para [conta destino]"
3. WHEN saldo da conta origem é insuficiente THEN sistema SHALL mostrar erro "Saldo insuficiente"
4. WHEN transferência é feita THEN sistema SHALL atualizar saldos de ambas as contas

**Independent Test**: Transferir R$ 100 da corrente para poupança. Ver desconto na corrente e acréscimo na poupança.

---

### P5: Editar e arquivar contas

**User Story**: Como membro da família, quero editar nome/tipo/meta de uma conta e arquivar contas que não uso mais, para manter organizado.

**Why P5**: CRUD essencial, mas menos prioritário que a inteligência visual.

**Acceptance Criteria**:

1. WHEN usuário clica em editar conta THEN sistema SHALL abrir dialog preenchido com dados atuais (nome, tipo, ícone, cor, meta, data alvo)
2. WHEN usuário arquiva uma conta THEN sistema SHALL mover para seção "Arquivadas" e não mostrar no total do patrimônio
3. WHEN usuário desarquiva THEN conta volta para listagem principal

**Independent Test**: Editar nome de conta, arquivar, verificar que sumiu da listagem principal e aparece em arquivadas.

---

## Edge Cases

- WHEN conta tem type CHECKING THEN não SHALL mostrar campos de meta (targetAmountCents, targetDate) — não se aplica
- WHEN meta é definida com targetAmountCents = 0 THEN sistema SHALL ignorar a meta (tratar como sem meta)
- WHEN conta tem targetDate no passado THEN mostrar prazo vencido
- WHEN família não tem conta corrente THEN "Guardar dinheiro" SHALL mostrar erro "Crie uma conta corrente primeiro"

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| ACCT-01 | P1: Listagem | - | Pending |
| ACCT-02 | P1: Criar conta | - | Pending |
| ACCT-03 | P1: Contas arquivadas | - | Pending |
| ACCT-04 | P2: Configurar meta | - | Pending |
| ACCT-05 | P2: Barra de progresso | - | Pending |
| ACCT-06 | P2: Cálculo aporte mensal | - | Pending |
| ACCT-07 | P2: Meta atingida | - | Pending |
| ACCT-08 | P2: Prazo vencido | - | Pending |
| ACCT-09 | P3: Sparkline evolução | - | Pending |
| ACCT-10 | P4: Transferência | - | Pending |
| ACCT-11 | P4: Saldo insuficiente | - | Pending |
| ACCT-12 | P5: Editar conta | - | Pending |
| ACCT-13 | P5: Arquivar/desarquivar | - | Pending |

**Coverage:** 13 total, 0 mapped to tasks, 13 unmapped ⚠️

---

## Success Criteria

- [ ] Usuário pode ver todas as contas com saldo em página dedicada
- [ ] Contas com meta mostram progresso e cálculo de aporte mensal
- [ ] Transferência entre contas funciona corretamente (dupla transação)
- [ ] Layout responsivo com sidebar existente
