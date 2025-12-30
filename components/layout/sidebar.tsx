"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Wrench,
    FileText,
    FolderOpen,
    Image,
    Settings,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "next-themes"
import { useState } from "react"

const navigation = [
    { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { name: "الخدمات", href: "/dashboard/services", icon: Wrench },
    { name: "المدونات", href: "/dashboard/blogs", icon: FileText },
    { name: "الأسئلة الشائعة", href: "/dashboard/faq", icon: HelpCircle },
    { name: "الأقسام", href: "/dashboard/categories", icon: FolderOpen },
    { name: "الميديا", href: "/dashboard/media", icon: Image },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <>
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 right-4 z-50 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 right-0 z-40 h-screen w-64 bg-card border-l transition-transform duration-300 lg:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6">
                        <h1 className="text-xl font-bold text-primary">لوحة التحكم</h1>
                        <p className="text-sm text-muted-foreground mt-1">شركة طيبة للخدمات</p>
                    </div>

                    <Separator />

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary border-r-4 border-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <Separator />

                    {/* Footer */}
                    <div className="p-4 space-y-2">
                        {/* Theme toggle */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                            {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
                        </Button>

                        {/* User info */}
                        <div className="px-4 py-3 rounded-lg bg-muted">
                            <p className="font-medium text-sm">{user?.name || "مدير النظام"}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>

                        {/* Logout */}
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={logout}
                        >
                            <LogOut className="h-5 w-5" />
                            تسجيل الخروج
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    )
}
