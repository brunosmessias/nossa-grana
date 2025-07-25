"use client"

import { Card, CardBody, CardHeader } from "@heroui/card"
import { formatCentsToBRL } from "@/src/app/_components/utils/currency"
import { api } from "@/src/trpc/react"
import { DateState } from "@/src/app/_components/page/dashboard/pageTransactions"
import { Skeleton } from "@heroui/skeleton"

type SectionBalanceProps = {
  date: DateState
}

export function SectionBalance({ date }: SectionBalanceProps) {
  const query = api.balance.getAccumulatedBalance.useQuery({
    month: date.month,
    year: date.year,
  })

  return (
    <Skeleton
      classNames={{
        base: "rounded-2xl ",
        content: "grid gap-4 md:grid-cols-2",
      }}
      aria-label="Resumo financeiro do mês"
      isLoaded={query.isFetched}
    >
      <Card
        classNames={{
          base: "bg-background-100 border-2 border-default-100 p-2",
          header: "text-3xl font-bold font-mono text-primary",
        }}
        radius="sm"
      >
        <CardHeader>Saldo atual</CardHeader>
        <CardBody className="text-2xl font-bold">
          {formatCentsToBRL(query.data?.currentPaid || 0)}
        </CardBody>
      </Card>

      <Card
        classNames={{
          base: "bg-background-100 border-2 border-default-100 p-2",
          header: "text-3xl font-bold font-mono text-primary",
        }}
        radius="sm"
      >
        <CardHeader>Saldo no final do mês</CardHeader>
        <CardBody className="text-2xl font-bold">
          {formatCentsToBRL(query.data?.projected || 0)}
        </CardBody>
      </Card>
    </Skeleton>
  )
}
