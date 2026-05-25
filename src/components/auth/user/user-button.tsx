"use client"

import { authClient } from "@/server/auth/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronsUpDown, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type SessionUser = {
  id: string
  name: string | null
  email: string
  image: string | null
}

export function UserButton() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isPending, setIsPending] = useState(true)
  const router = useRouter()

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          image: data.user.image ?? null,
        })
      }
      setIsPending(false)
    })
  }, [])

  const initials = (user?.name || user?.email)?.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-full" />
        <div className="grid flex-1 gap-1 text-left text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="w-full inline-flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-normal hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
      >
        <Avatar className="size-8 rounded-full">
          {user?.image && <AvatarImage src={user.image} alt={user.name || user.email} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user?.name || user?.email}</span>
          {user?.name && (
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          )}
        </div>
        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 rounded-full">
                {user?.image && <AvatarImage src={user.image} alt={user.name || user.email} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || user?.email}</span>
                {user?.name && (
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/dashboard/familia" />}>
          Família
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="text-muted-foreground" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
