import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Figma: Button (Type = Primary | Accent | Outline | Light | WhatsApp, State = Default | Hover | Disabled) */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm t-button transition-[background-color,color,box-shadow,border-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 hover:shadow-[0_4px_12px_rgb(90_43_19/0.18)] [&_svg]:shrink-0 [&_svg]:size-[18px] cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-brown-700 text-cream-100 hover:bg-brown-900",
        accent: "bg-orange-500 text-brown-900 hover:bg-orange-600 hover:text-cream-50",
        outline: "border-[1.5px] border-brown-700 bg-white text-brown-700 hover:bg-brown-700 hover:text-cream-100",
        light: "bg-cream-100 text-brown-700 hover:bg-cream-200",
        whatsapp: "bg-whatsapp text-white hover:opacity-90",
        ghost: "text-brown-700 hover:bg-cream-100 hover:shadow-none",
        link: "px-0 text-brown-700 underline-offset-4 hover:underline hover:shadow-none",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-[46px] px-6",
        lg: "h-[54px] px-7",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
