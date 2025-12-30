"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Upload,
    Search,
    Trash2,
    Image as ImageIcon,
    Loader2,
    X,
    Copy,
    Check
} from "lucide-react"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

interface Media {
    _id: string
    filename: string
    originalName: string
    url: string
    mimetype: string
    size: number
    width?: number
    height?: number
    createdAt: string
}

export default function MediaPage() {
    const [media, setMedia] = useState<Media[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("http://localhost:5000/api/media", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setMedia(data.data)
            }
        } catch (error) {
            toast.error("فشل تحميل الميديا")
        } finally {
            setIsLoading(false)
        }
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsUploading(true)

        try {
            const token = localStorage.getItem("token")

            for (const file of acceptedFiles) {
                const formData = new FormData()
                formData.append("file", file)

                const res = await fetch("http://localhost:5000/api/media/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                })

                const data = await res.json()

                if (data.success) {
                    setMedia(prev => [data.data, ...prev])
                } else {
                    throw new Error(data.message)
                }
            }

            toast.success(`تم رفع ${acceptedFiles.length} ملف بنجاح`)
        } catch (error: any) {
            toast.error(error.message || "فشل رفع الملفات")
        } finally {
            setIsUploading(false)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
        },
        multiple: true
    })

    const deleteMedia = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`http://localhost:5000/api/media/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setMedia(media.filter(m => m._id !== id))
                toast.success("تم حذف الصورة")
            }
        } catch (error) {
            toast.error("فشل حذف الصورة")
        }
    }

    const copyUrl = (item: Media) => {
        const url = `http://localhost:5000${item.url}`
        navigator.clipboard.writeText(url)
        setCopiedId(item._id)
        setTimeout(() => setCopiedId(null), 2000)
        toast.success("تم نسخ الرابط")
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const filteredMedia = media.filter(
        m => m.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">مكتبة الميديا</h1>
                <p className="text-muted-foreground mt-1">رفع وإدارة الصور</p>
            </div>

            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
            >
                <input {...getInputProps()} />
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p>جاري الرفع...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="font-medium">اسحب الصور هنا أو اضغط للاختيار</p>
                        <p className="text-sm text-muted-foreground">
                            PNG, JPG, GIF, WebP, SVG (حد أقصى 10MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="بحث في الصور..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Media Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredMedia.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد صور حالياً"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {filteredMedia.map((item) => (
                        <Card key={item._id} className="group overflow-hidden">
                            <div className="relative aspect-square bg-muted">
                                <Image
                                    src={`http://localhost:5000${item.url}`}
                                    alt={item.originalName}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={() => copyUrl(item)}
                                        title="نسخ الرابط"
                                    >
                                        {copiedId === item._id ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => deleteMedia(item._id)}
                                        title="حذف"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-2">
                                <p className="text-xs truncate" title={item.originalName}>
                                    {item.originalName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatSize(item.size)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
