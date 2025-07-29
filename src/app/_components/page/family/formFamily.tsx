"use client"

import { Divider } from "@heroui/divider"
import { Button } from "@heroui/button"
import { PlusIcon, Trash2Icon } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Input } from "@heroui/input"
import { Form } from "@heroui/form"
import { useUser } from "@clerk/nextjs"
import { api } from "@/src/trpc/react"
import { useRouter } from "next/navigation"
import { addToast } from "@heroui/toast"
import { FamilyType } from "@/src/server/api/routers/family"

export default function FormFamily({
  defaultValues,
}: {
  defaultValues?: FamilyType
}) {
  const { user } = useUser()
  const router = useRouter()
  const createFamilyMutation = api.family.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard")
    },
    onError: (err) => {
      addToast({
        title: err.message,
        color: "danger",
      })
    },
  })

  useEffect(() => {
    if (!!user && family.members.length == 0) {
      setFamily({
        name: user.lastName as string,
        members: [
          {
            name: user.fullName as string,
            email: user.primaryEmailAddress?.emailAddress as string,
          },
        ],
      })
    }
  }, [user])

  const [family, setFamily] = useState<FamilyType>(
    defaultValues ?? {
      name: "",
      members: [],
    }
  )

  const addMember = () => {
    setFamily({
      ...family,
      members: [...family.members, { name: "", email: "" }],
    })
  }

  const updateMember = (
    index: number,
    field: keyof FamilyType["members"][0],
    value: string
  ) => {
    const updatedMembers = family.members.map((member, i) => {
      if (i === index) {
        return { ...member, [field]: value }
      }

      return member
    })

    setFamily({
      ...family,
      members: updatedMembers,
    })
  }

  const removeMember = (index: number) => {
    const updatedMembers = family.members.filter((_, i) => i !== index)

    if (updatedMembers.length === 0) {
      setFamily({
        ...family,
        members: [{ name: "", email: "" }],
      })
    } else {
      setFamily({
        ...family,
        members: updatedMembers,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createFamilyMutation.mutate(family)
  }

  return (
    <Form className="flex w-full" onSubmit={handleSubmit}>
      <Input
        isRequired
        label="Qual o nome da sua família?"
        name="family"
        value={family.name}
        onChange={(e) => setFamily({ ...family, name: e.target.value })}
      />

      <Divider className="my-4" />

      <div className="flex items-center gap-4">
        <h4>Membros da Família</h4>

        <Button
          className="text-default-600"
          color="default"
          size="sm"
          variant="faded"
          onPress={addMember}
        >
          <PlusIcon /> Adicionar membros
        </Button>
      </div>

      {family.members.map((member, index) => (
        <div
          key={index}
          className="relative flex w-full flex-col items-center gap-2 rounded-lg border-1 border-default/30 p-4 lg:flex-row lg:border-none lg:p-0"
        >
          <Input
            isRequired
            label={"Nome"}
            value={member.name}
            onChange={(e) => updateMember(index, "name", e.target.value)}
          />
          <Input
            isRequired
            label={"Email"}
            type={"email"}
            value={member.email}
            onChange={(e) => updateMember(index, "email", e.target.value)}
            isDisabled={index === 0}
          />
          <Button
            isIconOnly
            color="danger"
            isDisabled={index === 0}
            variant="light"
            onPress={() => removeMember(index)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ))}

      <Button
        className="mt-8 self-end border-2 border-primary-200"
        color="primary"
        type="submit"
        variant="flat"
        isLoading={createFamilyMutation.isPending}
      >
        Salvar
      </Button>
    </Form>
  )
}
