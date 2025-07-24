"use client"

import { FamilyType } from "@/src/server/api/routers/family"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal"
import { Button } from "@heroui/button"
import { CheckIcon, XIcon } from "lucide-react"
import { api } from "@/src/trpc/react"
import { addToast } from "@heroui/toast"
import { useRouter } from "next/navigation"

export default function ModalFamilyInvite({
  family,
}: {
  family: Partial<FamilyType>
}) {
  const router = useRouter()

  const disclosure = useDisclosure({
    isOpen: true,
  })

  const answerInviteMutation = api.family.answerInvite.useMutation({
    onSuccess: () => {
      disclosure.onClose()
      router.refresh()
    },
    onError: (err) => {
      addToast({
        title: err.message,
        color: "danger",
      })
    },
  })

  const handleAnswerInvite = (answer: boolean) => {
    answerInviteMutation.mutate({
      familyId: family.id!,
      answer: answer,
    })
  }

  return (
    <Modal
      backdrop="blur"
      isOpen={disclosure.isOpen}
      hideCloseButton
      isDismissable={false}
      classNames={{
        base: "border-2 border-primary-300",
      }}
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col">
            <h2 className="font-heading text-xl font-bold">
              Convite para a família{" "}
              <span className="text-primary">{family.name}</span>
            </h2>
          </ModalHeader>
          <ModalBody>
            <p>
              Ao aceitar esse convite, você poderá acessar e colaborar na gestão
              financeira da família {family.name}.
            </p>
            <p>
              Se esse convite é um engano, você pode recusar e começar a gestão
              financeira da sua própria família
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="faded"
              onPress={() => handleAnswerInvite(false)}
            >
              <XIcon />
              Recusar
            </Button>

            <Button
              color="primary"
              variant="solid"
              onPress={() => handleAnswerInvite(true)}
            >
              <CheckIcon />
              Aceitar
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  )
}
