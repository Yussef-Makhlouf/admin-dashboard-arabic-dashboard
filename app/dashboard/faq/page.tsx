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
    Save,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    GripVertical
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Question {
    _id: string
    question: string
    answer: string
    order: number
    isActive: boolean
}

interface FAQCategory {
    _id: string
    name: string
    slug: string
    icon: string
    description: string
    questions: Question[]
    order: number
    isActive: boolean
}

export default function FAQPage() {
    const [categories, setCategories] = useState<FAQCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [editingCategory, setEditingCategory] = useState<string | null>(null)
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [showNewQuestion, setShowNewQuestion] = useState<string | null>(null)

    // Form states
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
    const [questionForm, setQuestionForm] = useState({ question: "", answer: "" })
    const [editingQuestion, setEditingQuestion] = useState<{ categoryId: string, questionId: string } | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("https://admin-api-five-pi.vercel.app/api/faq", {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            toast.error("فشل تحميل الأسئلة الشائعة")
        } finally {
            setIsLoading(false)
        }
    }

    // Category CRUD
    const createCategory = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("https://admin-api-five-pi.vercel.app/api/faq", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(categoryForm),
            })
            const data = await res.json()
            if (data.success) {
                setCategories([...categories, data.data])
                setCategoryForm({ name: "", description: "" })
                setShowNewCategory(false)
                toast.success("تم إنشاء القسم")
            }
        } catch (error) {
            toast.error("فشل إنشاء القسم")
        }
    }

    const updateCategory = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(categoryForm),
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === id ? data.data : c))
                setEditingCategory(null)
                setCategoryForm({ name: "", description: "" })
                toast.success("تم تحديث القسم")
            }
        } catch (error) {
            toast.error("فشل تحديث القسم")
        }
    }

    const deleteCategory = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا القسم وجميع أسئلته؟")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${id}`, {
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

    const toggleCategory = async (id: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${id}/toggle`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c))
            }
        } catch (error) {
            toast.error("فشل تحديث الحالة")
        }
    }

    // Question CRUD
    const addQuestion = async (categoryId: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${categoryId}/questions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(questionForm),
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === categoryId ? data.data : c))
                setQuestionForm({ question: "", answer: "" })
                setShowNewQuestion(null)
                toast.success("تم إضافة السؤال")
            }
        } catch (error) {
            toast.error("فشل إضافة السؤال")
        }
    }

    const updateQuestion = async (categoryId: string, questionId: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${categoryId}/questions/${questionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(questionForm),
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === categoryId ? data.data : c))
                setEditingQuestion(null)
                setQuestionForm({ question: "", answer: "" })
                toast.success("تم تحديث السؤال")
            }
        } catch (error) {
            toast.error("فشل تحديث السؤال")
        }
    }

    const deleteQuestion = async (categoryId: string, questionId: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${categoryId}/questions/${questionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === categoryId ? data.data : c))
                toast.success("تم حذف السؤال")
            }
        } catch (error) {
            toast.error("فشل حذف السؤال")
        }
    }

    const toggleQuestion = async (categoryId: string, questionId: string) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`https://admin-api-five-pi.vercel.app/api/faq/${categoryId}/questions/${questionId}/toggle`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setCategories(categories.map(c => c._id === categoryId ? data.data : c))
            }
        } catch (error) {
            toast.error("فشل تحديث الحالة")
        }
    }

    const startEditCategory = (category: FAQCategory) => {
        setEditingCategory(category._id)
        setCategoryForm({ name: category.name, description: category.description })
    }

    const startEditQuestion = (categoryId: string, question: Question) => {
        setEditingQuestion({ categoryId, questionId: question._id })
        setQuestionForm({ question: question.question, answer: question.answer })
    }

    // Count total questions
    const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">الأسئلة الشائعة</h1>
                    <p className="text-muted-foreground mt-1">
                        {categories.length} قسم • {totalQuestions} سؤال
                    </p>
                </div>
                <Button onClick={() => setShowNewCategory(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة قسم
                </Button>
            </div>

            {/* New Category Form */}
            {showNewCategory && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>إضافة قسم جديد</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setShowNewCategory(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>اسم القسم</Label>
                            <Input
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="مثال: أسئلة عن العزل الحراري"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>وصف القسم (اختياري)</Label>
                            <Input
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                placeholder="وصف مختصر"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowNewCategory(false)}>إلغاء</Button>
                            <Button onClick={createCategory}>
                                <Save className="ml-2 h-4 w-4" />
                                حفظ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Categories List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : categories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد أقسام أسئلة شائعة</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {categories.map((category) => (
                        <Card key={category._id} className={cn(!category.isActive && "opacity-60")}>
                            <CardHeader
                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => setExpandedCategory(expandedCategory === category._id ? null : category._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <HelpCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{category.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {category.questions.length} سؤال
                                                {!category.isActive && " • معطل"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" onClick={() => toggleCategory(category._id)}>
                                            {category.isActive ? (
                                                <ToggleRight className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => startEditCategory(category)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteCategory(category._id)} className="text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {expandedCategory === category._id ? (
                                            <ChevronUp className="h-5 w-5" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Edit Category Form */}
                            {editingCategory === category._id && (
                                <CardContent className="border-t space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>اسم القسم</Label>
                                        <Input
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setEditingCategory(null)}>إلغاء</Button>
                                        <Button onClick={() => updateCategory(category._id)}>
                                            <Save className="ml-2 h-4 w-4" />
                                            حفظ
                                        </Button>
                                    </div>
                                </CardContent>
                            )}

                            {/* Questions List */}
                            {expandedCategory === category._id && (
                                <CardContent className="border-t space-y-4 pt-4">
                                    {/* Add Question Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => setShowNewQuestion(category._id)}
                                    >
                                        <Plus className="ml-2 h-4 w-4" />
                                        إضافة سؤال
                                    </Button>

                                    {/* New Question Form */}
                                    {showNewQuestion === category._id && (
                                        <Card className="bg-muted/50">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="space-y-2">
                                                    <Label>السؤال</Label>
                                                    <Input
                                                        value={questionForm.question}
                                                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                                        placeholder="اكتب السؤال هنا"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>الإجابة</Label>
                                                    <textarea
                                                        value={questionForm.answer}
                                                        onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                                                        placeholder="اكتب الإجابة التفصيلية هنا"
                                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        setShowNewQuestion(null)
                                                        setQuestionForm({ question: "", answer: "" })
                                                    }}>إلغاء</Button>
                                                    <Button size="sm" onClick={() => addQuestion(category._id)}>
                                                        <Save className="ml-2 h-4 w-4" />
                                                        إضافة
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Questions */}
                                    {category.questions.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">لا توجد أسئلة في هذا القسم</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {category.questions.map((question) => (
                                                <Card
                                                    key={question._id}
                                                    className={cn("bg-card", !question.isActive && "opacity-60")}
                                                >
                                                    {editingQuestion?.questionId === question._id ? (
                                                        <CardContent className="p-4 space-y-3">
                                                            <div className="space-y-2">
                                                                <Label>السؤال</Label>
                                                                <Input
                                                                    value={questionForm.question}
                                                                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>الإجابة</Label>
                                                                <textarea
                                                                    value={questionForm.answer}
                                                                    onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                                                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => setEditingQuestion(null)}>
                                                                    إلغاء
                                                                </Button>
                                                                <Button size="sm" onClick={() => updateQuestion(category._id, question._id)}>
                                                                    <Save className="ml-2 h-4 w-4" />
                                                                    حفظ
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    ) : (
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium">{question.question}</h4>
                                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                        {question.answer}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => toggleQuestion(category._id, question._id)}
                                                                    >
                                                                        {question.isActive ? (
                                                                            <ToggleRight className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => startEditQuestion(category._id, question)}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => deleteQuestion(category._id, question._id)}
                                                                        className="text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    )}
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
