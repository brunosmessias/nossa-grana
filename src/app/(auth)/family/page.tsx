import { Card, CardBody, CardHeader } from "@heroui/card"
import React from "react"
import FormFamily from "@/src/app/_components/page/family/form"
import { api } from "@/src/trpc/server"

export default async function PageWelcome() {
  const family = await api.family.getCurrent()

  return (
    <>
      <Card className="w-full border-1 border-default/80 bg-background p-4">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p
              className={`font-heading text-3xl font-bold text-primary lg:text-5xl`}
            >
              Gerenciar família
            </p>
            <p className="text-lg text-default-600">
              Vamos adicionar as pessoas que vão participar do orçamento
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <FormFamily defaultValues={family}></FormFamily>
        </CardBody>
      </Card>
    </>
  )
}
