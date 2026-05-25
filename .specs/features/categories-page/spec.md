# Categorias — Página com Comparadores

## Problem Statement

Categorias hoje são badges com totais do mês no dashboard. Não há orçamento, comparativo histórico, nem visão de tendência. O usuário não sabe se está gastando mais ou menos que o mês anterior, nem se está dentro do orçamento.

## Goals

- [ ] Página dedicada com orçamento mensal por categoria
- [ ] Comparativo visual mês atual vs. anterior com indicadores de tendência
- [ ] Gráficos de distribuição e evolução temporal
- [ ] Destaque para categorias que estouraram o orçamento

## Out of Scope

|| Feature | Reason |
|---------|--------|
| Orçamento por membro da família | Sem `createdBy` em transações ainda |
| Sugestão automática de orçamento | Inteligência da Fase 4 |
| Categorias compartilhadas entre famílias | Escopo diferente |

---

## User Stories

### P1: Listagem de categorias com orçamento ⭐ MVP

**User Story**: Como membro da família, quero ver todas as categorias em página dedicada com gasto do mês e orçamento definido, para saber onde estou dentro ou fora do planejado.

**Why P1**: Base da página. Sem listagem com orçamento não há comparadores nem alertas.

**Acceptance Criteria**:

1. WHEN usuário navega para `/dashboard/categorias` THEN sistema SHALL mostrar cards de todas as categorias com nome, ícone, cor, tipo (INCOME/EXPENSE), gasto total do mês e orçamento mensal (se definido)
2. WHEN categoria tem orçamento definido THEN card SHALL mostrar barra de progresso (gasto / orçamento) com cor: < 80% verde, 80-99% amarelo, ≥ 100% vermelho
3. WHEN categoria não tem orçamento THEN card SHALL mostrar apenas o total gasto
4. WHEN não há categorias THEN sistema SHALL mostrar estado vazio com CTA para criar primeira categoria
5. WHEN usuário clica "Nova categoria" THEN sistema SHALL abrir dialog com nome, tipo (INCOME/EXPENSE), ícone, cor e orçamento mensal (opcional)

**Independent Test**: Criar 3 categorias EXPENSE com orçamentos diferentes, registrar gastos, navegar para página e ver barras de progresso com cores corretas.

---

### P2: Comparativo mês atual vs. anterior

**User Story**: Como membro da família, quero ver quanto gastei em cada categoria comparado ao mês anterior, para identificar tendências de aumento ou redução de gastos.

**Why P2**: Diferencial de inteligência — resposta direta à necessidade de comparadores.

**Acceptance Criteria**:

1. WHEN página carrega THEN cada card de categoria EXPENSE SHALL mostrar indicador de tendência: ↑ X% (aumento) em vermelho ou ↓ X% (redução) em verde, comparando mês atual vs. anterior
2. WHEN categoria não tinha gastos no mês anterior THEN indicador SHALL mostrar "Novo" em vez de porcentagem
3. WHEN categoria não tem gastos no mês atual THEN indicador SHALL mostrar "—" (sem comparação)
4. WHEN mês selecionado é o mais antigo com dados THEN comparativo não SHALL aparecer (não há anterior)
5. WHEN há seletor de mês THEN comparativo SHALL atualizar para refletir o mês selecionado vs. seu anterior

**Independent Test**: Registrar gastos em Alimentação em Jan (R$ 500) e Fev (R$ 700). Ver em Fev: "Alimentação ↑ 40%" em vermelho.

---

### P3: Gráficos de distribuição e evolução

**User Story**: Como membro da família, quero ver gráficos visuais de como meus gastos estão distribuídos e como evoluíram ao longo do tempo, para ter entendimento visual rápido.

**Why P3**: Gráficos são o impacto visual maior, mas dependem de P1 (dados estruturados).

**Acceptance Criteria**:

