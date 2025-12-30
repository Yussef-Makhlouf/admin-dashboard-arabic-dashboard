"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Plus,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
    X,
    Save
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Category {
    _id: string
    name: string
    slug: string
    type: "service" | "blog"
    isActive: boolean
    order: number
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        type: "blog" as "service" | "blog",
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("https://admin-api-five-pi.vercel.app/api/categories", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            toast.error("فشل تحميل الأقسام")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem("token")
            const url = editingId
                ? `https://admin-api-five-pi.vercel.app/api/categories/${editingId}`
                : "https://admin-api-five-pi.vercel.app/api/categories"

            const res = await fetch(url, {
                method: editingId ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (data.success) {
                toast.success(editingId ? "تم تحديث القسم" : "تم إنشاء القسم")
                fetchCategories()
                resetForm()
            } else {
                throw new Error(data.message)
            }
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ")
        }
    }

    const toggleCategory = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/categories/${id}/toggle`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c))
                toast.success("تم تحديث حالة القسم")
            }
        } catch (error) {
            toast.error("فشل تحديث الحالة")
        }
    }

    const deleteCategory = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/categories/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.filter(c => c._id !== id))
                toast.success("تم حذف القسم")
            }
        } catch (error) {
            toast.error("فشل حذف القسم")
        }
    }

    const startEdit = (category: Category) => {
        setEditingId(category._id)
        setFormData({
            name: category.name,
            slug: category.slug,
            type: category.type,
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({ name: "", slug: "", type: "blog" })
    }

    const filteredCategories = categories.filter(
        c => typeFilter === "all" || c.type === typeFilter
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">الأقسام</h1>
                    <p className="text-muted-foreground mt-1">إدارة أقسام الخدمات والمدونات</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة قسم
                </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {["all", "service", "blog"].map((type) => (
                    <Button
                        key={type}
                        variant={typeFilter === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTypeFilter(type)}
                    >
                        {type === "all" ? "الكل" : type === "service" ? "خدمات" : "مدونات"}
                    </Button>
                ))}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editingId ? "تعديل القسم" : "إضافة قسم جديد"}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={resetForm}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="name">اسم القسم</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="اسم القسم"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">الرابط (Slug)</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="category-slug"
                                        dir="ltr"
                                        className="text-left"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">النوع</Label>
                                    <select
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as "service" | "blog" })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="blog">مدونة</option>
                                        <option value="service">خدمة</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    إلغاء
                                </Button>
                                <Button type="submit">
                                    <Save className="ml-2 h-4 w-4" />
                                    {editingId ? "تحديث" : "إضافة"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Categories List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredCategories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">لا توجد أقسام حالياً</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map((category) => (
                        <Card key={category._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">{category.name}</h3>
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs",
                                                    category.type === "service"
                                                        ? "bg-blue-500/10 text-blue-600"
                                                        : "bg-green-500/10 text-green-600"
                                                )}
                                            >
                                                {category.type === "service" ? "خدمة" : "مدونة"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            /{category.slug}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleCategory(category._id)}
                                        >
                                            {category.isActive ? (
                                                <ToggleRight className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => startEdit(category)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteCategory(category._id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
