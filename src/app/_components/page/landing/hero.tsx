import { Button } from "@heroui/button"
import RotatingText from "@/src/app/_components/external/rotatingText"

export const Hero = () => {
  return (
    <section
      className={`mx-auto my-16 flex flex-col justify-center gap-3 font-heading font-bold xl:my-32`}
    >
      <div className="z-10">
        <h1 className={`w-full text-3xl xl:text-5xl`}>
          A sua grana{" "}
          <RotatingText
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            initial={{ y: "100%" }}
            mainClassName="inline-flex overflow-hidden text-primary rounded-lg"
            rotationInterval={3000}
            splitLevelClassName="overflow-hidden"
            staggerDuration={0.025}
            staggerFrom={"last"}
            texts={[
              "organizada!",
              "inteligente!",
              "tem que ser simples.",
              "bem cuidada",
              "no lugar certo!",
              "na palma da sua mão",
              "que trabalha para você",
            ]}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
            }}
          />
        </h1>
        <span className="text-3xl xl:text-5xl">O controle também.</span>
        <h2
          className={`mt-4 font-mono text-2xl font-medium text-foreground/50 xl:text-3xl`}
        >
          {" "}
          Organize as finanças da família apenas falando com o Nossa Grana.
        </h2>
        <div className="mt-10 flex justify-center">
          <Button
            className="font-bold"
            color="primary"
            size="lg"
            variant="shadow"
          >
            COMECE AGORA!
          </Button>
        </div>
      </div>
    </section>
  )
}
