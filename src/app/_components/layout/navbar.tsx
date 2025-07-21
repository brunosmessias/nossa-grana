import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar"
import { Button } from "@heroui/button"
import { Link } from "@heroui/link"
import Logo from "@/src/app/_components/layout/logo"

export const Navbar = () => {
  return (
    <HeroUINavbar
      isBordered
      classNames={{
        base: "max-w-5xl w-11/12 xl:w-full border-primary-50 border-1 rounded-2xl m-auto mt-5 font-heading",
      }}
    >
      <NavbarBrand className="flex items-center">
        <Logo size={60} />
        <p className={`font-mono text-2xl font-bold text-primary`}>
          Nossa Grana
        </p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem className="hidden xl:flex">
          <Link href="/api/auth/signin?callbackUrl=/welcome">Entrar</Link>
        </NavbarItem>
        <NavbarItem>
          <Button
            as={Link}
            color="primary"
            href="/api/auth/signin?callbackUrl=/welcome"
            variant="flat"
          >
            Teste grátis!
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  )
}
