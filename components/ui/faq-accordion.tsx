"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

export interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    faqs: FAQItem[]
    title?: string
    className?: string
}

export function FAQAccordion({ faqs, title = "الأسئلة الشائعة", className = "" }: FAQAccordionProps) {
    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h3>
            </div>

            {/* Accordion */}
            <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border border-border rounded-xl px-6 bg-card hover:bg-accent/5 transition-colors"
                    >
                        <AccordionTrigger className="text-right hover:no-underline py-5">
                            <span className="text-base md:text-lg font-semibold text-foreground pr-2">
                                {faq.question}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-5">
                            <div className="pt-2 pr-2 whitespace-pre-line">
                                {faq.answer}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}