1. WHEN página carrega THEN sistema SHALL mostrar donut chart com distribuição de gastos por categoria no mês (top 5 + "Outros")
2. WHEN não há gastos no mês THEN donut SHALL mostrar estado vazio "Sem gastos no período"
3. WHEN usuário clica em uma categoria THEN sistema SHALL expandir/mostrar gráfico de linha com evolução dos gastos dessa categoria nos últimos 6 meses
4. WHEN gráfico de linha tem menos de 2 pontos THEN SHALL mostrar "Dados insuficientes"
5. WHEN donut chart tem uma categoria dominante (> 50%) THEN SHALL destacar visualmente (cor mais forte ou separação)

**Independent Test**: Registrar gastos em 4 categorias no mês. Ver donut com 4 fatias. Clicar em uma e ver gráfico de linha.

---

### P4: Ranking de tendências

**User Story**: Como membro da família, quero ver rapidamente quais categorias mais cresceram e quais mais reduziram, para focar onde preciso agir.

**Why P4**: Micro-insight automático — vai além do comparativo bruto.

**Acceptance Criteria**:

1. WHEN página carrega THEN sistema SHALL mostrar seção "Tendências" com top 3 categorias que mais cresceram (↑) e top 3 que mais reduziram (↓) vs. mês anterior
2. WHEN não há dados suficientes (menos de 2 meses) THEN seção SHALL mostrar "Dados insuficientes para tendências"
3. WHEN há empate no ranking THEN desempate SHALL ser pelo valor absoluto do gasto

**Independent Test**: Com 4+ categorias com histórico de 2 meses, ver ranking com as 3 que mais subiram e 3 que mais caíram.

---

### P5: Editar categorias

**User Story**: Como membro da família, quero editar nome, ícone, cor e orçamento de uma categoria, para manter categorias atualizadas.

**Why P5**: Manutenção básica, mas menos prioritário.

**Acceptance Criteria**:

1. WHEN usuário clica em editar categoria THEN sistema SHALL abrir dialog preenchido com dados atuais (nome, tipo, ícone, cor, orçamento mensal)
2. WHEN tipo da categoria é alterado THEN sistema SHALL verificar se existem transações associadas — se sim, mostrar aviso "Transações existentes usam esta categoria"
3. WHEN orçamento é alterado THEN novo valor SHALL aplicar imediatamente ao cálculo de progresso

**Independent Test**: Editar orçamento de "Alimentação" de R$ 800 para R$ 1000 e ver barra de progresso atualizar.

---

## Edge Cases

- WHEN orçamento é 0 THEN tratar como sem orçamento (não mostrar barra)
- WHEN gastos = 0 e orçamento > 0 THEN barra mostra 0% em verde
- WHEN categoria INCOME THEN não mostrar comparativo de gastos (mostrar receita comparativa)
- WHEN família tem apenas 1 mês de dados THEN comparativos e tendências SHALL mostrar "Primeiro mês — sem histórico"

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| CAT-01 | P1: Listagem de categorias | - | Pending |
| CAT-02 | P1: Barra de progresso orçamento | - | Pending |
| CAT-03 | P1: Criar categoria | - | Pending |
| CAT-04 | P2: Indicador de tendência | - | Pending |
| CAT-05 | P2: Casos sem dados anteriores | - | Pending |
| CAT-06 | P2: Seletor de mês | - | Pending |
| CAT-07 | P3: Donut chart distribuição | - | Pending |
| CAT-08 | P3: Gráfico de linha por categoria | - | Pending |
| CAT-09 | P4: Ranking tendências | - | Pending |
| CAT-10 | P5: Editar categoria | - | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped ⚠️

---

## Success Criteria

- [ ] Categorias mostram orçamento e progresso visual
- [ ] Comparativo mês a mês com setas de tendência funciona
- [ ] Gráficos de distribuição e evolução renderizam corretamente
- [ ] Categorias estouradas têm destaque visual claro
