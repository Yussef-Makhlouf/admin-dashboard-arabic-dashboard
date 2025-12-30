"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, FileText, FolderOpen, Image, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"

interface Stats {
    services: { total: number; active: number }
    blogs: { total: number; published: number; drafts: number }
    categories: number
    media: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/stats")
            const data = await res.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const statCards = [
        {
            title: "الخدمات",
            value: stats?.services.total || 0,
            subtitle: `${stats?.services.active || 0} نشط`,
            icon: Wrench,
            href: "/dashboard/services",
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "المقالات",
            value: stats?.blogs.total || 0,
            subtitle: `${stats?.blogs.published || 0} منشور`,
            icon: FileText,
            href: "/dashboard/blogs",
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "الأقسام",
            value: stats?.categories || 0,
            subtitle: "قسم",
            icon: FolderOpen,
            href: "/dashboard/categories",
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "الميديا",
            value: stats?.media || 0,
            subtitle: "ملف",
            icon: Image,
            href: "/dashboard/media",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">مرحباً بك 👋</h1>
                <p className="text-muted-foreground mt-2">
                    إليك نظرة عامة على المحتوى في الموقع
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                                ) : (
                                    <>
                                        <div className="text-3xl font-bold">{stat.value}</div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stat.subtitle}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            إجراءات سريعة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            href="/dashboard/services/new"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Wrench className="h-5 w-5 text-blue-500" />
                            <span>إضافة خدمة جديدة</span>
                        </Link>
                        <Link
                            href="/dashboard/blogs/new"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <FileText className="h-5 w-5 text-green-500" />
                            <span>إضافة مقال جديد</span>
                        </Link>
                        <Link
                            href="/dashboard/categories"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <FolderOpen className="h-5 w-5 text-purple-500" />
                            <span>إدارة الأقسام</span>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-primary" />
                            روابط سريعة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a
                            href="http://localhost:3000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Eye className="h-5 w-5 text-primary" />
                            <span>عرض الموقع الرئيسي</span>
                        </a>
                        <a
                            href="http://localhost:3000/services"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Wrench className="h-5 w-5 text-blue-500" />
                            <span>صفحة الخدمات</span>
                        </a>
                        <a
                            href="http://localhost:3000/blog"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <FileText className="h-5 w-5 text-green-500" />
                            <span>صفحة المدونة</span>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
