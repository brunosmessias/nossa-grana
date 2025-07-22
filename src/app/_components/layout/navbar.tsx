import { auth, currentUser } from "@clerk/nextjs/server";
import Logo from "@/src/app/_components/layout/logo";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar"
import { SignInButton, SignOutButton, UserButton } from "@clerk/nextjs"
export default async function Navbar() {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null;

  return (
    <HeroUINavbar
      isBordered
      classNames={{
        base: "max-w-5xl w-11/12 xl:w-full border-primary-50 border-1 rounded-2xl m-auto mt-5 font-heading",
      }}
    >
      <NavbarBrand className="flex items-center">
        <Logo size={60} />
        <p className="font-mono text-2xl font-bold text-primary">
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
            <UserButton></UserButton>
            <SignOutButton>
              <Button color="default" variant="flat">
                Sair
              </Button>
            </SignOutButton>
          </>
        )}
      </NavbarContent>
    </HeroUINavbar>
  );
}