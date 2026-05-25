# Transações — Página com Filtros e Busca

## Problem Statement

Transações hoje estão em tabelas fixas (despesas e rendas) no dashboard mensal, sem busca, filtros ou edição. O usuário não consegue encontrar uma transação específica nem corrigir erros. É a página mais utilitária do app.

## Goals

- [ ] Tabela completa com paginação e busca textual
- [ ] Filtros avançados por conta, categoria, tipo, período e faixa de valor
- [ ] Agrupamento por dia/semana/mês/categoria
- [ ] Editar e excluir transações existentes

## Out of Scope

|| Feature | Reason |
|---------|--------|
| Transações recorrentes automáticas | Feature separada (Fase 5) |
| Anexar comprovante/recibo | Requer storage de arquivos |
| Exportar CSV/PDF | Fase futura |
| Tags/labels em transações | Escopo adicional |

---

## User Stories

### P1: Tabela de transações com busca e paginação ⭐ MVP

**User Story**: Como membro da família, quero ver todas as transações em uma tabela com busca por descrição e paginação, para encontrar e visualizar meu histórico.

**Why P1**: Funcionalidade mais básica e esperada — substitui as tabelas fixas do dashboard.

**Acceptance Criteria**:

1. WHEN usuário navega para `/dashboard/transacoes` THEN sistema SHALL mostrar tabela com todas as transações ordenadas por data (mais recente primeiro), com colunas: data, descrição, categoria, conta, tipo, valor
2. WHEN usuário digita na busca THEN sistema SHALL filtrar transações por descrição em tempo real (debounce 300ms)
3. WHEN há mais de 20 transações THEN sistema SHALL paginar com controles de navegação
4. WHEN não há transações THEN sistema SHALL mostrar estado vazio "Nenhuma transação registrada" com CTA para criar
4. WHEN usuário clica "Nova transação" THEN sistema SHALL abrir dialog de criação existente
5. WHEN busca não retorna resultados THEN sistema SHALL mostrar "Nenhuma transação encontrada para '[termo]'"

**Independent Test**: Criar 25 transações, navegar para página, buscar por uma descrição específica e ver apenas resultados relevantes. Navegar entre páginas.

---

### P2: Filtros avançados

**User Story**: Como membro da família, quero filtrar transações por conta, categoria, tipo (INCOME/EXPENSE), período e faixa de valor, para analisar padrões específicos.

**Why P2**: Poder de análise — sem filtros a tabela é apenas uma lista longa.

**Acceptance Criteria**:

1. WHEN página carrega THEN sistema SHALL mostrar filtros: tipo (INCOME/EXPENSE/Todos), conta (select), categoria (select), período (range de datas), faixa de valor (mínimo/máximo)
2. WHEN filtros são aplicados THEN sistema SHALL atualizar tabela e resumo lateral em tempo real
3. WHEN múltiplos filtros são combinados THEN sistema SHALL aplicar interseção (AND lógico)
4. WHEN filtros estão ativos THEN sistema SHALL mostrar badge "X filtros ativos" com botão "Limpar filtros"
5. WHEN filtro de período é usado sem data fim THEN considerar até hoje; sem data início THEN considerar desde sempre

**Independent Test**: Filtrar por tipo EXPENSE + conta "Nubank" + mês atual. Ver apenas despesas da conta Nubank no período.

---

### P3: Resumo lateral com totais

**User Story**: Como membro da família, quero ver um resumo dos totais filtrados (receita, despesa, saldo, quantidade), para ter visão rápida do contexto filtrado.

**Why P3**: Complementa a tabela com contexto numérico sem precisar calcular manualmente.

**Acceptance Criteria**:

1. WHEN tabela mostra transações THEN sistema SHALL exibir resumo lateral com: total de receitas, total de despesas, saldo líquido, quantidade de transações e valor médio por transação
2. WHEN filtros mudam THEN resumo SHALL atualizar junto com a tabela
3. WHEN nenhuma transação corresponde aos filtros THEN resumo SHALL mostrar todos os valores zerados

