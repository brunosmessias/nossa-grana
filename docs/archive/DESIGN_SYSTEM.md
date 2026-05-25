# Design System - Nossa Grana v2

**Base:** shadcn/ui + Tailwind CSS v4 (estilo base-nova)
**Inspiração:** [shadcn-admin](https://github.com/satnaing/shadcn-admin) por satnaing
**Data:** 2026-05-12

---

## 1. Fundamentos

### 1.1 Stack Tecnológica

- **Framework:** Next.js 16 (App Router) + React 19
- **UI Library:** shadcn/ui (base-nova style) + @radix-ui/react primitives
- **CSS:** Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Icons:** lucide-react
- **Forms:** react-hook-form + zod
- **State Management:** Zustand (opcional)
- **Data Fetching:** @tanstack/react-query (opcional)
- **Routing:** @tanstack/react-router (alternativa ao next/navigation)

### 1.2 Arquitetura de Pastas

```
src/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles + design tokens
│   ├── layout.tsx               # Root layout (ThemeProvider, fonts)
│   ├── page.tsx                 # Landing page
│   ├── (auth)/                  # Auth group routes
│   ├── (errors)/                # Error pages
│   └── api/                     # API routes
│
├── components/
│   ├── ui/                      # shadcn/ui primitives (NÃO modificar)
│   ├── layout/                  # Layout components
│   │   ├── app-sidebar.tsx
│   │   ├── authenticated-layout.tsx
│   │   ├── header.tsx
│   │   ├── nav-group.tsx
│   │   ├── nav-user.tsx
│   │   ├── team-switcher.tsx
│   │   ├── top-nav.tsx
│   │   ├── main.tsx
│   │   └── data/
│   │       └── sidebar-data.ts  # Menu configuration
│   ├── data-table/              # Reusable data table components
│   │   ├── index.ts
│   │   ├── column-header.tsx
│   │   ├── bulk-actions.tsx
│   │   ├── faceted-filter.tsx
│   │   ├── pagination.tsx
│   │   ├── toolbar.tsx
│   │   └── ...
│   └── features/                # Business feature components
│       ├── dashboard/
│       │   ├── index.tsx
│       │   └── components/
│       │       └── analytics-chart.tsx
│       ├── accounts/
│       │   ├── index.tsx
│       │   └── components/
│       │       └── account-form.tsx
│       └── transactions/
│           ├── index.tsx
│           └── components/
│               └── transaction-form.tsx
│
├── config/
│   ├── fonts.ts                 # Font configuration
│   └── theme.ts                 # Theme overrides (optional)
│
├── context/                     # React contexts (theme, layout, search)
│   ├── theme-provider.tsx
│   ├── layout-provider.tsx
│   ├── search-provider.tsx
│   └── font-provider.tsx
│
├── hooks/                       # Custom hooks
│   ├── use-mobile.tsx
│   ├── use-table-url-state.ts
│   └── use-dialog-state.tsx
│
├── lib/                         # Utilities
│   ├── utils.ts                 # cn() helper (clsx + tailwind-merge)
│   ├── cookies.ts               # Cookie helpers
│   └── handle-server-error.ts
│
├── modules/                     # Domain logic (optional)
│   ├── accounts/
│   │   └── account-form.tsx
│   └── transactions/
│       └── rules.test.ts
│
├── server/                      # Server-side code
│   ├── api/                     # tRPC routers
│   ├── auth/                    # Better Auth config
│   ├── db/                      # Drizzle ORM
│   ├── email/                   # Resend templates
│   └── services/                # Business services
│
├── shared/
│   ├── schemas/                 # Zod schemas
│   ├── types/                   # TypeScript types
│   └── ui/                      # Shared UI (modal-shell.tsx)
│
├── stores/                      # Zustand stores
│   └── auth-store.ts
│
└── styles/                      # CSS files
    ├── globals.css              # Main (imports theme.css)
    └── theme.css                # Design tokens (OKLCH colors)
```

---

## 2. Sistema de Cores (Design Tokens)

### 2.1 Paleta OKLCH

O projeto usa **OKLCH** para cores perceptualmente uniformes (melhor dassíncronia em telas wide-gamut).

#### Tema Claro (default)

```css
:root {
  /* Base Colors */
  --background: oklch(0.98 0.005 155);    /* Quase branco, tom frio */
  --foreground: oklch(0.14 0.02 155);     /* Cinza escuro azulado */

  /* Semantic */
  --primary: oklch(0.55 0.2 155);         /* Verde dinheiro (hue 155) */
  --primary-foreground: oklch(0.98 0.005 155);
  --secondary: oklch(0.95 0.01 155);      /* Cinza claro */
  --secondary-foreground: oklch(0.2 0.02 155);
  --muted: oklch(0.95 0.01 155);
  --muted-foreground: oklch(0.5 0.02 155);
  --accent: oklch(0.92 0.02 155);
  --accent-foreground: oklch(0.2 0.02 155);
  --destructive: oklch(0.55 0.25 25);     /* Vermelho */
  --border: oklch(0.9 0.01 155);
  --input: oklch(0.9 0.01 155);
  --ring: oklch(0.55 0.2 155);            /* Igual primary */

  /* Charts */
  --chart-1: oklch(0.55 0.2 155);
  --chart-2: oklch(0.55 0.15 200);        /* Azul */
  --chart-3: oklch(0.65 0.18 80);         /* Amarelo */
  --chart-4: oklch(0.6 0.2 30);           /* Laranja */
  --chart-5: oklch(0.5 0.2 300);          /* Roxo */

  /* Sidebar */
  --sidebar: oklch(0.97 0.01 155);
  --sidebar-foreground: oklch(0.2 0.02 155);
  --sidebar-primary: oklch(0.55 0.2 155);
  --sidebar-primary-foreground: oklch(0.98 0.005 155);
  --sidebar-accent: oklch(0.92 0.02 155);
  --sidebar-accent-foreground: oklch(0.2 0.02 155);
  --sidebar-border: oklch(0.9 0.01 155);
  --sidebar-ring: oklch(0.55 0.2 155);

  /* Radius */
  --radius: 0.625rem;  /* 10px */
}
```

#### Tema Escuro

```css
.dark {
  --background: oklch(0.11 0.015 155);    /* Azul muito escuro */
  --foreground: oklch(0.95 0.01 155);     /* Quase branco */

  --primary: oklch(0.72 0.22 155);        /* Verde mais vibrante */
  --primary-foreground: oklch(0.11 0.015 155);
  --secondary: oklch(0.2 0.015 155);
  --secondary-foreground: oklch(0.9 0.01 155);
  --muted: oklch(0.2 0.015 155);
  --muted-foreground: oklch(0.6 0.02 155);
  --accent: oklch(0.22 0.02 155);
  --accent-foreground: oklch(0.9 0.01 155);
  --destructive: oklch(0.6 0.25 25);
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.72 0.22 155);

  --chart-1: oklch(0.72 0.22 155);
  --chart-2: oklch(0.65 0.18 200);
  --chart-3: oklch(0.75 0.18 80);
  --chart-4: oklch(0.65 0.22 30);
  --chart-5: oklch(0.6 0.2 300);

  --sidebar: oklch(0.08 0.015 155);
  --sidebar-foreground: oklch(0.6 0.02 155);
  --sidebar-primary: oklch(0.72 0.22 155);
  --sidebar-primary-foreground: oklch(0.11 0.015 155);
  --sidebar-accent: oklch(0.16 0.02 155);
  --sidebar-accent-foreground: oklch(0.9 0.01 155);
  --sidebar-border: oklch(1 0 0 / 6%);
  --sidebar-ring: oklch(0.72 0.22 155);
}
```

### 2.2 Como Usar

```tsx
// Componente com variável CSS
<div className="bg-background text-foreground border border-border">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Ação primária
  </button>
</div>

// Com utilitário tailwind
<div className="bg-muted text-muted-foreground rounded-lg p-4">
  Conteúdo secundário
</div>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição em muted-foreground</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

---

## 3. Tipografia

### 3.1 Fontes

**Fonte principal:** Inter (via Google Fonts)
- Configurada em `src/app/layout.tsx` com `next/font/google`
- Carregada como `font-sans` no Tailwind

```tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
```

### 3.2 Escala Tipográfica (Tailwind)

- `text-xs` - 12px (subtitles,辅助文字)
- `text-sm` - 14px (body secundário, labels)
- `text-base` - 16px (body principal)
- `text-lg` - 18px (subtítulos)
- `text-xl` - 20px
- `text-2xl` - 24px (títulos de card)
- `text-3xl` - 30px (headings da página)
- `text-4xl` - 36px (page titles)

**Pesos:**
- `font-normal` - 400 (default)
- `font-medium` - 500 (botões, labels)
- `font-semibold` - 600 (headings)
- `font-bold` - 700 (raro)

---

## 4. Espaçamento & Bordas

### 4.1 Border Radius

Baseado na variável `--radius: 0.625rem` (10px):

```css
--radius-sm:  calc(var(--radius) * 0.6);   /* ~6px */
--radius-md:  calc(var(--radius) * 0.8);   /* ~8px */
--radius-lg:  var(--radius);               /* 10px (default) */
--radius-xl:  calc(var(--radius) * 1.4);   /* ~14px */
--radius-2xl: calc(var(--radius) * 1.8);   /* ~18px */
--radius-3xl: calc(var(--radius) * 2.2);   /* ~22px */
--radius-4xl: calc(var(--radius) * 2.6);   /* ~26px */
```

**Uso:**
```tsx
<button className="rounded-md">    {/* 8px */}
<button className="rounded-lg">    {/* 10px (default) */}
<button className="rounded-xl">    {/* 14px */}
<Card className="rounded-xl border-border">
```

### 4.2 Espaçamento (Tailwind scale)

```text
p-1 = 4px
p-2 = 8px
p-3 = 12px
p-4 = 16px
p-5 = 20px
p-6 = 24px
p-8 = 32px
p-10 = 40px
p-12 = 48px
p-16 = 64px

gap: mesma escala (para flex/grid)
m, mt, mb, ml, mr: mesma escala
```

---

## 5. Layout & Componentes Estruturantes

### 5.1 Authenticated Layout (Padrão)

```tsx
// src/components/layout/authenticated-layout.tsx
import { SidebarProvider } from '@/components/ui/sidebar'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

export function AuthenticatedLayout({ children }) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset className="@container/content has-data-[layout=fixed]:h-svh">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
```

### 5.2 Sidebar

**Componentes:**
- `AppSidebar` - Container principal
- `SidebarRail` - Alça de recolher
- `NavGroup` - Grupo de navegação com collapsible
- `NavUser` - Perfil no rodapé
- `TeamSwitcher` - Dropdown de times/organizações
- `ThemeSwitch` - Alternador claro/escuro

**Configuração via `sidebar-data.ts`:**

```ts
export const sidebarData: SidebarData = {
  user: {
    name: 'Bruno',
    email: 'bruno@exemplo.com',
    avatar: '/avatars/default.jpg',
  },
  teams: [
    { name: 'Nossa Grana', logo: PiggyBank, plan: 'Pessoal' },
    { name: 'Rybená', logo: Workflow, plan: 'Empresa' },
  ],
  navGroups: [
    {
      title: 'Principal',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Contas', url: '/accounts', icon: Wallet },
        { title: 'Transações', url: '/transactions', icon: ArrowLeftRight },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { title: 'Perfil', url: '/settings/profile', icon: User },
        { title: 'Aparência', url: '/settings/appearance', icon: Palette },
      ],
    },
  ],
}
```

### 5.3 Header

```tsx
import { Header } from '@/components/layout/header'

