import { Card, CardBody, CardHeader } from "@heroui/card"
import React from "react"
import { api } from "@/src/trpc/server"
import ModalFamilyInvite from "@/src/app/_components/page/family/modalFamilyInvite"
import FormFamily from "@/src/app/_components/page/family/formFamily"

export default async function PageWelcome() {
  const family = await api.family.getCurrent()
  const invite = !family && (await api.family.getInvitedBy())

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
          {invite ? (
            <ModalFamilyInvite family={invite}></ModalFamilyInvite>
          ) : (
            <FormFamily defaultValues={family}></FormFamily>
          )}
        </CardBody>
      </Card>
    </>
  )
}
