import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, type LucideIcon } from "lucide-react"

interface ServiceCardProps {
    icon: LucideIcon
    title: string
    description: string
    href: string
    image?: string
    features?: string[]
    ctaText?: string
    variant?: "compact" | "detailed"
}

export function ServiceCard({
    icon: Icon,
    title,
    description,
    href,
    image,
    features,
    ctaText = "اطلب الخدمة",
    variant = "compact",
}: ServiceCardProps) {
    const isDetailed = variant === "detailed"

    return (
        <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow group h-full flex flex-col">
            {image && (
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/5 transition-colors" />
                </div>
            )}

            <CardHeader className={image ? "pt-4" : "pt-6"}>
                <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground p-3 rounded-xl flex-shrink-0">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                            {title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </CardHeader>

            {isDetailed && features && features.length > 0 && (
                <CardContent className="flex-1">
                    <ul className="space-y-2">
                        {features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            )}

            <CardFooter className={isDetailed ? "pt-0" : "mt-auto pt-0 pb-6"}>
                <Button asChild className="w-full gap-2">
                    <Link href={href}>
                        {ctaText}
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
