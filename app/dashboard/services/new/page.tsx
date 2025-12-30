"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    ArrowRight,
    Loader2,
    Save,
    Plus,
    Trash2,
    GripVertical,
    Image as ImageIcon,
    Upload,
    X,
    ChevronDown,
    ChevronUp,
    Eye
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

interface SectionItem {
    title: string
    description: string
}

interface Section {
    id: string
    type: "text-image" | "faq-accordion"
    title: string
    content: string
    image: string
    items: SectionItem[]
}

interface FormData {
    slug: string
    title: string
    subtitle: string
    icon: string
    isActive: boolean
    seo: {
        title: string
        description: string
        keywords: string[]
    }
    hero: {
        image: string
        imageAlt: string
        description: string
        features: string[]
    }
    sections: Section[]
    cta: {
        title: string
        description: string
        benefits: string[]
    }
    testimonials: {
        name: string
        location: string
        rating: number
        comment: string
        service: string
    }[]
}

export default function NewServicePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [formData, setFormData] = useState<FormData>({
        slug: "",
        title: "",
        subtitle: "",
        icon: "Wind",
        isActive: true,
        seo: {
            title: "",
            description: "",
            keywords: [],
        },
        hero: {
            image: "/cover1.png",
            imageAlt: "",
            description: "",
            features: [""],
        },
        sections: [],
        cta: {
            title: "",
            description: "",
            benefits: [""],
        },
        testimonials: [],
    })

    // Image upload handler
    const uploadImage = async (file: File): Promise<string> => {
        const token = localStorage.getItem("token")
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("http://localhost:5000/api/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const data = await res.json()
        if (data.success) {
            return `http://localhost:5000${data.data.url}`
        }
        throw new Error("فشل رفع الصورة")
    }

    // Hero image dropzone
    const onHeroImageDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            try {
                const url = await uploadImage(acceptedFiles[0])
                setFormData(prev => ({
                    ...prev,
                    hero: { ...prev.hero, image: url }
                }))
                toast.success("تم رفع الصورة")
            } catch (error) {
                toast.error("فشل رفع الصورة")
            }
        }
    }, [])

    const { getRootProps: getHeroRootProps, getInputProps: getHeroInputProps } = useDropzone({
        onDrop: onHeroImageDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        multiple: false
    })

    // Add new section
    const addSection = (type: "text-image" | "faq-accordion") => {
        const newSection: Section = {
            id: `section-${Date.now()}`,
            type,
            title: "",
            content: "",
            image: "",
            items: type === "faq-accordion" ? [{ title: "", description: "" }] : []
        }
        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }))
        setActiveSection(newSection.id)
    }

    // Remove section
    const removeSection = (id: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter(s => s.id !== id)
        }))
    }

    // Move section up/down
    const moveSection = (index: number, direction: "up" | "down") => {
        const newSections = [...formData.sections]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= newSections.length) return
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
        setFormData(prev => ({ ...prev, sections: newSections }))
    }

    // Update section
    const updateSection = (id: string, updates: Partial<Section>) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
        }))
    }

    // Add FAQ item to section
    const addFaqItem = (sectionId: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === sectionId
                    ? { ...s, items: [...s.items, { title: "", description: "" }] }
                    : s
            )
        }))
    }

    // Remove FAQ item from section
    const removeFaqItem = (sectionId: string, itemIndex: number) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === sectionId
                    ? { ...s, items: s.items.filter((_, i) => i !== itemIndex) }
                    : s
            )
        }))
    }

    // Update FAQ item
    const updateFaqItem = (sectionId: string, itemIndex: number, updates: Partial<SectionItem>) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.id === sectionId
                    ? { ...s, items: s.items.map((item, i) => i === itemIndex ? { ...item, ...updates } : item) }
                    : s
            )
        }))
    }

    // Upload section image
    const uploadSectionImage = async (sectionId: string, file: File) => {
        try {
            const url = await uploadImage(file)
            updateSection(sectionId, { image: url })
            toast.success("تم رفع الصورة")
        } catch (error) {
            toast.error("فشل رفع الصورة")
        }
    }

    // Add hero feature
    const addHeroFeature = () => {
        setFormData(prev => ({
            ...prev,
            hero: { ...prev.hero, features: [...prev.hero.features, ""] }
        }))
    }

    // Update hero feature
    const updateHeroFeature = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            hero: {
                ...prev.hero,
                features: prev.hero.features.map((f, i) => i === index ? value : f)
            }
        }))
    }

    // Remove hero feature
    const removeHeroFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            hero: {
                ...prev.hero,
                features: prev.hero.features.filter((_, i) => i !== index)
            }
        }))
    }

    // Add CTA benefit
    const addCtaBenefit = () => {
        setFormData(prev => ({
            ...prev,
            cta: { ...prev.cta, benefits: [...prev.cta.benefits, ""] }
        }))
    }

    // Update CTA benefit
    const updateCtaBenefit = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            cta: {
                ...prev.cta,
                benefits: prev.cta.benefits.map((b, i) => i === index ? value : b)
            }
        }))
    }

    // Remove CTA benefit
    const removeCtaBenefit = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cta: {
                ...prev.cta,
                benefits: prev.cta.benefits.filter((_, i) => i !== index)
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem("token")

            // Clean empty features and benefits
            const cleanedData = {
                ...formData,
                hero: {
                    ...formData.hero,
                    features: formData.hero.features.filter(f => f.trim())
                },
                cta: {
                    ...formData.cta,
                    benefits: formData.cta.benefits.filter(b => b.trim())
                },
                sections: formData.sections.map(s => ({
                    ...s,
                    items: s.items.filter(item => item.title.trim() || item.description.trim())
                }))
            }

            const res = await fetch("http://localhost:5000/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(cleanedData),
            })

            const data = await res.json()

            if (data.success) {
                toast.success("تم إنشاء الخدمة بنجاح")
                router.push("/dashboard/services")
            } else {
                throw new Error(data.message)
            }
        } catch (error: any) {
            toast.error(error.message || "فشل إنشاء الخدمة")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/services">
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">إضافة خدمة جديدة</h1>
                        <p className="text-muted-foreground mt-1">أضف خدمة جديدة مع محتوى غني وصور</p>
                    </div>
                </div>
                <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="ml-2 h-4 w-4" />
                    )}
                    حفظ الخدمة
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>المعلومات الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">عنوان الخدمة *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="مثال: شركة عزل فوم بالرياض"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">الرابط (Slug) *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="مثال: foam-insulation"
                                    required
                                    dir="ltr"
                                    className="text-left"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subtitle">الوصف المختصر *</Label>
                            <textarea
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="وصف قصير ومُقنع للخدمة"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                    <CardHeader>
                        <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="seoTitle">عنوان SEO (يظهر في نتائج البحث)</Label>
                            <Input
                                id="seoTitle"
                                value={formData.seo.title}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    seo: { ...formData.seo, title: e.target.value }
                                })}
                                placeholder="عنوان الصفحة في Google - 60 حرف كحد أقصى"
                                maxLength={70}
                            />
                            <p className="text-xs text-muted-foreground">{formData.seo.title.length}/70 حرف</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seoDesc">وصف SEO (Meta Description)</Label>
                            <textarea
                                id="seoDesc"
                                value={formData.seo.description}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    seo: { ...formData.seo, description: e.target.value }
                                })}
                                placeholder="وصف مُقنع يظهر تحت العنوان في نتائج البحث - 160 حرف كحد أقصى"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                maxLength={160}
                            />
                            <p className="text-xs text-muted-foreground">{formData.seo.description.length}/160 حرف</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keywords">الكلمات المفتاحية (Keywords)</Label>
                            <Input
                                id="keywords"
                                value={formData.seo.keywords.join(", ")}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    seo: { ...formData.seo, keywords: e.target.value.split(",").map(k => k.trim()) }
                                })}
                                placeholder="عزل فوم, عزل حراري, توفير الكهرباء..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Hero Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم Hero (أعلى الصفحة)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Hero Image */}
                        <div className="space-y-2">
                            <Label>صورة Hero الرئيسية</Label>
                            <div
                                {...getHeroRootProps()}
                                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            >
                                <input {...getHeroInputProps()} />
                                {formData.hero.image ? (
                                    <div className="relative aspect-video max-w-md mx-auto">
                                        <Image
                                            src={formData.hero.image}
                                            alt="Hero image"
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setFormData(prev => ({ ...prev, hero: { ...prev.hero, image: "" } }))
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                        <p>اسحب الصورة هنا أو اضغط للاختيار</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hero Description */}
                        <div className="space-y-2">
                            <Label htmlFor="heroDesc">وصف Hero التفصيلي</Label>
                            <textarea
                                id="heroDesc"
                                value={formData.hero.description}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    hero: { ...formData.hero, description: e.target.value }
                                })}
                                placeholder="وصف شامل ومفصل للخدمة يظهر في أعلى الصفحة ويجذب العميل..."
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Hero Features */}
                        <div className="space-y-2">
                            <Label>مميزات سريعة (تظهر كقائمة)</Label>
                            {formData.hero.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={feature}
                                        onChange={(e) => updateHeroFeature(index, e.target.value)}
                                        placeholder={`الميزة ${index + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeHeroFeature(index)}
                                        disabled={formData.hero.features.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addHeroFeature}>
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة ميزة
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Sections */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>أقسام المحتوى</CardTitle>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => addSection("text-image")}>
                                <Plus className="ml-2 h-4 w-4" />
                                قسم نص + صورة
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => addSection("faq-accordion")}>
                                <Plus className="ml-2 h-4 w-4" />
                                قسم أسئلة شائعة
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {formData.sections.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>لا توجد أقسام بعد</p>
                                <p className="text-sm">أضف أقسام المحتوى باستخدام الأزرار أعلاه</p>
                            </div>
                        ) : (
                            formData.sections.map((section, index) => (
                                <Card key={section.id} className="border-2">
                                    <CardHeader
                                        className="cursor-pointer"
                                        onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                                    {section.type === "faq-accordion" ? "أسئلة" : "نص + صورة"}
                                                </span>
                                                <span className="font-medium">{section.title || `القسم ${index + 1}`}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); moveSection(index, "up") }}
                                                    disabled={index === 0}
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); moveSection(index, "down") }}
                                                    disabled={index === formData.sections.length - 1}
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => { e.stopPropagation(); removeSection(section.id) }}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {activeSection === section.id && (
                                        <CardContent className="space-y-4 pt-0">
                                            <div className="space-y-2">
                                                <Label>عنوان القسم</Label>
                                                <Input
                                                    value={section.title}
                                                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                                    placeholder="عنوان هذا القسم"
                                                />
                                            </div>

                                            {section.type === "text-image" ? (
                                                <>
                                                    {/* Section Image */}
                                                    <div className="space-y-2">
                                                        <Label>صورة القسم</Label>
                                                        <div className="flex gap-4 items-start">
                                                            {section.image ? (
                                                                <div className="relative w-40 h-24">
                                                                    <Image
                                                                        src={section.image}
                                                                        alt=""
                                                                        fill
                                                                        className="object-cover rounded"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute -top-2 -right-2 h-6 w-6"
                                                                        onClick={() => updateSection(section.id, { image: "" })}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <label className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed rounded cursor-pointer hover:border-primary/50">
                                                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground mt-1">رفع صورة</span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            if (e.target.files?.[0]) {
                                                                                uploadSectionImage(section.id, e.target.files[0])
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            )}
                                                            <Input
                                                                value={section.image}
                                                                onChange={(e) => updateSection(section.id, { image: e.target.value })}
                                                                placeholder="أو أدخل رابط الصورة"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Section Content */}
                                                    <div className="space-y-2">
                                                        <Label>محتوى القسم</Label>
                                                        <RichTextEditor
                                                            content={section.content}
                                                            onChange={(content) => updateSection(section.id, { content })}
                                                            placeholder="اكتب المحتوى هنا..."
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                /* FAQ Items */
                                                <div className="space-y-4">
                                                    <Label>الأسئلة والأجوبة</Label>
                                                    {section.items.map((item, itemIndex) => (
                                                        <Card key={itemIndex} className="bg-muted/50">
                                                            <CardContent className="p-4 space-y-2">
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        value={item.title}
                                                                        onChange={(e) => updateFaqItem(section.id, itemIndex, { title: e.target.value })}
                                                                        placeholder="السؤال"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeFaqItem(section.id, itemIndex)}
                                                                        disabled={section.items.length === 1}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                <textarea
                                                                    value={item.description}
                                                                    onChange={(e) => updateFaqItem(section.id, itemIndex, { description: e.target.value })}
                                                                    placeholder="الإجابة"
                                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                                />
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => addFaqItem(section.id)}>
                                                        <Plus className="ml-2 h-4 w-4" />
                                                        إضافة سؤال
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>قسم الدعوة للعمل (CTA)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ctaTitle">عنوان CTA</Label>
                            <Input
                                id="ctaTitle"
                                value={formData.cta.title}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    cta: { ...formData.cta, title: e.target.value }
                                })}
                                placeholder="مثال: احصل على عرض سعر مجاني الآن"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ctaDesc">وصف CTA</Label>
                            <textarea
                                id="ctaDesc"
                                value={formData.cta.description}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    cta: { ...formData.cta, description: e.target.value }
                                })}
                                placeholder="وصف مُحفز يشجع العميل على التواصل"
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>فوائد CTA (تظهر كقائمة)</Label>
                            {formData.cta.benefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={benefit}
                                        onChange={(e) => updateCtaBenefit(index, e.target.value)}
                                        placeholder={`الفائدة ${index + 1}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeCtaBenefit(index)}
                                        disabled={formData.cta.benefits.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addCtaBenefit}>
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة فائدة
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/dashboard/services">
                        <Button type="button" variant="outline">
                            إلغاء
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <Save className="ml-2 h-4 w-4" />
                                حفظ الخدمة
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
