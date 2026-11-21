import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ variant = "dark", className, priority }: { variant?: "dark" | "light"; className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Potato First — home" className={cn("inline-block shrink-0 transition-opacity hover:opacity-80", className)}>
      <Image
        src={variant === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
        alt="Potato First"
        width={1060}
        height={680}
        priority={priority}
        className="h-auto w-full"
      />
    </Link>
  );
}