<Header fixed>
  <h1 className="text-lg font-semibold">Dashboard</h1>
</Header>

// Com breadcrumb ou ações
<Header fixed>
  <Breadcrumb />
  <Separator orientation="vertical" className="h-6" />
  <Button variant="outline" size="sm">Exportar</Button>
</Header>
```

---

## 6. Componentes shadcn/ui Disponíveis

### 6.1 Primitivos Já Instalados

**No projeto atual:**
```
avatar.tsx
badge.tsx
button.tsx
card.tsx
dialog.tsx
dropdown-menu.tsx
input.tsx
label.tsx
select.tsx
separator.tsx
sheet.tsx
sidebar.tsx
skeleton.tsx
table.tsx
tabs.tsx
tooltip.tsx
```

**Recomendado instalar (do shadcn-admin):**
```
alert.tsx                # Alert messages
alert-dialog.tsx        # Confirmation dialogs
calendar.tsx            # Date picker
checkbox.tsx            # Checkboxes
collapsible.tsx         # Accordions
command.tsx             # Command palette (⌘K)
form.tsx                # Form wrapper (shadcn)
input-otp.tsx           # OTP input
popover.tsx             # Popovers (date picker)
radio-group.tsx         # Radio buttons
scroll-area.tsx         # Custom scroll container
sonner.tsx              # Toast notifications (Toaster)
switch.tsx              # Toggle switches
textarea.tsx            # Text area
```

**Instalação:**
```bash
npx shadcn@latest add button card input label select
```

### 6.2 Data Table Pattern

O shadcn-admin tem uma implementação robusta de tabelas com:

- `DataTableToolbar` - Filtros, search, bulk actions
- `DataTableColumnHeader` - Sorting
- `DataTablePagination` - Paginação
- `DataTableBulkActions` - Ações em lote

**Arquitetura:**

```tsx
// components/data-table/index.ts
export { DataTable } from './data-table'  // O componente principal
export { DataTableToolbar } from './toolbar'
export { DataTableColumnHeader } from './column-header'
export { DataTableBulkActions } from './bulk-actions'
export { DataTablePagination } from './pagination'

