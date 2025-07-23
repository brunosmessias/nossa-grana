import {
  SidebarProvider,
  SidebarTrigger,
} from "@/src/app/_components/external/radix/sidebar"
import { Divider } from "@heroui/divider"
import Sidebar from "@/src/app/_components/layout/sidebar"
import Breadcrumbs from "@/src/app/_components/layout/breadcrumbs"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="m-2 flex-grow xl:m-8">
        <div className="flex flex-row items-center gap-4">
          <SidebarTrigger />
          <Divider className="h-6" orientation={"vertical"} />
          <Breadcrumbs />
        </div>

        {children}
      </div>
    </SidebarProvider>
  )
}
