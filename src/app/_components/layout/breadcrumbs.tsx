"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  BreadcrumbItem,
  Breadcrumbs as HeroUiBreadcrumbs,
} from "@heroui/breadcrumbs"

export default function Breadcrumbs() {
  /* eslint-disable */
  const paths = usePathname()
  const pathNames = paths.split("/").filter((path) => path)

  return (
    <>
      <HeroUiBreadcrumbs className={`capitalize`}>
        {pathNames.map((pathName) => (
          <BreadcrumbItem key={pathName} href={pathName}>
            {pathName}
          </BreadcrumbItem>
        ))}
      </HeroUiBreadcrumbs>
    </>
  )
}
