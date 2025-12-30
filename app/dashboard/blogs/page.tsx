"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Star,
    StarOff,
    FileCheck,
    FileClock,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"

interface Blog {
    _id: string
    slug: string
    title: string
    excerpt: string
    category: string
    status: "draft" | "published"
    featured: boolean
    publishedAt: string
    createdAt: string
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    useEffect(() => {
        fetchBlogs()
    }, [])

    const fetchBlogs = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:5000/api/blogs", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setBlogs(data.data)
            }
        } catch (error) {
            console.error("Error fetching blogs:", error)
            toast.error("فشل تحميل المقالات")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFeatured = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`http://localhost:5000/api/blogs/${id}/featured`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setBlogs(blogs.map(b => b._id === id ? { ...b, featured: !b.featured } : b))
                toast.success("تم تحديث حالة المقال")
            }
        } catch (error) {
            toast.error("فشل تحديث الحالة")
        }
    }

    const togglePublish = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`http://localhost:5000/api/blogs/${id}/publish`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setBlogs(blogs.map(b => b._id === id ? { ...b, status: b.status === "published" ? "draft" : "published" } : b))
                toast.success("تم تحديث حالة النشر")
            }
        } catch (error) {
            toast.error("فشل تحديث حالة النشر")
        }
    }

    const deleteBlog = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`http://localhost:5000/api/blogs/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setBlogs(blogs.filter(b => b._id !== id))
                toast.success("تم حذف المقال بنجاح")
            }
        } catch (error) {
            toast.error("فشل حذف المقال")
        }
    }

    const filteredBlogs = blogs.filter(b => {
        const matchesSearch = b.title.includes(searchQuery) || b.excerpt.includes(searchQuery)
        const matchesStatus = statusFilter === "all" || b.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">المدونات</h1>
                    <p className="text-muted-foreground mt-1">إدارة مقالات المدونة</p>
                </div>
                <Link href="/dashboard/blogs/new">
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة مقال
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث في المقالات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "published", "draft"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === "all" ? "الكل" : status === "published" ? "منشور" : "مسودة"}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Blogs List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredBlogs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد مقالات حالياً"}
                        </p>
                        <Link href="/dashboard/blogs/new">
                            <Button variant="outline" className="mt-4">
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة أول مقال
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredBlogs.map((blog) => (
                        <Card key={blog._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg">{blog.title}</h3>
                                            {blog.featured && (
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            )}
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-xs",
                                                    blog.status === "published"
                                                        ? "bg-green-500/10 text-green-600"
                                                        : "bg-yellow-500/10 text-yellow-600"
                                                )}
                                            >
                                                {blog.status === "published" ? "منشور" : "مسودة"}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                                {blog.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                            {blog.excerpt}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {formatDate(blog.publishedAt || blog.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleFeatured(blog._id)}
                                            title={blog.featured ? "إلغاء التمييز" : "تمييز"}
                                        >
                                            {blog.featured ? (
                                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                            ) : (
                                                <StarOff className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => togglePublish(blog._id)}
                                            title={blog.status === "published" ? "إلغاء النشر" : "نشر"}
                                        >
                                            {blog.status === "published" ? (
                                                <FileCheck className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <FileClock className="h-5 w-5 text-yellow-500" />
                                            )}
                                        </Button>
                                        <a
                                            href={`http://localhost:3000/blog/${blog.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="ghost" size="icon" title="عرض">
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </a>
                                        <Link href={`/dashboard/blogs/${blog._id}/edit`}>
                                            <Button variant="ghost" size="icon" title="تعديل">
                                                <Edit className="h-5 w-5" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteBlog(blog._id)}
                                            title="حذف"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-5 w-5" />
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
