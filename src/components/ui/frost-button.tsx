import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const frostButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
    {
        variants: {
            variant: {
                default: "bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]",
                primary: "bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]",
                fire: "bg-neon-orange/10 border border-neon-orange/50 text-neon-orange hover:bg-neon-orange/20 hover:shadow-[0_0_20px_rgba(255,100,0,0.5)]",
                ghost: "hover:bg-white/10 hover:text-white",
            },
            size: {
                default: "h-12 px-6 py-2",
                sm: "h-9 rounded-lg px-3",
                lg: "h-14 rounded-2xl px-8 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface FrostButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof frostButtonVariants> {
    asChild?: boolean
}

const FrostButton = React.forwardRef<HTMLButtonElement, FrostButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(frostButtonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {/* Frost Glint Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-ice-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative z-10 flex items-center gap-2">{props.children}</span>
            </Comp>
        )
    }
)
FrostButton.displayName = "FrostButton"

export { FrostButton, frostButtonVariants }
