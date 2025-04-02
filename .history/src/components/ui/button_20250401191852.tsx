import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-neutral-100 disabled:from-neutral-100 disabled:to-neutral-100 disabled:text-netural-300 border-1 border-neutral-200 shadow-md",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b shadow-md from-[var(--primary-foreground)] to-[var(--primary)] text-white hover:text-inverse transition hover:from-[var(--primary)] hover:to-[var(--primary)] transition",
        destructive:
          "bg-gradient-to-b shadow-md from-[var(--destructive-foreground)] to-[var(--destructive)] text-white hover:from-[var(--destructive)] hover:to-[var(--destructive)] transition",
        outline:
          "border-1 border-input bg-background shadow-md hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-tertiary hover:bg-quaternary text-primary font-bold transition shadow-md disabled:bg-tertiary disabled:text-muted",
        ghost: "border-transparent shadow-none hover:bg-accent hover:bg-tertiary",
        muted: "bg-neutral-200 text-neutral-600 hover:bg-neutral-200/80",
        tertiary: "bg-blue-100 text-blue-600 border-transparent hover:bg-blue-200 shadow-none"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        xs: "h-7 rounded-md px-2 text-xs",
        lg: "h-12 rounded-md px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
