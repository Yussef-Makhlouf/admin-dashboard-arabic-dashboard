import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, CheckCircle } from "lucide-react"

interface CtaBlockProps {
    title: string
    description?: string
    benefits?: string[]
    phoneNumber?: string
    whatsappNumber?: string
    variant?: "primary" | "secondary"
    className?: string
}

export function CtaBlock({
    title,
    description,
    benefits,
    phoneNumber = "+966507067378",
    whatsappNumber = "966507067378",
    variant = "primary",
    className,
}: CtaBlockProps) {
    const isPrimary = variant === "primary"

    return (
        <div
            className={`py-16 ${isPrimary ? "bg-primary text-primary-foreground" : "bg-muted/50"} ${className}`}
        >
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2
                        className={`font-heading text-3xl md:text-4xl font-bold mb-6 ${isPrimary ? "" : "text-foreground"
                            }`}
                    >
                        {title}
                    </h2>

                    {description && (
                        <p
                            className={`text-lg leading-relaxed mb-8 ${isPrimary ? "opacity-90" : "text-muted-foreground"
                                }`}
                        >
                            {description}
                        </p>
                    )}

                    {benefits && benefits.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit}
                                    className="flex items-center gap-2 justify-center md:justify-start"
                                >
                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                    <span className="text-sm">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            variant={isPrimary ? "secondary" : "default"}
                            className="gap-2 text-lg h-14"
                            asChild
                        >
                            <a href={`tel:${phoneNumber}`}>
                                <Phone className="h-5 w-5" />
                                اتصل الآن
                            </a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className={`gap-2 text-lg h-14 bg-transparent ${isPrimary
                                ? "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                                : ""
                                }`}
                            asChild
                        >
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="h-5 w-5" />
                                واتساب
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