// Uso:
import { DataTable, DataTableToolbar } from '@/components/data-table'

<DataTable
  columns={columns}
  data={transactions}
  onRowClick={(row) => navigate(`/transactions/${row.id}`)}
>
  <DataTableToolbar
    searchPlaceholder="Buscar transação..."
    filterSchema={filterSchema}
    onBulkAction={handleBulkAction}
  />
</DataTable>
```

---

## 7. Forms & Validação

### 7.1 Padrão Recomendado

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const accountSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  type: z.enum(['checking', 'savings', 'investment']),
  balance: z.number().positive(),
})

type AccountForm = z.infer<typeof accountSchema>

export function AccountForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Nome da conta</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>
        {/* Outros campos... */}
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}
```

---

## 8. Tema & Personalização

### 8.1 ThemeProvider

```tsx
// Em src/app/layout.tsx
import { ThemeProvider } from '@/context/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          storageKey="nossa-grana-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Opções:** `"light"`, `"dark"`, `"system"`

### 8.2 Theme Switch Component

```tsx
import { ThemeSwitch } from '@/components/theme-switch'

// Colocar no Header ou Sidebar
<ThemeSwitch />
```

---

## 9. Navegação & Roteamento

### 9.1 Estrutura de Rotas

```
app/
├── page.tsx                    → /
├── sign-in/page.tsx            → /sign-in
├── dashboard/
│   ├── page.tsx (server)      → /dashboard
│   └── ui.tsx (client)        → lógica interativa
├── accounts/
│   ├── page.tsx
│   ├── new/page.tsx           → /accounts/new
│   └── [id]/page.tsx          → /accounts/123
└── settings/
    ├── page.tsx
    ├── profile/page.tsx       → /settings/profile
    ├── appearance/page.tsx    → /settings/appearance
    └── notifications/page.tsx → /settings/notifications
