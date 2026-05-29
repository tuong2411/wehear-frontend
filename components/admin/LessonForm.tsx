"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileQuestion,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { lessonService } from "@/services/lessonService";
import { dictionaryService } from "@/services/dictionaryService";
import type { SignDictionary } from "@/types/dictionary";
import type { Lesson, LessonLevel, LessonRegion, LessonRequest, LessonStatus, Quiz, QuizQuestion } from "@/types/lesson";

interface LessonFormProps {
  initialData?: Lesson;
  isEdit?: boolean;
}

const optionFields = ["optionA", "optionB", "optionC", "optionD"] as const;

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function LessonForm({ initialData, isEdit = false }: LessonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "vocabulary" | "quiz">("content");
  const [formData, setFormData] = useState<Partial<LessonRequest>>({
    title: "",
    slug: "",
    description: "",
    level: "BASIC",
    region: "TOAN_QUOC",
    status: "PUBLISHED",
    isFeatured: false,
    topicId: 1,
    coverImage: "",
  });

  const [selectedSigns, setSelectedSigns] = useState<SignDictionary[]>([]);
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    timeLimitMinutes: 15,
    passingScore: 70,
    questions: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [allSigns, setAllSigns] = useState<SignDictionary[]>([]);
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchingSigns, setSearchingSigns] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [suggestingSigns, setSuggestingSigns] = useState(false);

  useEffect(() => {
    fetchSigns("", 0, true);
    if (!initialData) return;

    setFormData({
      id: initialData.id,
      title: initialData.title || "",
      slug: initialData.slug || "",
      description: initialData.description || "",
      level: initialData.level || "BASIC",
      region: initialData.region || "TOAN_QUOC",
      status: initialData.status || "PUBLISHED",
      isFeatured: !!initialData.isFeatured,
      topicId: initialData.topicId || 1,
      coverImage: initialData.coverImage || "",
    });

    if (initialData.signs) setSelectedSigns(initialData.signs);
    if (initialData.quiz) {
      setQuiz({
        ...initialData.quiz,
        title: initialData.quiz.title || "",
        description: initialData.quiz.description || "",
        timeLimitMinutes: initialData.quiz.timeLimitMinutes || 15,
        passingScore: initialData.quiz.passingScore || 70,
        questions: (initialData.quiz.questions || []).map((q: Partial<QuizQuestion>) => ({
          ...q,
          questionText: q.questionText || "",
          questionType: q.questionType || "MULTIPLE_CHOICE",
          optionA: q.optionA || "",
          optionB: q.optionB || "",
          optionC: q.optionC || "",
          optionD: q.optionD || "",
          correctAnswer: q.correctAnswer || "",
        })),
      });
    }
  }, [initialData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSigns(searchTerm, 0, true);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchSigns = async (search: string, pageNum: number, isNewSearch: boolean) => {
    setSearchingSigns(true);
    try {
      const size = 30;
      const response = await dictionaryService.getAllSigns(pageNum, size, search, "all");
      const items = response.items || [];

      setAllSigns((prev) => (isNewSearch ? items : [...prev, ...items]));
      setTotalItems(response.totalItems || 0);
      setPage(pageNum);
      setHasMore(items.length === size && (pageNum + 1) * size < response.totalItems);
    } catch (error) {
      console.error("Failed to load signs", error);
    } finally {
      setSearchingSigns(false);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    baseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const availableSigns = useMemo(
    () => allSigns.filter((sign) => !selectedSigns.find((selected) => selected.id === sign.id)),
    [allSigns, selectedSigns],
  );

  const completion = useMemo(() => {
    const fields = [
      Boolean(formData.title),
      Boolean(formData.slug),
      Boolean(formData.description),
      selectedSigns.length > 0,
      quiz.questions.length > 0,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [formData.description, formData.slug, formData.title, quiz.questions.length, selectedSigns.length]);

  const addSign = (sign: SignDictionary) => {
    if (!selectedSigns.find((item) => item.id === sign.id)) {
      setSelectedSigns([...selectedSigns, sign]);
    }
  };

  const removeSign = (id: number) => {
    setSelectedSigns(selectedSigns.filter((sign) => sign.id !== id));
  };

  const moveSign = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedSigns.length) return;

    const next = [...selectedSigns];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setSelectedSigns(next);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await lessonService.uploadLessonCover(file);
      setFormData({ ...formData, coverImage: url });
      toast.success("Tải ảnh bìa thành công");
    } catch {
      toast.error("Lỗi khi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (selectedSigns.length < 2) {
      toast.error("Vui lòng chọn ít nhất 2 từ vựng để AI tạo câu hỏi");
      return;
    }

    setGeneratingQuiz(true);
    try {
      const signWords = selectedSigns.map((sign) => sign.signWord);
      const aiQuestions = await lessonService.generateAIQuiz(signWords);
      setQuiz((prev) => ({ ...prev, questions: [...prev.questions, ...aiQuestions] }));
      toast.success(`Đã tạo ${aiQuestions.length} câu hỏi gợi ý`);
    } catch {
      toast.error("Lỗi khi gọi AI");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSuggestSigns = async () => {
    if (!formData.title) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }

    setSuggestingSigns(true);
    try {
      const suggested = await lessonService.suggestLessonSigns(formData.title, formData.description || "");
      const newSigns = suggested.filter((sign) => !selectedSigns.find((selected) => selected.id === sign.id));

      if (newSigns.length > 0) {
        setSelectedSigns([...selectedSigns, ...newSigns]);
        toast.success(`Đã thêm ${newSigns.length} từ vựng gợi ý`);
      } else {
        toast.success("Tất cả từ vựng gợi ý đã có trong bài học");
      }
    } catch {
      toast.error("Lỗi gợi ý AI");
    } finally {
      setSuggestingSigns(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      questionText: "Ký hiệu này có nghĩa là gì?",
      questionType: "MULTIPLE_CHOICE",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "",
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const removeQuestion = (index: number) => {
    const nextQuestions = [...quiz.questions];
    nextQuestions.splice(index, 1);
    setQuiz({ ...quiz, questions: nextQuestions });
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: string | number | undefined) => {
    const nextQuestions = [...quiz.questions];
    nextQuestions[index] = { ...nextQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: nextQuestions });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Vui lòng điền đủ tiêu đề và slug");
      return;
    }

    setLoading(true);
    try {
      const request = {
        ...formData,
        signIds: selectedSigns.map((sign) => sign.id),
        quiz:
          quiz.questions.length > 0
            ? {
                ...quiz,
                title: quiz.title || `Kiểm tra: ${formData.title}`,
                description: quiz.description || `Bài kiểm tra kiến thức cho bài học ${formData.title}`,
              }
            : undefined,
      } as LessonRequest & { quiz?: Quiz };

      if (isEdit && formData.id) await lessonService.updateLesson(formData.id, request);
      else await lessonService.createLesson(request);

      toast.success(isEdit ? "Cập nhật thành công" : "Tạo bài học thành công");
      router.push("/admin/lessons");
    } catch {
      toast.error("Lỗi khi lưu bài học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                title="Quay lại"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700">{isEdit ? "Chỉnh sửa" : "Tạo mới"}</p>
                <h1 className="truncate text-2xl font-black tracking-tight text-slate-950">{formData.title || "Bài học chưa đặt tên"}</h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-48">
                <div className="mb-1 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Hoàn thiện</span>
                  <span>{completion}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isEdit ? "Cập nhật" : "Lưu bài học"}
              </button>
            </div>
          </div>

          <nav className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-3">
            {[
              { id: "content", label: "Thông tin", icon: BookOpen, count: formData.status || "DRAFT" },
              { id: "vocabulary", label: "Từ vựng", icon: Layers, count: selectedSigns.length },
              { id: "quiz", label: "Quiz", icon: FileQuestion, count: quiz.questions.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex h-12 items-center justify-between rounded-lg border px-4 text-sm font-black transition ${
                    active ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={17} />
                    {tab.label}
                  </span>
                  <span className={`rounded-md px-2 py-1 text-xs ${active ? "bg-white text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </header>

        {activeTab === "content" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-700" />
                  <h2 className="text-lg font-black text-slate-950">Thông tin bài học</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Tiêu đề</span>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="VD: Chào hỏi cơ bản"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Slug</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                        className="h-12 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        placeholder="chao-hoi-co-ban"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, slug: slugify(formData.title || "") })}
                        className="h-12 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-100"
                      >
                        Tạo
                      </button>
                    </div>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Cấp độ</span>
                    <div className="relative">
                      <select
                        value={formData.level}
                        onChange={(event) => setFormData({ ...formData, level: event.target.value as LessonLevel })}
                        className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="BASIC">Cơ bản</option>
                        <option value="INTERMEDIATE">Trung bình</option>
                        <option value="ADVANCED">Nâng cao</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </label>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Mô tả</span>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      placeholder="Mô tả ngắn nội dung bài học"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <ImageIcon size={20} className="text-emerald-700" />
                  <h2 className="text-lg font-black text-slate-950">Ảnh bìa</h2>
                </div>

                <div className="relative aspect-video overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-100">
                  {formData.coverImage ? (
                    <>
                      <img src={getFullUrl(formData.coverImage)} alt="Ảnh bìa bài học" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: "" })}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm transition hover:bg-rose-50"
                        title="Xóa ảnh"
                      >
                        <Trash2 size={17} />
                      </button>
                    </>
                  ) : (
                    <label className="flex h-full cursor-pointer flex-col items-center justify-center text-center">
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                        {uploading ? <Loader2 className="animate-spin" size={22} /> : <Upload size={22} />}
                      </span>
                      <span className="text-sm font-black text-slate-600">Tải ảnh bìa</span>
                      <span className="mt-1 text-xs font-semibold text-slate-400">Tỉ lệ 16:9</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-700" />
                  <h2 className="text-lg font-black text-slate-950">Phát hành</h2>
                </div>

                <div className="space-y-4">
                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Vùng miền</span>
                    <select
                      value={formData.region}
                      onChange={(event) => setFormData({ ...formData, region: event.target.value as LessonRegion })}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="TOAN_QUOC">Toàn quốc</option>
                      <option value="MIEN_BAC">Miền Bắc</option>
                      <option value="MIEN_TRUNG">Miền Trung</option>
                      <option value="MIEN_NAM">Miền Nam</option>
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Trạng thái</span>
                    <select
                      value={formData.status}
                      onChange={(event) => setFormData({ ...formData, status: event.target.value as LessonStatus })}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="PUBLISHED">Công khai</option>
                      <option value="DRAFT">Bản nháp</option>
                      <option value="SCHEDULED">Đã lên lịch</option>
                      <option value="UNPUBLISHED">Tạm ẩn</option>
                      <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    className={`flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm font-black transition ${
                      formData.isFeatured
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Star size={17} className={formData.isFeatured ? "fill-amber-500 text-amber-500" : ""} />
                      Nổi bật
                    </span>
                    <span className={`h-5 w-9 rounded-full p-0.5 ${formData.isFeatured ? "bg-amber-500" : "bg-slate-300"}`}>
                      <span className={`block h-4 w-4 rounded-full bg-white transition ${formData.isFeatured ? "translate-x-4" : ""}`} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-black text-slate-950">Tóm tắt</h2>
                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">Từ vựng</dt>
                    <dd className="mt-1 text-2xl font-black text-slate-950">{selectedSigns.length}</dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">Câu hỏi</dt>
                    <dd className="mt-1 text-2xl font-black text-slate-950">{quiz.questions.length}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </section>
        )}

        {activeTab === "vocabulary" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Từ vựng trong bài học</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{selectedSigns.length} mục đã chọn</p>
                </div>
                <button
                  type="button"
                  onClick={handleSuggestSigns}
                  disabled={suggestingSigns}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                >
                  {suggestingSigns ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />}
                  Gợi ý AI
                </button>
              </div>

              <div className="divide-y divide-slate-100 p-2">
                {selectedSigns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <Layers size={44} />
                    <p className="mt-3 text-sm font-black">Chưa có từ vựng nào được chọn</p>
                  </div>
                ) : (
                  selectedSigns.map((sign, index) => (
                    <div key={sign.id} className="grid gap-3 rounded-lg p-3 transition hover:bg-slate-50 md:grid-cols-[auto_1fr_auto] md:items-center">
                      <div className="flex items-center gap-3">
                        <GripVertical size={18} className="text-slate-300" />
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-slate-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">{sign.signWord}</p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500">{sign.description || sign.exampleSentence || sign.region}</p>
                      </div>
                      <div className="flex items-center gap-2 md:justify-end">
                        <button
                          type="button"
                          onClick={() => moveSign(index, -1)}
                          disabled={index === 0}
                          className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          Lên
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSign(index, 1)}
                          disabled={index === selectedSigns.length - 1}
                          className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          Xuống
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSign(sign.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          title="Xóa từ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:self-start">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-lg font-black text-slate-950">Kho từ vựng</h2>
                <label className="relative mt-4 block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    type="text"
                    placeholder="Tìm từ vựng"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <p className="mt-3 text-xs font-bold text-slate-400">{searchingSigns ? "Đang tải..." : `${totalItems} kết quả`}</p>
              </div>

              <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
                {availableSigns.map((sign) => (
                  <div key={sign.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{sign.signWord}</p>
                      <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-slate-400">{sign.region}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addSign(sign)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm transition hover:bg-blue-700 hover:text-white"
                      title="Thêm từ"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}

                {searchingSigns && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-blue-700" size={28} />
                  </div>
                )}

                {hasMore && !searchingSigns && (
                  <button
                    type="button"
                    onClick={() => fetchSigns(searchTerm, page + 1, false)}
                    className="h-10 w-full rounded-lg border border-blue-100 bg-blue-50 text-sm font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    Hiển thị thêm
                  </button>
                )}

                {searchTerm && availableSigns.length === 0 && !searchingSigns && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <AlertCircle size={34} />
                    <p className="mt-2 text-sm font-bold">Không tìm thấy từ vựng</p>
                  </div>
                )}
              </div>
            </aside>
          </section>
        )}

        {activeTab === "quiz" && (
          <section className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Bài kiểm tra</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{quiz.questions.length} câu hỏi được lưu cùng bài học</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleGenerateAIQuiz}
                    disabled={generatingQuiz || selectedSigns.length < 2}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {generatingQuiz ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />}
                    AI tạo câu hỏi
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    <Plus size={17} />
                    Thêm câu hỏi
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <label>
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Clock size={15} /> Thời gian
                  </span>
                  <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={quiz.timeLimitMinutes}
                      onChange={(event) => setQuiz({ ...quiz, timeLimitMinutes: parseInt(event.target.value) })}
                      className="min-w-0 flex-1 accent-blue-700"
                    />
                    <span className="w-16 text-right text-sm font-black text-blue-700">{quiz.timeLimitMinutes}p</span>
                  </div>
                </label>

                <label>
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <CheckCircle size={15} /> Điểm đạt
                  </span>
                  <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={quiz.passingScore}
                      onChange={(event) => setQuiz({ ...quiz, passingScore: parseInt(event.target.value) })}
                      className="min-w-0 flex-1 accent-emerald-600"
                    />
                    <span className="w-16 text-right text-sm font-black text-emerald-700">{quiz.passingScore}%</span>
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Tiêu đề quiz</span>
                  <input
                    type="text"
                    value={quiz.title}
                    onChange={(event) => setQuiz({ ...quiz, title: event.target.value })}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    placeholder={`Kiểm tra: ${formData.title || "bài học"}`}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
                  <HelpCircle size={48} className="mx-auto" />
                  <p className="mt-3 text-sm font-black">Chưa có câu hỏi nào</p>
                </div>
              ) : (
                quiz.questions.map((question, questionIndex) => (
                  <article key={questionIndex} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">
                          {questionIndex + 1}
                        </span>
                        <h3 className="text-base font-black text-slate-950">Câu hỏi {questionIndex + 1}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        title="Xóa câu hỏi"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                      <div className="space-y-4">
                        <label>
                          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Nội dung câu hỏi</span>
                          <textarea
                            value={question.questionText}
                            onChange={(event) => updateQuestion(questionIndex, "questionText", event.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />
                        </label>

                        <div className="grid gap-3 md:grid-cols-2">
                          {optionFields.map((field, index) => {
                            const value = question[field] || "";
                            const isCorrect = question.correctAnswer === value && value !== "";
                            return (
                              <label key={field} className="relative">
                                <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                                  Đáp án {String.fromCharCode(65 + index)}
                                </span>
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(event) => updateQuestion(questionIndex, field, event.target.value)}
                                  className={`h-12 w-full rounded-lg border px-4 pr-12 text-sm font-bold outline-none transition focus:ring-4 ${
                                    isCorrect
                                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-500/10"
                                      : "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500/10"
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => updateQuestion(questionIndex, "correctAnswer", value)}
                                  disabled={!value}
                                  className={`absolute bottom-1.5 right-1.5 flex h-9 w-9 items-center justify-center rounded-md transition disabled:opacity-40 ${
                                    isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                                  }`}
                                  title="Đặt làm đáp án đúng"
                                >
                                  <CheckCircle2 size={17} />
                                </button>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <label>
                          <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Video liên quan</span>
                          <select
                            value={question.relatedSignId || ""}
                            onChange={(event) => updateQuestion(questionIndex, "relatedSignId", event.target.value ? Number(event.target.value) : undefined)}
                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          >
                            <option value="">Chọn từ vựng</option>
                            {selectedSigns.map((sign) => (
                              <option key={sign.id} value={sign.id}>
                                {sign.signWord} ({sign.region})
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs font-bold leading-5 text-blue-800">
                          Câu hỏi này đang dùng đáp án đúng: {question.correctAnswer || "Chưa chọn"}
                        </div>
                      </aside>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </form>
  );
}
