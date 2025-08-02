import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-pam-burgundy text-pam-white hover:bg-pam-burgundy/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-pam-gray-border bg-pam-white text-pam-burgundy hover:bg-pam-burgundy hover:text-pam-white",
        secondary: "bg-pam-pink text-pam-burgundy hover:bg-pam-pink/80",
        ghost: "hover:bg-pam-gray-border/50 hover:text-pam-burgundy",
        link: "text-pam-burgundy underline-offset-4 hover:underline",
        success: "bg-pam-success text-pam-white hover:bg-pam-success/90 shadow-sm",
        // Legacy PAM variants (updated to use burgundy)
        pam: "bg-pam-burgundy text-pam-white hover:bg-pam-burgundy/90 shadow-sm",
        'pam-secondary': "bg-pam-pink text-pam-burgundy hover:bg-pam-pink/80",
        'pam-outline': "border-2 border-pam-burgundy text-pam-burgundy hover:bg-pam-burgundy hover:text-pam-white"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }