## [1.1.0] - 2026-06-11

### Nova funcionalidade
- Navegação por meses no dashboard, categorias e transações com seletor aritmético
- Coluna de status de pagamento (pago/pendente) nas transações com toggle e atualização otimista
- Edição de transações no dashboard e na página de transações
- Ordenação por colunas nas tabelas do dashboard e transações
- Migração completa da API para tRPC (removidos todos os route handlers de domínio)

### Melhoria
- Performance do dashboard: cache de familyId no contexto tRPC e queries RSC paralelizadas
- Layout do dashboard: navegação extraída para client component separado
- Dashboard modularizado em componentes menores (body, month-summary, mutations)
- Descrição das transações suporta múltiplas linhas com line-clamp
- Interface do email de convite de família melhorada
- Refatoração geral de legibilidade e manutenibilidade do código

### Correção
- Importação em lote respeita o mês selecionado como mês destino
- Navegação do seletor de meses limitada ao histórico da família
- Direção do chevron no seletor de meses corrigida
- Parâmetro SQL `dateTo` com limite superior corrigido

### Infraestrutura
- Índice composto em `(family_id, transaction_at)` para performance de queries
- Refatoração completa do codebase v1 para v2 (237 arquivos alterados)