```

**Padrão Server/Client Split:**

```tsx
// page.tsx (Server Component)
export default async function DashboardPage() {
  const session = await auth()
  const accounts = await db.accounts.findMany()

  return (
    <section>
      <h1>Dashboard</h1>
      <DashboardClient initialAccounts={accounts} />
    </section>
  )
}

// ui.tsx (Client Component)
'use client'
export function DashboardClient({ initialAccounts }) {
  const [accounts, setAccounts] = useState(initialAccounts)
  // ... interactive logic
}
```

---

## 10. State Management

### 10.1 Local (useState/useReducer)
- Para estado de componentes isolados
- Formulários (useForm)

### 10.2 Server State (React Query)
```tsx
import { useQuery, useMutation } from '@tanstack/react-query'

const { data: accounts } = useQuery({
  queryKey: ['accounts'],
  queryFn: fetchAccounts,
})
```

### 10.3 Global Client State (Zustand)
```tsx
// stores/auth-store.ts
import { create } from 'zustand'

interface AuthStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

---

## 11. Estados de Loading & Error

### 11.1 Skeletons

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-8 w-64" />      {/* Title */}
<Skeleton className="h-4 w-48" />      {/* Subtitle */}
<Skeleton className="h-32 w-full" />   {/* Card */}
<Skeleton className="h-10 w-32" />     {/* Button */}
```

### 11.2 Error Boundary

```tsx
'use client'

