import { cn } from "@/lib/utils";

const TONES = {
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
  "orange-solid": "bg-orange-500 text-brown-900",
  brown: "bg-brown-700 text-cream-100",
  cream: "bg-cream-200 text-ink-muted",
} as const;

export function IconCircle({
  tone = "green",
  size = 48,
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  size?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full [&_svg]:size-[45%]", TONES[tone], className)}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}
