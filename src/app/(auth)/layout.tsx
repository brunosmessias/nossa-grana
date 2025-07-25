import {
  SidebarProvider,
  SidebarTrigger,
} from "@/src/app/_components/external/radix/sidebar"
import Sidebar from "@/src/app/_components/layout/sidebar"
import { cn } from "@heroui/theme"
import React from "react"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="m-2 flex flex-grow flex-col">
        <div className="flex flex-row items-center gap-4">
          <SidebarTrigger
            className={cn(
              "w-fit justify-start border-1 border-default-200",
              "bg-foreground/10 p-2 text-default-600 backdrop-blur-md lg:hidden"
            )}
          >
            Abrir sidebar
          </SidebarTrigger>
          {/*<Divider className="h-6" orientation={"vertical"} />*/}
          {/*<Breadcrumbs />*/}
        </div>

        {children}
      </div>
    </SidebarProvider>
  )
}