export function ErrorBoundary({ error, reset }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-destructive text-xl font-semibold">Algo deu errado</h2>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <Button onClick={reset} className="mt-4">Tentar novamente</Button>
    </div>
  )
}
```

---

## 12. Responsividade

### 12.1 Breakpoints (Tailwind)

```text
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (laptop)
xl:  1280px  (desktop)
2xl: 1536px  (large desktop)
```

### 12.2 Mobile First

```tsx
// Mobile primeiro, depois desktop
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-64">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>

// Esconder/show mobile
className="hidden md:block"   /* Só mostra em md+ */
className="md:hidden"        /* Só mostra em mobile */
```

### 12.3 Hook useMobile

```tsx
import { useMobile } from '@/hooks/use-mobile'

function MyComponent() {
  const isMobile = useMobile()  // Retorna true se < 768px

  return <div>{isMobile ? 'Mobile view' : 'Desktop view'}</div>
}
```

---

## 13. Acessibilidade

- Use `aria-label` em botões sem texto
- Sempre `htmlFor` + `id` em label/input
- Navegação por teclado: shadcn cuida da maioria
- Skip links: `<SkipToMain />` já incluso no layout
- Cores: contraste WCAG AA (4.5:1 mínimo)

---

## 14. Convenções de Código

### 14.1 Component Files

```
Componente simple (button, badge)     → button.tsx
Componente complexo (com state)       → my-component.tsx
Grupo de componentes relacionados    → index.ts (re-export)
```

### 14.2 Re-exports

```ts
// components/ui/index.ts (shadcn não tem, mas podemos criar)
export { Button } from './button'
export { Card } from './card'

// components/data-table/index.ts
export { DataTable } from './data-table'
export { DataTableToolbar } from './toolbar'
```

### 14.3 Import Paths

Usar alias `@/` configurado no `tsconfig.json`:

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Account } from '@/shared/types'
```

### 14.4 Naming

- Componentes: `PascalCase` (`AccountForm`, `DataTable`)
- Arquivos: same as component (`account-form.tsx`)
- Hooks: `useMobile`, `useTableUrlState`
- Types: `PascalCase` (`Account`, `Transaction`)
- Utilities: `camelCase` (`formatCurrency`, `cn`)
- Constants: `UPPER_SNAKE` (`MAX_FILE_SIZE`)

---

## 15. Adaptação para Nossa Grana v2

### 15.1 Estado Atual

**Problemas identificados:**

1. Dashboard monolítico (`src/app/dashboard/ui.tsx` com 711 linhas)
2. Não usa `sidebar` layout pattern
3. Falta separação features → components
4. CSS custom misturado, sem tokens organizados
5. Sem sistema de data table reutilizável
6. Sem pattern server/client split claro
7. Sem context providers (theme, layout, search)

### 15.2 Plano de Refatoração

#### Fase 1: Base ( prerequisite )

1. **Configurar shadcn/ui base-nova** (se ainda não estiver)
2. **Adotar `globals.css`** com tokens OKLCH (já tem! Bom)
3. **Criar `src/config/fonts.ts`** (seguir padrão shadcn-admin)
4. **Criar `src/context/`**:
   - `theme-provider.tsx` (já tem? melhorar)
   - `layout-provider.tsx` (gerencia collapsed, variant)
   - `search-provider.tsx` (⌘K command menu)

5. **Criar `src/components/layout/`**:
   - `authenticated-layout.tsx`
   - `app-sidebar.tsx`
   - `header.tsx`
   - `nav-group.tsx`
   - `sidebar-data.ts` (menu config)

