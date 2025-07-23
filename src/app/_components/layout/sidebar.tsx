"use client"
import {
  Sidebar as RadixSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "../external/radix/sidebar"
import Logo from "@/src/app/_components/layout/logo"
import { UserButton, useUser } from "@clerk/nextjs"
import { Avatar } from "@heroui/avatar"
import { useEffect, useState } from "react"

export default function Sidebar() {
  const { state } = useSidebar()
  const user = useUser()
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    if (state === "expanded") {
      setTimeout(setIsExpanded, 200, true)
    } else {
      setIsExpanded(false)
    }
  }, [state])

  return (
    <RadixSidebar collapsible="icon" variant="floating">
      <SidebarHeader className="items-center p-0">
        <Logo size={isExpanded ? 60 : 40} />
        {isExpanded && (
          <p className={`font-mono text-2xl font-bold text-primary`}>
            Nossa Grana
          </p>
        )}
      </SidebarHeader>
      <SidebarContent />

      <SidebarFooter>
        {isExpanded ? (
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10", // Custom width and height
                userButtonBox: {
                  flexDirection: "row-reverse",
                  width: "100%", // Full width
                },
              },
            }}
            showName
          />
        ) : (
          <Avatar isBordered size="sm" src={user.user?.imageUrl ?? ""} />
        )}
      </SidebarFooter>
    </RadixSidebar>
  )
}
