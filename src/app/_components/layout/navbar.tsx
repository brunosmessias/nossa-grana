import { auth, currentUser } from "@clerk/nextjs/server"
import { Button } from "@heroui/button"
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/navbar"
import { SignInButton, UserButton } from "@clerk/nextjs"
import Logo from "@/src/app/_components/layout/logo"
import { Link } from "@heroui/link"

export default async function Navbar() {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null

  return (
    <HeroUINavbar
      isBordered
      classNames={{
        base: "max-w-5xl w-11/12 xl:w-full border-primary-50 border-1 rounded-2xl m-auto mt-5 font-heading",
      }}
    >
      <NavbarBrand className="flex items-end">
        <Logo className="h-10 w-10 lg:h-12 lg:w-12" />
        <p className="font-mono text-2xl font-bold text-primary lg:text-3xl">
          Nossa Grana
        </p>
      </NavbarBrand>
      <NavbarContent justify={"end"}>
        {!user ? (
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
            <Button color="primary" variant="flat">
              Entrar
            </Button>
          </SignInButton>
        ) : (
          <>
            <div className="hidden lg:flex">
              <UserButton></UserButton>
            </div>
            <Button
              as={Link}
              href="/dashboard"
              color="primary"
              variant="faded"
              className="border-2 border-primary/20"
            >
              Dashboard
            </Button>
          </>
        )}
      </NavbarContent>
    </HeroUINavbar>
  )
}