6. **Migrar layout global** em `src/app/layout.tsx` para usar esses providers

#### Fase 2: Features Refactor

1. **Split dashboard**:

```
src/app/dashboard/
├── page.tsx      → server: fetch data, auth guard
└── ui.tsx        → client: sidebar, tabs, state

Melhorar para:

src/features/dashboard/
├── index.tsx              → client component principal
├── components/
│   ├── dashboard-header.tsx
│   ├── summary-cards.tsx
│   ├── recent-transactions.tsx
│   └── quick-actions.tsx
└── page.tsx               → server wrapper (ou mantém server no page)

src/app/dashboard/page.tsx:
import { Dashboard } from '@/features/dashboard'

export default DashboardPage = Dashboard
```

2. **Criar módulos separados**:

```
src/modules/accounts/ → transformar em feature:
├── index.tsx (page)
├── components/
│   ├── account-form.tsx
│   ├── account-card.tsx
│   └── account-list.tsx
└── page.tsx (se for App Router page)

src/modules/transactions/ →同上
```

3. **Data Table unificado**:

Copiar `src/components/data-table/` do shadcn-admin
Adaptar para nossas entidades (Transação, Conta, Categoria)

#### Fase 3: Navegação & Menu

1. **Definir `sidebar-data.ts`** com estrutura completa
2. **Criar NavGroup, NavUser, TeamSwitcher** se necessário multi-tenant
3. **Integrar ThemeSwitch** no header ou sidebar
4. **Adicionar Search** (command palette) se fizer sentido

#### Fase 4: Visual Polish

1. **Ajustar tokens** no `globals.css` se quiser cor diferente (verde atual está bom)
2. **Adicionar sonner** (toast notifications)
3. **Implementar dialogs** com `Dialog` + `DialogPortal`
4. **Usar `Sheet`** para mobile sidebar já está no shadcn Sidebar
5. **Add `Skeleton`** loadings em todas as listagens

---

## 16. Referências Úteis

### Documentação shadcn/ui

- https://ui.shadcn.com/docs/components
- https://ui.shadcn.com/docs/installation/next
- https://ui.shadcn.com/docs/theming

### Repositório Base

- https://github.com/satnaing/shadcn-admin
  - Branches: `main`, `vite`, `nextjs` (adaptar para Next.js 16)

### Radix UI Primitives

- https://www.radix-ui.com/primitives/docs/overview/components

### Tailwind CSS v4

- https://tailwindcss.com/blog/tailwindcss-v4
- CSS-first configuration, sem `tailwind.config.js` (usa `@theme`, `@custom-variant`)

---

## 17. Checklist de Implementação

- [ ] Ler este documento inteiro
- [ ] Estudar o código do shadcn-admin (pelo menos `src/components/layout/`, `src/features/`, `src/config/`)
- [ ] Identificar o que já existe no projeto
- [ ] Planejar a refatoração em sprints (não fazer tudo de uma vez)
- [ ] Criar `src/context/layout-provider.tsx` e `sidebar-data.ts`
- [ ] Refatorar dashboard para modular
- [ ] Criar data-table genérico
- [ ] Testar tema claro/escuro em todos os componentes
- [ ] Documentar novas convenções no README.md do projeto
- [ ] Configurar pré-commit hooks (format, lint)

---

## 18. Diferenças do shadcn-admin

| Aspecto | shadcn-admin | Nossa Grana v2 (proposto) |
|---------|--------------|-------------------------|
| Router | @tanstack/react-router | Next.js App Router (next/navigation) |
| Auth | Clerk | Better Auth |
| Form | react-hook-form + zod | Same (good) |
| Charts | Recharts | Pode manter Recharts ou usar outra |
| State | Zustand + React Query | Same (opcional) |
| Theme | shadcn base-nova + CSS vars | Same (já tem) |
| Layout | Sidebar + Header | Mesmo, mas adaptar |

**Observação:** Não precisamos usar `@tanstack/react-router`. Usar `next/navigation` do Next.js 16. Apenas follow o padrão de componentes e organização.

---

_Página criada em 2026-05-12 por Zé (AI Assistant)_
