"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    ToggleLeft,
    ToggleRight,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Service {
    _id: string
    slug: string
    title: string
    subtitle: string
    isActive: boolean
    order: number
    createdAt: string
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("https://admin-api-five-pi.vercel.app/api/services", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setServices(data.data)
            }
        } catch (error) {
            console.error("Error fetching services:", error)
            toast.error("فشل تحميل الخدمات")
        } finally {
            setIsLoading(false)
        }
    }

    const toggleService = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/services/${id}/toggle`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setServices(services.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s))
                toast.success("تم تحديث حالة الخدمة")
            }
        } catch (error) {
            toast.error("فشل تحديث الحالة")
        }
    }

    const deleteService = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/services/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (data.success) {
                setServices(services.filter(s => s._id !== id))
                toast.success("تم حذف الخدمة بنجاح")
            }
        } catch (error) {
            toast.error("فشل حذف الخدمة")
        }
    }

    const filteredServices = services.filter(
        s => s.title.includes(searchQuery) || s.subtitle.includes(searchQuery)
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">الخدمات</h1>
                    <p className="text-muted-foreground mt-1">إدارة خدمات الموقع</p>
                </div>
                <Link href="/dashboard/services/new">
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة خدمة
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="بحث في الخدمات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Services List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredServices.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد خدمات حالياً"}
                        </p>
                        <Link href="/dashboard/services/new">
                            <Button variant="outline" className="mt-4">
                                <Plus className="ml-2 h-4 w-4" />
                                إضافة أول خدمة
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredServices.map((service) => (
                        <Card key={service._id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold text-lg line-clamp-1" title={service.title}>{service.title}</h3>
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded-full text-xs whitespace-nowrap",
                                                service.isActive
                                                    ? "bg-green-500/10 text-green-600"
                                                    : "bg-red-500/10 text-red-600"
                                            )}
                                        >
                                            {service.isActive ? "نشط" : "معطل"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                        {service.subtitle}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                                    <p className="text-xs text-muted-foreground dir-ltr font-mono">
                                        /services/{service.slug}
                                    </p>
                                    <div className="flex items-center -ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => toggleService(service._id)}
                                            title={service.isActive ? "تعطيل" : "تفعيل"}
                                        >
                                            {service.isActive ? (
                                                <ToggleRight className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5" />
                                            )}
                                        </Button>
                                        <a
                                            href={`http://localhost:3000/services/${service.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="عرض">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </a>
                                        <Link href={`/dashboard/services/${service._id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="تعديل">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteService(service._id)}
                                            title="حذف"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
