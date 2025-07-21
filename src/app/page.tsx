import { cn } from "@heroui/theme"
import { Navbar } from "@/src/app/_components/layout/navbar"
import Pain from "@/src/app/_components/page-hero/pain"
import { Hero } from "@/src/app/_components/page-hero/hero"

export default async function Home() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-sm flex-grow p-2 pt-16 xl:max-w-5xl">
        <div className="fixed inset-0">
          <div className="relative flex h-[50rem] w-full items-center justify-center bg-white dark:bg-black">
            <div className="absolute right-[20vw] top-10 z-10 h-[150px] w-[400px] rotate-[0deg] transform rounded-full bg-gradient-to-tl from-slate-800 via-primary-500 to-zinc-400 blur-[150px]" />

            <div
              className={cn(
                "absolute inset-0",
                "[background-size:20px_20px]",
                "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
                "dark:[background-image:radial-gradient(#202020_1px,transparent_1px)]"
              )}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
          </div>
        </div>
        <Hero />
        <Pain />
      </div>
    </>
  )
}
