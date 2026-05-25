# RBAC Customizado

## Status: `PLANNED`

Sistema de controle de acesso baseado em papéis (Role-Based Access Control) customizado, sem dependência de plugins do Better Auth.

## Motivação

O plugin `admin` do Better Auth foi removido pois:

- Roles e permissões eram hardcoded no código
- Não permitia criar perfis dinamicamente
- Acoplava a lógica de autorização ao provedor de autenticação
- Não suportava granularidade por recurso/ação

## Modelagem do Banco

### Tabela `role`

| Coluna      | Tipo      | Restrições                    |
| ----------- | --------- | ----------------------------- |
| id          | uuid      | PK, default gen_random_uuid() |
| name        | text      | NOT NULL, UNIQUE              |
| description | text      |                               |
| createdAt   | timestamp | NOT NULL, default now()       |
| updatedAt   | timestamp | NOT NULL, default now()       |

### Tabela `permission`

| Coluna      | Tipo      | Restrições                    |
| ----------- | --------- | ----------------------------- |
| id          | uuid      | PK, default gen_random_uuid() |
| resource    | text      | NOT NULL                      |
| action      | text      | NOT NULL                      |
| description | text      |                               |
| createdAt   | timestamp | NOT NULL, default now()       |

**Unique constraint**: `(resource, action)` — evita duplicatas como `users.read` duas vezes.

**Actions possíveis**: `create`, `read`, `update`, `delete` (CRUD básico). Podendo ser estendido com ações customizadas como `ban`, `export`, `manage`, etc.

**Recursos iniciais**:

- `users` — gerenciamento de usuários
- `roles` — gerenciamento de perfis
- `permissions` — gerenciamento de permissões
- `dashboard` — acesso ao painel
- (novos recursos são adicionados via seed/migration conforme o sistema cresce)

### Tabela `role_permission`

| Coluna       | Tipo | Restrições                            |
| ------------ | ---- | ------------------------------------- |
| roleId       | uuid | FK → role.id, ON DELETE CASCADE       |
| permissionId | uuid | FK → permission.id, ON DELETE CASCADE |

**PK composta**: `(roleId, permissionId)`

### Tabela `user_role`

| Coluna | Tipo | Restrições                      |
| ------ | ---- | ------------------------------- |
| userId | text | FK → user.id, ON DELETE CASCADE |
| roleId | uuid | FK → role.id, ON DELETE CASCADE |

**PK composta**: `(userId, roleId)`

### Diagrama ER

```
user ──1:N── user_role ──N:1── role ──1:N── role_permission ──N:1── permission
```

## Schema Drizzle

Arquivo: `src/server/db/schema.ts`

```typescript
export const role = pgTable("role", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const permission = pgTable(
  "permission",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.resource, t.action)],
);

export const rolePermission = pgTable(
  "role_permission",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const userRole = pgTable(
  "user_role",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);
```

## Tarefas de Implementação

### 1. Banco de dados

- [ ] Criar tabelas `role`, `permission`, `role_permission`, `user_role` no schema Drizzle
- [ ] Remover colunas `role`, `banned`, `banReason`, `banExpires` da tabela `user` (campos do plugin admin)
- [ ] Gerar migration: `bun db:generate`
- [ ] Criar seed com roles padrão (`admin`, `user`) e permissões iniciais
- [ ] Aplicar migration: `bun db:migrate`

### 2. Middleware de autorização (tRPC)

- [ ] Criar `src/server/auth/permissions.ts` — função `getUserPermissions(userId)` que cruza `user_role → role_permission → permission`
- [ ] Criar `src/server/auth/requirePermission.ts` — middleware tRPC que recebe `(resource, action)` e valida se o usuário tem a permissão
- [ ] Substituir `adminProcedure` por procedures com permissões específicas: `procedureWithPermission("users", "read")`, etc.
- [ ] Adicionar cache em `getUserPermissions` (invalidar quando roles mudam)

### 3. tRPC Routers

- [ ] Criar `src/server/api/routers/roles.ts` — CRUD de roles + atribuição de permissões
- [ ] Atualizar `src/server/api/routers/user.ts` — incluir roles/permissões nas queries
- [ ] Registrar router no `root.ts`

### 4. Zod Schemas

- [ ] `createRoleSchema` — nome + descrição + array de permissionIds
- [ ] `updateRoleSchema` — nome + descrição + array de permissionIds
- [ ] `assignRoleSchema` — userId + array de roleIds
- [ ] `createPermissionSchema` — resource + action + descrição

### 5. UI — Tela de Perfis (`/roles`)

- [ ] Listagem de perfis com permissões agrupadas por recurso
- [ ] Formulário de criação/edição de perfil (nome, descrição, checkboxes de permissões)
- [ ] Dialog de confirmação para deletar perfil
- [ ] Estados: loading, vazio, erro, sem permissão

### 6. UI — Tela de Usuários (`/users`)

- [ ] Listagem de usuários com badges de perfis
- [ ] Dialog para atribuir/remover perfis de um usuário
- [ ] Estados: loading, vazio, erro, sem permissão

### 7. Sidebar dinâmica

- [ ] Filtrar itens do menu baseado nas permissões do usuário (não mais hardcoded)
- [ ] Passar permissões do usuário pelo layout (server component → client component)

### 8. Seed inicial

- [ ] Role `admin`: todas as permissões
- [ ] Role `user`: `dashboard.read`
- [ ] Permissões para todos os recursos iniciais
- [ ] Atribuir role `admin` ao primeiro usuário criado

## Convenções

### Nomeclatura de permissões

- Formato: `{resource}.{action}` (ex: `users.read`, `roles.create`)
- Resources sempre no plural, lowercase
- Actions sempre no infinitivo: `create`, `read`, `update`, `delete`

### Verificação de permissões

- **Backend**: middleware tRPC obrigatório em toda procedure protegida
- **Frontend**: esconder botões/links se o usuário não tem a permissão (UX, não segurança)
- **Páginas**: server component verifica permissão antes de renderizar

### Performance

- Permissões do usuário carregadas uma vez por request e cacheadas
- Invalidação de cache quando roles/permissões são alteradas
- Considerar usar `React Context` para permissões no cliente (evitar múltiplas queries)
