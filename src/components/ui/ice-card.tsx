import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface IceCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "hot" | "crystal"
}

export function IceCard({ className, variant = "default", children, ...props }: IceCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300",
                // Default Ice Variant
                variant === "default" && "bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(34,211,238,0.1)]",
                // Hot Deal Variant (Fire & Ice)
                variant === "hot" && "bg-gradient-to-br from-white/5 to-neon-orange/5 border-neon-orange/20 shadow-[0_8px_32px_0_rgba(255,100,0,0.15)] hover:border-neon-orange/40 hover:shadow-[0_8px_32px_0_rgba(255,100,0,0.25)]",
                // Crystal Variant (Extra Glossy)
                variant === "crystal" && "bg-white/10 border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:scale-[1.02]",
                className
            )}
            {...props}
        >
            {/* Glossy Reflection Highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

            {/* Inner Glow Shine */}
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-ice-shine pointer-events-none" />

            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    )
}
