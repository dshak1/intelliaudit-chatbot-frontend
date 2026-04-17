import Image from "next/image"

import { cn } from "@/lib/utils"

type SiteLogoProps = {
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function SiteLogo({ className, imageClassName, priority = false }: SiteLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/intelliaudit-logo.png"
        alt="IntelliAudit logo"
        width={922}
        height={224}
        priority={priority}
        className={cn("h-auto w-full object-contain", imageClassName)}
      />
    </div>
  )
}
