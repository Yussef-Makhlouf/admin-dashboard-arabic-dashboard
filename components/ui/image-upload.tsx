"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Upload,
    X,
    Copy,
    Check,
    Loader2,
    Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    onRemove?: () => void
    className?: string
    aspectRatio?: "video" | "square" | "wide"
    showUrlInput?: boolean
    label?: string
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    className,
    aspectRatio = "video",
    showUrlInput = true,
    label = "رفع صورة"
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [copied, setCopied] = useState(false)

    const uploadImage = async (file: File): Promise<string> => {
        const token = localStorage.getItem("token")
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("https://admin-api-five-pi.vercel.app/api/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const data = await res.json()
        if (data.success) {
            return data.data.url
        }
        throw new Error(data.message || "فشل رفع الصورة")
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setIsUploading(true)
            try {
                const url = await uploadImage(acceptedFiles[0])
                onChange(url)
                toast.success("تم رفع الصورة")
            } catch (error: any) {
                toast.error(error.message || "فشل رفع الصورة")
            } finally {
                setIsUploading(false)
            }
        }
    }, [onChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
        multiple: false,
        disabled: isUploading
    })

    const copyUrl = () => {
        if (value) {
            navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast.success("تم نسخ الرابط")
        }
    }

    const aspectClass = {
        video: "aspect-video",
        square: "aspect-square",
        wide: "aspect-[21/9]"
    }[aspectRatio]

    return (
        <div className={cn("space-y-2", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    isUploading && "pointer-events-none opacity-70"
                )}
            >
                <input {...getInputProps()} />

                {value ? (
                    <div className={cn("relative", aspectClass)}>
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    copyUrl()
                                }}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            {onRemove && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemove()
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={cn("flex flex-col items-center justify-center p-6", aspectClass)}>
                        {isUploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">{label}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    اسحب الصورة هنا أو اضغط للاختيار
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {showUrlInput && (
                <Input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="أو أدخل رابط الصورة مباشرة"
                    dir="ltr"
                    className="text-left text-sm"
                />
            )}
        </div>
    )
}

// Multi-image gallery upload component
interface GalleryUploadProps {
    images: string[]
    onChange: (images: string[]) => void
    maxImages?: number
}

export function GalleryUpload({ images, onChange, maxImages = 10 }: GalleryUploadProps) {
    const [isUploading, setIsUploading] = useState(false)

    const uploadImage = async (file: File): Promise<string> => {
        const token = localStorage.getItem("token")
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("https://admin-api-five-pi.vercel.app/api/media/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const data = await res.json()
        if (data.success) {
            return data.data.url
        }
        throw new Error("فشل رفع الصورة")
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return

        const filesToUpload = acceptedFiles.slice(0, maxImages - images.length)
        if (filesToUpload.length === 0) {
            toast.error(`الحد الأقصى ${maxImages} صور`)
            return
        }

        setIsUploading(true)
        try {
            const uploadedUrls: string[] = []
            for (const file of filesToUpload) {
                const url = await uploadImage(file)
                uploadedUrls.push(url)
            }
            onChange([...images, ...uploadedUrls])
            toast.success(`تم رفع ${uploadedUrls.length} صورة`)
        } catch (error) {
            toast.error("فشل رفع بعض الصور")
        } finally {
            setIsUploading(false)
        }
    }, [images, maxImages, onChange])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
        multiple: true,
        disabled: isUploading || images.length >= maxImages
    })

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {/* Gallery Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <Card key={index} className="group overflow-hidden">
                            <div className="relative aspect-square">
                                <Image
                                    src={image}
                                    alt={`Image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Zone */}
            {images.length < maxImages && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                        isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50",
                        isUploading && "pointer-events-none opacity-70"
                    )}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm">إضافة صور ({images.length}/{maxImages})</p>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
