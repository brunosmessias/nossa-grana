# 🔄 Transações

> O módulo de Transações é o registro completo de todas as movimentações financeiras — com busca avançada, filtros, agrupamento e edição.

## Visão Geral

Toda vez que alguém gasta ou recebe dinheiro, isso vira uma transação no sistema. A página de transações é como o extrato bancário da família, mas muito mais poderosa.

A página mostra:
- Tabela completa com busca e paginação
- Filtros avançados (tipo, conta, categoria, período, valor)
- Resumo lateral com totais filtrados
- Agrupamento por dia, semana, mês ou categoria
- Edição e exclusão de transações

## Como Funciona

### Tabela principal

A tabela mostra todas as transações ordenadas por data (mais recente primeiro), com as colunas:

| Coluna | O que mostra |
|--------|-------------|
| Data | Quando aconteceu |
| Descrição | Texto descritivo da transação |
| Categoria | Com ícone e cor |
| Conta | De qual conta saiu/entrou |
| Tipo | Receita ou Despesa (badge colorido) |
| Valor | Com sinal (+ receita, − despesa) |

### Busca e filtros

- **Busca por descrição** — digite e o sistema filtra em tempo real (com debounce de 300ms)
- **Filtro por tipo** — Receitas, Despesas ou Todos
- **Filtro por conta** — mostrar só transações de uma conta específica
- **Filtro por categoria** — filtrar por uma categoria
- **Período** — data inicial e final
- **Faixa de valor** — valor mínimo e máximo

Todos os filtros funcionam juntos (AND lógico). Um badge mostra "X filtros ativos" com botão para limpar.

```mermaid
flowchart LR
    A[Todas as transações] --> B[Filtro tipo]
    B --> C[Filtro conta]
    C --> D[Filtro categoria]
    D --> E[Filtro período]
    E --> F[Filtro valor]
    F --> G[Resultado final<br/>filtrado]
```

### Resumo lateral

Ao lado da tabela, um card mostra os totais das transações filtradas:
- Total de receitas
- Total de despesas
- Saldo líquido (receitas − despesas)
- Quantidade de transações
- Valor médio por transação

### Agrupamento

Você pode mudar a forma como as transações são organizadas:

| Modo | Como fica |
|------|----------|
| Lista | Sem agrupamento, ordem cronológica |
| Por dia | Agrupadas por data, com subtotal |
| Por semana | Agrupadas por semana, com subtotal |
| Por mês | Agrupadas por mês, com subtotal |
| Por categoria | Agrupadas por categoria, com subtotal |

### Editar e excluir

- Clique em qualquer transação para abrir o diálogo de edição
- Altere descrição, valor, data, categoria ou conta
- O ícone de lixeira abre confirmação antes de excluir
- Ao salvar, o saldo das contas é atualizado automaticamente

## Quem Pode Fazer O Que

| Ação | Proprietário | Administrador | Membro |
|------|:------------:|:-------------:|:------:|
| Ver transações | ✅ | ✅ | ✅ |
| Criar transação | ✅ | ✅ | ✅ |
| Editar transação | ✅ | ✅ | ✅ |
| Excluir transação | ✅ | ✅ | ✅ |

## Regras Importantes

| Regra | Detalhe |
|-------|---------|
| Paginação | 20 transações por página |
| Transferências | Transações criadas pelo fluxo "Guardar dinheiro" são marcadas como transferência |
| Excluir com confirmação | Sempre pede confirmação antes de excluir |
| Recálculo automático | Ao editar valor ou conta, o saldo é recalculado automaticamente |

## Perguntas Frequentes

**Posso recuperar uma transação excluída?**
Não, a exclusão é definitiva. Os dados ficam no log de auditoria, mas não são restauráveis pela interface.

**Os filtros são salvos?**
Hoje não. Ao recarregar a página, os filtros são limpos. Está nos planos futuros.
