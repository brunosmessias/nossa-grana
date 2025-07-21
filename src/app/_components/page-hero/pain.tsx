import { Image } from "@heroui/image"
import { Link } from "@heroui/link"
import { ShineBorder } from "@/src/app/_components/animated/shineBorder"
import TrueFocus from "@/src/app/_components/animated/trueFocus"

export default function Pain() {
  return (
    <div className="grid gap-4 xl:grid-cols-6 xl:grid-rows-2">
      <div className="relative xl:col-span-4 xl:row-span-2">
        <div className="absolute inset-px rounded-lg bg-default/10 backdrop-blur-lg xl:rounded-tl-[2rem]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] border-1 border-default xl:rounded-tl-[calc(2rem+1px)]">
          <div className="px-8 pb-3 pt-8">
            <p
              className={`mt-2 font-mono text-3xl font-bold tracking-tight text-primary max-xl:text-center`}
            >
              Como a mágica acontece
            </p>
            <p className="text-md/6 mt-2 max-w-lg text-default-700 max-xl:text-center">
              Tão simples quanto conversar: Ei Nossa Grana, gastei 50 reais no
              almoço hoje.Pronto! Registrado, categorizado e seu orçamento
              atualizado em segundos
            </p>
          </div>
          <div className="@container relative w-full grow max-xl:mx-auto max-xl:max-w-sm xl:min-h-[30rem]">
            <Image
              isBlurred
              alt="Infográfico em três etapas mostrando o funcionamento do sistema: 1. Grave um áudio descrevendo os gastos do dia (ícone de microfone e documento); 2. A IA analisa e categoriza os dados automaticamente (ícone de engrenagem e perfil); 3. O orçamento é atualizado de forma instantânea (ícone de calendário com marcação)"
              className="p-5"
              src="/step1.png"
            />
          </div>
        </div>
      </div>

      <div className="max-xl:row-start-0 relative xl:col-span-2 xl:col-start-5">
        <div className="absolute inset-px rounded-lg bg-default/10 backdrop-blur-lg xl:rounded-t-[2rem]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] border-1 border-default xl:rounded-tr-[calc(2rem+1px)]">
          <div className="p-8 xl:pb-0">
            <p
              className={`mt-2 font-mono text-5xl font-bold text-primary max-xl:text-center`}
            >
              Grana da Família Toda
            </p>
            <p className="text-md/6 mt-2 max-w-lg text-default-700 max-xl:text-center">
              Todo mundo colabora, ninguém se estressa.
            </p>
          </div>
        </div>
      </div>

      <div className="relative cursor-pointer xl:col-span-2 xl:col-start-5">
        <div className="absolute inset-px rounded-lg bg-primary/10 backdrop-blur-lg" />
        <ShineBorder
          className="border-1 border-default"
          shineColor={["#96e2a1", "#5dd26f", "#3c8948"]}
        />

        <div className="relative flex h-full flex-col overflow-hidden">
          <div className="flex flex-col p-8 xl:pb-0">
            <p
              className={`mt-2 font-mono text-3xl font-bold tracking-tight text-primary max-xl:text-center`}
            >
              Teste gratuitamente.
            </p>
            <p className="text-md/6 mt-2 max-w-lg text-default-700 max-xl:text-center">
              Teste por 7 dias, e só pague depois. Cancele quando quiser!
            </p>

            <Link className="mt-5 max-xl:mx-auto">Começar agora!</Link>
          </div>
        </div>
      </div>

      <div className="xl:col-start-0 relative xl:col-span-3">
        <div className="absolute inset-px rounded-lg bg-default/10 backdrop-blur-lg xl:rounded-b-[2rem]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] border-1 border-default xl:rounded-bl-[calc(2rem+1px)]">
          <div className="p-8 xl:pb-0">
            <p
              className={`mt-2 font-mono text-3xl font-bold tracking-tight text-primary max-xl:text-center`}
            >
              Controle na Palma da Mão
            </p>

            <p className="text-md/6 mt-2 max-w-lg text-default-700 max-xl:text-center">
              Nossa IA analisa seus hábitos e mostra oportunidades para
              economizar que você nem imaginava.
            </p>

            <div className="mt-12 max-w-lg text-2xl font-bold text-default-800">
              <TrueFocus
                animationDuration={1}
                blurAmount={2}
                borderColor="#00d8ff"
                manualMode={false}
                pauseBetweenAnimations={0.2}
                sentence="Descubra para onde/vai sua grana/sem esforço."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative xl:col-span-3 xl:col-start-4">
        <div className="absolute inset-px rounded-lg bg-default/10 backdrop-blur-lg xl:rounded-b-[2rem]" />
        <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] border-1 border-default xl:rounded-br-[calc(2rem+1px)]">
          <div className="p-8 xl:pb-0">
            <p
              className={`mt-2 font-mono text-3xl font-bold tracking-tight text-primary max-xl:text-center`}
            >
              Do sonho a realidade!
            </p>
            <p className="text-md/6 mt-2 max-w-lg text-default-700 max-xl:text-center">
              Da mesada das crianças à casa na praia. Defina objetivos,
              acompanhe o progresso e receba dicas da nossa IA para chegar lá
              mais rápido
            </p>
          </div>
          <div className="w-full">
            <Image
              alt="Ilustração de uma transformação de uma lagarta em borboleta, mostrando as etapas do ciclo de vida: uma lagarta verde, seguida por casulos em diferentes estágios, e finalmente uma borboleta azul totalmente formada"
              className="p-8"
              src="/step4.png"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
