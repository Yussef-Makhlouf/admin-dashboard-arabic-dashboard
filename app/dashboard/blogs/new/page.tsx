"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Loader2, Save, Upload, X, Image as ImageIcon, Star, StarOff, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { generateSlug } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { RichTextEditor } from "@/components/editor/rich-text-editor"

export default function NewBlogPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        slug: "",
        title: "",
        excerpt: "",
        content: "",
        image: "",
        category: "",
        tags: [] as string[],
        featured: false,
        status: "draft" as "draft" | "published",
        metaTitle: "",
        metaDescription: "",
        relatedServices: [] as string[],
    })

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        })
    }

    // Image upload handler
    const uploadImage = async (file: File): Promise<string> => {
        const token = localStorage.getItem("token")
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const res = await fetch("https://admin-api-five-pi.vercel.app/api/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: uploadFormData,
        })

        const data = await res.json()
        if (data.success) {
            return `http://localhost:5000${data.data.url}`
        }
        throw new Error("فشل رفع الصورة")
    }

    // Featured image dropzone
    const onImageDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            try {
                const url = await uploadImage(acceptedFiles[0])
                setFormData(prev => ({ ...prev, image: url }))
                toast.success("تم رفع صورة المقال")
            } catch (error) {
                toast.error("فشل رفع الصورة")
            }
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onImageDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        multiple: false
    })

    // Insert image in content
    const insertImageInContent = async (file: File) => {
        try {
            const url = await uploadImage(file)
            const imageMarkdown = `\n\n![صورة](${url})\n\n`
            setFormData(prev => ({
                ...prev,
                content: prev.content + imageMarkdown
            }))
            toast.success("تم إدراج الصورة في المحتوى")
        } catch (error) {
            toast.error("فشل رفع الصورة")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem("token")
            const res = await fetch("https://admin-api-five-pi.vercel.app/api/blogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (data.success) {
                toast.success("تم إنشاء المقال بنجاح")
                router.push("/dashboard/blogs")
            } else {
                throw new Error(data.message)
            }
        } catch (error: any) {
            toast.error(error.message || "فشل إنشاء المقال")
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate reading time
    const wordCount = formData.content.split(/\s+/).filter(w => w).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/blogs">
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">إضافة مقال جديد</h1>
                        <p className="text-muted-foreground mt-1">أضف مقال جديد غني بالمحتوى والصور</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant={formData.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                    >
                        {formData.featured ? <Star className="ml-2 h-4 w-4 fill-current" /> : <StarOff className="ml-2 h-4 w-4" />}
                        {formData.featured ? "مميز" : "تمييز"}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                        حفظ المقال
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>معلومات المقال</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">عنوان المقال *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="عنوان جذاب ومُحسّن لمحركات البحث"
                                    required
                                    className="text-lg font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">الرابط (Slug)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="يتم توليده تلقائياً"
                                    dir="ltr"
                                    className="text-left font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="excerpt">الوصف المختصر *</Label>
                                <textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    placeholder="وصف قصير ومُقنع يظهر في قائمة المقالات ونتائج البحث"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                    maxLength={300}
                                />
                                <p className="text-xs text-muted-foreground">{formData.excerpt.length}/300 حرف</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>محتوى المقال</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {wordCount} كلمة • {readingTime} دقائق للقراءة
                                </p>
                            </div>
                            <label className="cursor-pointer">
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <span>
                                        <ImageIcon className="ml-2 h-4 w-4" />
                                        إدراج صورة
                                    </span>
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            insertImageInContent(e.target.files[0])
                                        }
                                    }}
                                />
                            </label>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(content) => setFormData({ ...formData, content })}
                                    placeholder="اكتب محتوى المقال هنا..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Publishing Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>خيارات النشر</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <span className="font-medium">الحالة</span>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                                    className="bg-transparent border-0 font-medium text-primary"
                                >
                                    <option value="draft">مسودة</option>
                                    <option value="published">منشور</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>صورة المقال الرئيسية</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
                                    }`}
                            >
                                <input {...getInputProps()} />
                                {formData.image ? (
                                    <div className="relative aspect-video">
                                        <Image
                                            src={formData.image}
                                            alt="صورة المقال"
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
                                                setFormData(prev => ({ ...prev, image: "" }))
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-6">
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm">اسحب صورة أو اضغط</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category & Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>التصنيف</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">القسم *</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="مثال: دليل شامل"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">الوسوم</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags.join(", ")}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        tags: e.target.value.split(",").map(t => t.trim()).filter(t => t)
                                    })}
                                    placeholder="عزل حراري, توفير الطاقة..."
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
                                <Label htmlFor="metaTitle">عنوان SEO</Label>
                                <Input
                                    id="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                    placeholder="عنوان نتائج البحث"
                                    maxLength={70}
                                />
                                <p className="text-xs text-muted-foreground">{formData.metaTitle.length}/70</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDesc">وصف SEO</Label>
                                <textarea
                                    id="metaDesc"
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                    placeholder="وصف الصفحة في نتائج البحث"
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    maxLength={160}
                                />
                                <p className="text-xs text-muted-foreground">{formData.metaDescription.length}/160</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Services */}
                    <Card>
                        <CardHeader>
                            <CardTitle>الخدمات المرتبطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                value={formData.relatedServices.join(", ")}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    relatedServices: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                                })}
                                placeholder="/services/foam-insulation, ..."
                                dir="ltr"
                                className="text-left"
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    )
}
