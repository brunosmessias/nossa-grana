import React from "react"
import { motion } from "framer-motion"
import { Button, ButtonProps } from "@heroui/button"
import { useIsMobile } from "@heroui/use-is-mobile"

const ExpandingButton = ({
  text,
  width = 10,
  children,
  ...props
}: { text: string; width: number } & ButtonProps) => {
  const isMobile = useIsMobile()
  const baseTransition = {
    duration: 0.25,
    ease: "easeOut" as const,
  }

  const buttonVariants = {
    initial: { width: "40px" },
    hover: {
      width: "100%",
      transition: baseTransition,
    },
  }

  const iconVariants = {
    initial: { x: 4 },
    hover: {
      x: 0,
      transition: baseTransition,
    },
  }

  const textVariants = {
    initial: {
      opacity: 0,
      width: "0%",
      x: 16,
    },
    hover: {
      opacity: 1,
      width: "auto",
      x: 0,
      transition: {
        ...baseTransition,
        delay: 0.05, // Pequeno delay para suavizar o aparecimento
      },
    },
  }

  return (
    <motion.div
      initial={isMobile ? "hover" : "initial"}
      animate={isMobile ? "hover" : undefined}
      whileHover={isMobile ? undefined : "hover"}
      variants={buttonVariants}
      style={{ overflow: "hidden", maxWidth: width + "rem" }} // Previne overflow durante a animação
    >
      <Button
        {...props}
        isIconOnly
        className="flex h-full w-full items-center justify-center !gap-2 p-2"
      >
        <motion.span
          className="flex flex-shrink-0 items-center"
          variants={iconVariants}
        >
          {children}
        </motion.span>

        <motion.span
          className="overflow-hidden whitespace-nowrap"
          variants={textVariants}
        >
          {text}
        </motion.span>
      </Button>
    </motion.div>
  )
}

export default ExpandingButton