**Independent Test**: Filtrar despesas e ver resumo com total de despesas e saldo zerado (sem receitas).

---

### P4: Agrupamento de transações

**User Story**: Como membro da família, quero agrupar transações por dia, semana, mês ou categoria, para ver padrões de consumo de diferentes ângulos.

**Why P4**: Visão analítica, mas depende da tabela base (P1).

**Acceptance Criteria**:

1. WHEN página carrega THEN sistema SHALL ter seletor de agrupamento: "Lista", "Por dia", "Por semana", "Por mês", "Por categoria"
2. WHEN agrupamento "Por dia" selecionado THEN transações SHALL ser agrupadas por data com cabeçalho "DD de Mês" e subtotal por grupo
3. WHEN agrupamento "Por categoria" selecionado THEN transações SHALL ser agrupadas por categoria com ícone e subtotal
4. WHEN agrupamento muda THEN paginação SHALL resetar para página 1
5. WHEN modo "Lista" THEN comportamento padrão (flat, sem agrupamento)

**Independent Test**: Criar transações em 3 dias diferentes, agrupar "Por dia" e ver 3 grupos com subtotais.

---

### P5: Editar e excluir transações

**User Story**: Como membro da família, quero editar dados de uma transação ou excluí-la, para corrigir erros e manter registros accurate.

**Why P5**: Manutenção de dados — essencial mas menos impactante visualmente.

**Acceptance Criteria**:

1. WHEN usuário clica em uma transação THEN sistema SHALL abrir dialog preenchido com dados atuais (descrição, valor, data, categoria, conta, tipo)
2. WHEN usuário edita e salva THEN sistema SHALL atualizar transação, recalcular saldos e mostrar toast "Transação atualizada"
3. WHEN usuário clica excluir THEN sistema SHALL pedir confirmação "Excluir transação?" com botão "Excluir" em vermelho
4. WHEN transação é excluída THEN sistema SHALL recalcular saldos das contas envolvidas e atualizar tabela
5. WHEN edição muda o valor ou a conta THEN sistema SHALL recalcular saldo da conta antiga e da nova

**Independent Test**: Editar valor de R$ 50 para R$ 75. Ver saldo da conta atualizar. Excluir a transação e ver saldo voltar.

---

## Edge Cases

- WHEN busca retorna 0 resultados com filtros THEN mostrar sugestão "Tente remover alguns filtros"
- WHEN transação é de transferência (criada pelo fluxo P4 de contas) THEN editar SHALL avisar "Esta transação faz parte de uma transferência — a contraparte também será afetada"
- WHEN excluir transação que é parte de transferência THEN excluir ambas as transações (origem e destino)
- WHEN paginação está em página 3 e filtro muda THEN voltar para página 1

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| TXN-01 | P1: Tabela com paginação | - | Pending |
| TXN-02 | P1: Busca por descrição | - | Pending |
| TXN-03 | P1: Estado vazio | - | Pending |
| TXN-04 | P2: Filtros avançados | - | Pending |
| TXN-05 | P2: Filtros combinados | - | Pending |
| TXN-06 | P3: Resumo lateral | - | Pending |
| TXN-07 | P4: Agrupamento | - | Pending |
| TXN-08 | P5: Editar transação | - | Pending |
| TXN-09 | P5: Excluir transação | - | Pending |
| TXN-10 | P5: Recalcular saldos | - | Pending |

**Coverage:** 10 total, 0 mapped to tasks, 10 unmapped ⚠️

---

## Success Criteria

- [ ] Usuário consegue buscar e encontrar qualquer transação por descrição
- [ ] Filtros combinados funcionam corretamente (AND lógico)
- [ ] Editar uma transação atualiza saldos corretamente
- [ ] Excluir transação com confirmação funciona
- [ ] Tabela responsiva com paginação
