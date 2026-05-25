# Família — Página de Gestão

## Problem Statement

Hoje a gestão de família é dispersa: convites são criados em dialogs, membros são mostrados como badges no dashboard. Não há página centralizada para gerenciar membros, convites e configurações da família.

## Goals

- [ ] Página dedicada para gestão da família
- [ ] Listagem de membros com role e ações
- [ ] Criar e gerenciar convites
- [ ] Editar nome da família

## Out of Scope

|| Feature | Reason |
|---------|--------|
| Resumo de gastos por membro | Requer `createdBy` em transações — será adicionado depois |
| Sair da família | Funcionalidade sensível, tratar separadamente |
| Transferir ownership | Feature complexa, fase futura |
| Configurações de moeda | Multi-moeda é Fase 5 |

---

## User Stories

### P1: Listagem de membros ⭐ MVP

**User Story**: Como membro da família, quero ver todos os membros com seus roles e dados básicos, para saber quem participa da gestão financeira.

**Why P1**: Visibilidade básica — base para qualquer ação de gestão.

**Acceptance Criteria**:

1. WHEN usuário navega para `/dashboard/familia` THEN sistema SHALL mostrar card com nome da família e lista de membros com nome, email, role (OWNER/ADMIN/MEMBER) e badge visual do role
2. WHEN usuário é OWNER ou ADMIN THEN ações de gestão SHALL estar visíveis (editar convites, editar família)
3. WHEN usuário é MEMBER THEN ações administrativas SHALL estar ocultas
4. WHEN não há família THEN sistema SHALL redirecionar para onboarding

**Independent Test**: Com família de 3 membros, navegar para página e ver 3 cards com nomes e roles corretos.

---

### P2: Convites

**User Story**: Como OWNER ou ADMIN, quero convidar novos membros por email e gerenciar convites pendentes, para adicionar pessoas à família.

**Why P2**: Funcionalidade de colaboração essencial. Já existe backend, falta a UI dedicada.

**Acceptance Criteria**:

1. WHEN OWNER/ADMIN clica "Convidar membro" THEN sistema SHALL abrir dialog com campo de email
2. WHEN convite é enviado THEN sistema SHALL mostrar toast "Convite enviado para [email]" e adicionar à lista de pendentes
3. WHEN página carrega THEN sistema SHALL mostrar seção "Convites" com convites pendentes (email, data de envio, status) e botão de copiar link
4. WHEN convite expirou THEN SHALL mostrar badge "Expirado" em cinza
5. WHEN OWNER/ADMIN clica "Revogar" em convite pendente THEN sistema SHALL cancelar o convite e pedir confirmação
6. WHEN MEMBER tenta convidar THEN sistema SHALL esconder botão de convite

**Independent Test**: Enviar convite para email novo, ver na lista de pendentes. Copiar link e abrir em aba anônima.

---

### P3: Editar família

**User Story**: Como OWNER, quero editar o nome da família, para manter as informações atualizadas.

**Why P3**: Manutenção simples, menos prioritária.

**Acceptance Criteria**:

1. WHEN OWNER clica em editar família THEN sistema SHALL abrir dialog com campo de nome preenchido
2. WHEN nome é alterado e salvo THEN sistema SHALL atualizar nome em todo o app (sidebar, header, página)
3. WHEN ADMIN ou MEMBER tenta editar THEN botão SHALL estar oculto

**Independent Test**: Alterar nome da família de "Família Silva" para "Família Silva Santos". Ver nome atualizado na sidebar.

---

### P4: Remover membro

**User Story**: Como OWNER ou ADMIN, quero remover um membro da família, para gerenciar quem tem acesso.

**Why P4**: Controle de acesso importante, mas situação menos frequente.

**Acceptance Criteria**:

1. WHEN OWNER/ADMIN clica "Remover" em um membro THEN sistema SHALL pedir confirmação "Remover [nome] da família? [nome] perderá acesso aos dados financeiros."
2. WHEN remoção é confirmada THEN sistema SHALL remover membro e atualizar lista
3. WHEN OWNER tenta se remover THEN sistema SHALL bloquear com mensagem "O proprietário não pode ser removido. Transfira a propriedade primeiro."
4. WHEN ADMIN tenta remover OWNER THEN sistema SHALL bloquear com mensagem "Sem permissão para remover o proprietário"

**Independent Test**: ADMIN remove um MEMBER. Verificar que membro desaparece da lista e perde acesso.

---

## Edge Cases

- WHEN convite é enviado para email que já é membro THEN mostrar erro "Este email já é membro da família"
- WHEN convite é enviado para email com convite pendente THEN mostrar "Convite já enviado para este email"
- WHEN último ADMIN tenta sair THEN não permitir (precisa ter pelo menos 1 ADMIN/OWNER)
- WHEN família tem apenas 1 membro (OWNER) THEN seção de membros mostra apenas o OWNER sem botão de remover

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| FAM-01 | P1: Listagem de membros | - | Pending |
| FAM-02 | P1: Permissões por role | - | Pending |
| FAM-03 | P2: Enviar convite | - | Pending |
| FAM-04 | P2: Lista de convites | - | Pending |
| FAM-05 | P2: Revogar convite | - | Pending |
| FAM-06 | P3: Editar nome família | - | Pending |
| FAM-07 | P4: Remover membro | - | Pending |
| FAM-08 | P4: Proteção OWNER | - | Pending |

**Coverage:** 8 total, 0 mapped to tasks, 8 unmapped ⚠️

---

## Success Criteria

- [ ] Membros listados com roles e badges visuais
- [ ] OWNER/ADMIN convida novos membros e gerencia convites
- [ ] OWNER edita nome da família
- [ ] OWNER/ADMIN remove membros com confirmação
- [ ] MEMBER vê a página mas sem ações administrativas
