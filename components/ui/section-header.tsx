import { cn } from "@/lib/utils"

interface SectionHeaderProps {
    badge?: string
    title: string
    subtitle?: string
    centered?: boolean
    className?: string
}

export function SectionHeader({
    badge,
    title,
    subtitle,
    centered = true,
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn(centered ? "text-center" : "text-right", "mb-12", className)}>
            {badge && (
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                    {badge}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    )
}
