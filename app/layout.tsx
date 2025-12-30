import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

const tajawal = Tajawal({
    subsets: ["arabic"],
    weight: ["400", "500", "700", "800"],
    variable: "--font-tajawal",
});

export const metadata: Metadata = {
    title: "لوحة التحكم | شركة طيبة للخدمات",
    description: "لوحة تحكم إدارة المحتوى للخدمات والمدونات",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${tajawal.variable} font-tajawal antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                    <Toaster position="top-center" />
                </ThemeProvider>
            </body>
        </html>
    );
}
