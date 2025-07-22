# 🏠 Nossa Grana

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/tRPC-2596be?style=for-the-badge&logo=trpc&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
</p>

**Nossa Grana** é um sistema de controle financeiro familiar, colaborativo, simples e acessível.  
Registre entradas e saídas, acompanhe metas, planeje gastos e compartilhe o orçamento com toda a família.  
Feito com Next.js, tRPC, Drizzle ORM, Cloudflare D1, Clerk e Tailwind.

---

## ✨ Funcionalidades

- **Cadastro de famílias**: cada família tem seu próprio orçamento
- **Múltiplos usuários por família** (login social via Clerk)
- **Lançamento de entradas e saídas** (com categorias)
- **Gastos fixos e transações recorrentes**
- **Metas financeiras** (com acompanhamento de progresso)
- **Convite de membros por link ou e-mail**
- **Notificações automáticas (WhatsApp, e-mail, etc.)**
- **Acessível e responsivo**

---

## 🚀 Tecnologias

- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Clerk](https://clerk.com/) (autenticação)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🏗️ Arquitetura

- **DDD e Clean Code**: separação clara de domínios e responsabilidades
- **Banco relacional**: famílias, usuários, categorias, transações, metas, notificações
- **Autenticação Clerk**: cada usuário é identificado pelo Clerk User ID
- **Família colaborativa**: todos os membros veem e editam o mesmo orçamento

---

## 🖼️ Fluxo de uso

1. **Login com Clerk** (Google, e-mail, etc.)
2. **Crie sua família** (nome)
3. **Convide membros** (link ou e-mail)
4. **Lance entradas e saídas** (com categorias)
5. **Cadastre gastos fixos** (recorrentes)
6. **Defina metas financeiras**
7. **Acompanhe relatórios e gráficos**
8. **Receba notificações e lembretes**


## 🛠️ Como rodar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/nossa-grana.git
cd nossa-grana

# 2. Instale as dependências
bun install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Preencha CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, DATABASE_URL, etc.

# 4. Rode as migrations do Drizzle
npx drizzle-kit generate
npx drizzle-kit migrate

# 5. Rode o projeto
bun dev
```

## 📋 Roadmap

- [x] MVP: cadastro, lançamentos, saldo mensal
- [ ] Famílias colaborativas
- [ ] Gastos fixos e metas
- [ ] Relatórios avançados e gráficos
- [ ] Notificações automáticas (WhatsApp, e-mail)
- [ ] Integração por voz e WhatsApp
- [ ] Insights de IA

---

## 📝 Licença

MIT

---