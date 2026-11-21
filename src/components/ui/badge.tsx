import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Figma: Badge (Tone = Orange | Green | Brown | Red) */
const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 t-caption", {
  variants: {
    tone: {
      orange: "bg-orange-500 text-brown-900",
      green: "bg-green-500 text-white",
      brown: "bg-brown-700 text-cream-100",
      red: "bg-sale text-white",
    },
  },
  defaultVariants: { tone: "orange" },
});

export function Badge({ className, tone, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
