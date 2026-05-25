import type { ReactNode } from "react"

type ModalShellProps = {
  title: string
  children: ReactNode
}

export function ModalShell({ title, children }: ModalShellProps) {
  return (
    <section aria-label={title} style={{ background: "var(--surface)", borderRadius: 14, padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  )
}
