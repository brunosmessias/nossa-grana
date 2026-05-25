# Nossa Grana V2

Projeto novo do zero para substituir o legado com arquitetura moderna, auditável e guiada por regras de negócio.

## Princípios obrigatórios

- TLC spec-driven para qualquer entrega (feature, alteração, fix).
- Zod compartilhado entre front e backend.
- Sem `any` explícito.
- Máximo 500 linhas por arquivo.
- Criação/edição por modal.
- Auditoria de eventos de negócio com naming específico.
- Testes para cobrir regras de negócio.
- Responsividade obrigatória.

## Auth implementado

- Better Auth com:
  - OTP por e-mail (passwordless)
  - Login social Google
  - Auto-registro habilitado
- Envio de OTP e convites via Resend.

## Família/convites implementado

- Criar família no onboarding.
- Convidar membro por e-mail.
- Aceitar convite por token.
- Auditoria para registro, criação de família, envio e aceite de convite.

## Comandos

- `bun dev`
- `bun check`
- `bun test:e2e`

## Setup inicial

1. Copiar `.env.example` para `.env` e preencher variáveis.
2. Instalar dependências com `bun install`.
3. Gerar schema auth com Better Auth CLI e criar migrations.
4. Rodar aplicação.

## Onde está o controle contínuo

- Documento mestre: `docs/PROJECT_CONTROL.md`
- Estado vivo TLC: `.specs/project/STATE.md`
- SDD do projeto atual: `docs/SDD_NOSSA_GRANA_V2.md`
- Base oficial para novos projetos (substitui base ad-hoc): `docs/SDD_BASE_TEMPLATE.md`
