"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  PiggyBank,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
  Zap,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const features = [
  {
    icon: PiggyBank,
    title: "Controle total do dinheiro",
    description:
      "Registre receitas e despesas de forma simples. Categorize cada transação e saiba exatamente para onde o dinheiro está indo.",
  },
  {
    icon: Users,
    title: "Toda a família junto",
    description:
      "Compartilhe o controle financeiro com seu parceiro(a) e familiares. Cada membro visualiza e contribui com as finanças.",
  },
  {
    icon: BarChart3,
    title: "Visão mensal clara",
    description:
      "Veja o resumo do mês em um painel intuitivo. Gráficos e números que fazem sentido, sem complicação.",
  },
  {
    icon: Shield,
    title: "Metas e economias",
    description:
      "Defina metas de economia e acompanhe o progresso. Poupar nunca foi tão fácil e motivador.",
  },
  {
    icon: Zap,
    title: "Cadastro rápido",
    description:
      "Cadastre contas, categorias e transações em segundos. Interface limpa e sem distrações.",
  },
  {
    icon: Heart,
    title: "Feito para famílias brasileiras",
    description:
      "Pensado para a realidade do Brasil. Real em vez de dólares, categorias que fazem sentido, linguagem clara.",
  },
]

const benefits = [
  "Contas bancárias, carteira e poupança em um só lugar",
  "Categorias personalizáveis para cada família",
  "Importação em lote de transações",
  "Convite de membros com controle de permissões",
  "Registro completo de auditoria",
  "Acesso seguro com autenticação Google ou email",
]

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-6"
        >
          <div className="flex items-center gap-2.5">
            <Logo className="size-8 text-primary" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Nossa Grana
            </span>
          </div>
          <Button variant="outline" size="sm" render={<Link href="/sign-in" />}>
            Entrar
          </Button>
        </motion.header>

        {/* Hero */}
        <section className="pb-20 pt-16 sm:pt-24 sm:pb-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              variants={fadeUp}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Finanças da família, simplificadas
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              O dinheiro da sua família{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                merece respeito
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            >
              Organize receitas, despesas e economias junto com quem você ama.
              Sem complicação, sem planilha infinita — direto ao ponto.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                className="h-11 px-6 text-base"
                render={<Link href="/sign-in" />}
              >
                Começar agora
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-11 px-6 text-base text-muted-foreground"
                render={<Link href="#funcionalidades" />}
              >
                Ver funcionalidades
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative mx-auto mt-16 max-w-2xl"
          >
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xl shadow-primary/5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-3 rounded-full bg-destructive/70" />
                <div className="size-3 rounded-full bg-yellow-500/70" />
                <div className="size-3 rounded-full bg-primary/70" />
                <span className="ml-2 text-xs text-muted-foreground">
                  Dashboard — Janeiro 2026
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-primary/10 p-4">
                  <p className="text-xs text-muted-foreground">Receitas</p>
                  <p className="mt-1 text-xl font-bold text-primary">
                    R$ 8.450
                  </p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-4">
                  <p className="text-xs text-muted-foreground">Despesas</p>
                  <p className="mt-1 text-xl font-bold text-destructive">
                    R$ 5.230
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-4">
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    R$ 3.220
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/40 p-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">
                      Mercado
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.2, delay: 1 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    R$ 1.580
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 p-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-chart-4" />
                    <span className="text-xs text-muted-foreground">
                      Moradia
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "45%" }}
                      transition={{ duration: 1.2, delay: 1.1 }}
                      className="h-full rounded-full bg-chart-4"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    R$ 2.100
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="funcionalidades" className="py-20 sm:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-medium uppercase tracking-widest text-primary"
            >
              Funcionalidades
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Tudo que sua família precisa
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-xl text-muted-foreground"
            >
              Ferramentas simples e poderosas para colocar as finanças no eixo
              — sem estresse.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                className="group relative rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Benefits */}
        <section className="py-20 sm:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card/80 to-card/80 p-8 sm:p-12 lg:p-16"
          >
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <motion.p
                  variants={fadeUp}
                  className="text-sm font-medium uppercase tracking-widest text-primary"
                >
                  Por que usar
                </motion.p>
                <motion.h2
                  variants={fadeUp}
                  className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                >
                  Financeiro saudável,{" "}
                  <span className="text-primary">família feliz</span>
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-muted-foreground leading-relaxed"
                >
                  Quando o dinheiro é organizado, sobra espaço para o que
                  realmente importa. O Nossa Grana te ajuda a ter essa
                  tranquilidade.
                </motion.p>
              </div>
              <motion.ul
                variants={stagger}
                className="space-y-4"
              >
                {benefits.map((benefit) => (
                  <motion.li
                    key={benefit}
                    variants={fadeUp}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Pronto para organizar as finanças?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-md text-muted-foreground"
            >
              Comece agora mesmo. É rápido, fácil e gratuito.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Button
                size="lg"
                className="h-12 px-8 text-base"
                render={<Link href="/sign-in" />}
              >
                Criar conta grátis
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <Logo className="size-5 text-primary" />
            <span>Nossa Grana</span>
          </div>
          <p className="mt-2">
            Finanças da família, simplificadas.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
