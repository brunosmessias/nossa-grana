"use client"
import {
  Sidebar as RadixSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "../external/radix/sidebar"
import Logo from "@/src/app/_components/layout/logo"
import { UserButton, useUser } from "@clerk/nextjs"
import { Avatar } from "@heroui/avatar"
import { useEffect, useState } from "react"
import { Link } from "@heroui/link"
import { usePathname } from "next/navigation"
import { Home, Users } from "lucide-react"

export default function Sidebar() {
  const { state, setOpenMobile } = useSidebar()
  const user = useUser()
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Família", href: "/family", icon: Users },
  ]

  useEffect(() => {
    if (state === "expanded") {
      setTimeout(setIsExpanded, 200, true)
    } else {
      setIsExpanded(false)
    }
  }, [state])

  return (
    <RadixSidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarTrigger className="self-end"></SidebarTrigger>
        <div className="flex flex-col items-center p-0">
          <Logo size={isExpanded ? 60 : 40} />
          {isExpanded && (
            <p className={`font-mono text-2xl font-bold text-primary`}>
              Nossa Grana
            </p>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav className="mt-8 flex flex-col gap-2 px-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                data-expanded={isExpanded}
                key={href}
                href={href}
                onPress={() => setOpenMobile(false)}
                color={isActive ? "primary" : "foreground"}
                className={`flex items-center justify-center gap-3 rounded-md py-2 transition-colors data-[expanded=true]:justify-start data-[expanded=true]:px-3 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-default-200"
                }`}
              >
                <Icon size={20} />
                {isExpanded && <span className="font-medium">{label}</span>}
              </Link>
            )
          })}
        </nav>
      </SidebarContent>

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
