"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, ArrowLeft, Plus, Trash2, Search, 
  LayoutGrid, Globe, Layers, CheckCircle2, X,
  HelpCircle, AlertCircle, Upload, Image as ImageIcon, Loader2,
  Sparkles, Star, GripVertical, Clock, CheckCircle
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { lessonService } from "@/services/lessonService";
import { dictionaryService } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import { LessonLevel, LessonRegion, LessonStatus, LessonRequest, Quiz, QuizQuestion } from "@/types/lesson";
import toast from "react-hot-toast";

interface LessonFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function LessonForm({ initialData, isEdit = false }: LessonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');
  
  const [formData, setFormData] = useState<Partial<LessonRequest>>({
    title: "",
    slug: "",
    description: "",
    level: 'BASIC',
    region: 'TOAN_QUOC',
    status: 'PUBLISHED',
    isFeatured: false,
    topicId: 1,
    coverImage: ""
  });

  const [selectedSigns, setSelectedSigns] = useState<SignDictionary[]>([]);
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    timeLimitMinutes: 15,
    passingScore: 70,
    questions: []
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
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        level: initialData.level || 'BASIC',
        region: initialData.region || 'TOAN_QUOC',
        status: initialData.status || 'PUBLISHED',
        isFeatured: !!initialData.isFeatured,
        topicId: initialData.topicId || 1,
        coverImage: initialData.coverImage || ""
      });
      if (initialData.signs) setSelectedSigns(initialData.signs);
      if (initialData.quiz) {
        setQuiz({
          ...initialData.quiz,
          title: initialData.quiz.title || "",
          description: initialData.quiz.description || "",
          timeLimitMinutes: initialData.quiz.timeLimitMinutes || 15,
          passingScore: initialData.quiz.passingScore || 70,
          questions: (initialData.quiz.questions || []).map((q: any) => ({
            ...q,
            questionText: q.questionText || "",
            optionA: q.optionA || "",
            optionB: q.optionB || "",
            optionC: q.optionC || "",
            optionD: q.optionD || "",
            correctAnswer: q.correctAnswer || ""
          }))
        });
      }
    }
  }, [initialData]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSigns(searchTerm, 0, true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchSigns = async (search: string, pageNum: number, isNewSearch: boolean) => {
    setSearchingSigns(true);
    try {
      const size = 30;
      const response = await dictionaryService.getAllSigns(pageNum, size, search, "all");
      if (isNewSearch) setAllSigns(response.items || []);
      else setAllSigns(prev => [...prev, ...(response.items || [])]);
      setTotalItems(response.totalItems || 0);
      setPage(pageNum);
      setHasMore((response.items || []).length === size && (pageNum + 1) * size < response.totalItems);
    } catch (error) {
      console.error("Failed to load signs", error);
    } finally {
      setSearchingSigns(false);
    }
  };

  const loadMoreSigns = () => {
    if (!searchingSigns && hasMore) fetchSigns(searchTerm, page + 1, false);
  };

  const addSign = (sign: SignDictionary) => {
    if (!selectedSigns.find(s => s.id === sign.id)) {
      setSelectedSigns([...selectedSigns, sign]);
    }
  };

  const removeSign = (id: number) => {
    setSelectedSigns(selectedSigns.filter(s => s.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await lessonService.uploadLessonCover(file);
      setFormData({ ...formData, coverImage: url });
      toast.success("Tải ảnh bìa thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh");
    } finally {
      setUploading(false);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    baseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleGenerateAIQuiz = async () => {
    if (selectedSigns.length < 2) {
      toast.error("Vui lòng chọn ít nhất 2 từ vựng để AI tạo câu hỏi!");
      return;
    }
    setGeneratingQuiz(true);
    try {
      const signWords = selectedSigns.map(s => s.signWord);
      const aiQuestions = await lessonService.generateAIQuiz(signWords);
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, ...aiQuestions]
      }));
      toast.success(`Đã tạo thành công ${aiQuestions.length} câu hỏi gợi ý!`);
    } catch (error) {
      toast.error("Lỗi khi gọi AI");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSuggestSigns = async () => {
    if (!formData.title) {
      toast.error("Vui lòng nhập tiêu đề bài học!");
      return;
    }
    setSuggestingSigns(true);
    try {
      const suggested = await lessonService.suggestLessonSigns(formData.title, formData.description || "");
      const newSigns = suggested.filter(ss => !selectedSigns.find(s => s.id === ss.id));
      if (newSigns.length > 0) {
        setSelectedSigns([...selectedSigns, ...newSigns]);
        toast.success(`Đã thêm ${newSigns.length} từ vựng gợi ý!`);
      } else {
        toast.success("Tất cả từ vựng gợi ý đã có trong bài học.");
      }
    } catch (error) {
      toast.error("Lỗi gợi ý AI");
    } finally {
      setSuggestingSigns(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      questionText: "Ký hiệu này có nghĩa là gì?",
      questionType: "MULTIPLE_CHOICE",
      optionA: "", optionB: "", optionC: "", optionD: "",
      correctAnswer: ""
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...quiz.questions];
    newQuestions.splice(index, 1);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      toast.error("Vui lòng điền đủ thông tin tiêu đề và slug!");
      return;
    }

    setLoading(true);
    try {
      const request: LessonRequest = {
        ...formData,
        signIds: selectedSigns.map(s => s.id),
        quiz: quiz.questions.length > 0 ? {
          ...quiz,
          title: quiz.title || `Kiểm tra: ${formData.title}`,
          description: quiz.description || `Bài kiểm tra kiến thức cho bài học ${formData.title}`
        } : undefined
      } as LessonRequest;

      if (isEdit && formData.id) await lessonService.updateLesson(formData.id, request);
      else await lessonService.createLesson(request);
      
      toast.success(isEdit ? "Cập nhật thành công!" : "Tạo bài học thành công!");
      router.push("/admin/lessons");
    } catch (error) {
      toast.error("Lỗi khi lưu bài học");
    } finally {
      setLoading(false);
    }
  };

  const availableSigns = allSigns.filter(s => !selectedSigns.find(selected => selected.id === s.id));

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isEdit ? "Chỉnh sửa bài học" : "Tạo bài học mới"}</h1>
              <p className="text-sm text-slate-500 font-medium">{formData.title || "Chưa đặt tiêu đề"}</p>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isEdit ? "Cập nhật bài học" : "Lưu bài học"}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-8 w-fit backdrop-blur-sm border border-white/50">
          <button onClick={() => setActiveTab('content')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'content' ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
            <LayoutGrid size={18} /> Nội dung & Từ vựng
          </button>
          <button onClick={() => setActiveTab('quiz')} className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'quiz' ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
            <HelpCircle size={18} /> Bài kiểm tra (Quiz)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {activeTab === 'content' ? (
            <>
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-3 text-blue-600 pb-4 border-b border-slate-50">
                    <LayoutGrid size={24} />
                    <h2 className="text-xl font-black text-slate-900">Thông tin bài học</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tiêu đề bài học</label>
                          <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-lg focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                            placeholder="VD: Chào hỏi cơ bản..."
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Cấp độ</label>
                          <select 
                            value={formData.level} 
                            onChange={(e) => setFormData({...formData, level: e.target.value as LessonLevel})}
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none"
                          >
                            <option value="BASIC">Cơ bản</option>
                            <option value="INTERMEDIATE">Trung bình</option>
                            <option value="ADVANCED">Nâng cao</option>
                          </select>
                       </div>
                       <div className="flex flex-col justify-end">
                          <button 
                            onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                            className={`flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all border ${formData.isFeatured ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-transparent text-slate-500'}`}
                          >
                            <div className="flex items-center gap-2"><Star size={18} className={formData.isFeatured ? 'fill-amber-500 text-amber-500' : ''} /> Nổi bật</div>
                            <div className={`w-10 h-5 rounded-full relative ${formData.isFeatured ? 'bg-amber-500' : 'bg-slate-300'}`}>
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isFeatured ? 'right-1' : 'left-1'}`} />
                            </div>
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Ảnh bìa (16:9)</label>
                          <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all">
                             {formData.coverImage ? (
                               <>
                                 <img src={getFullUrl(formData.coverImage)} className="w-full h-full object-cover" alt="Cover" />
                                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => setFormData({...formData, coverImage: ""})} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all"><Trash2 size={20}/></button>
                                 </div>
                               </>
                             ) : (
                               <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
                                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-300 mb-3 group-hover:text-blue-500 transition-colors">
                                    <Upload size={28} />
                                  </div>
                                  <p className="text-sm font-bold text-slate-400">Tải ảnh lên hoặc kéo thả</p>
                               </label>
                             )}
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Mô tả tóm tắt</label>
                          <textarea 
                            rows={6} 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 font-medium text-slate-600 outline-none resize-none flex-1 h-[calc(100%-28px)]"
                            placeholder="Vài dòng giới thiệu ngắn gọn cho bài học này..."
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-3 text-orange-500">
                      <Layers size={24} />
                      <h2 className="text-xl font-black text-slate-900">Từ vựng đã chọn ({selectedSigns.length})</h2>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Kéo thả để sắp xếp</span>
                  </div>

                  <Reorder.Group axis="y" values={selectedSigns} onReorder={setSelectedSigns} className="space-y-3">
                    <AnimatePresence>
                      {selectedSigns.map((sign, index) => (
                        <Reorder.Item key={sign.id} value={sign} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                          <div className="group flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-grab active:cursor-grabbing">
                            <GripVertical size={20} className="text-slate-300" />
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 shadow-sm text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-slate-800 text-lg">{sign.signWord}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-wider">{sign.region}</span>
                                 <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-wider">{sign.difficultyLevel}</span>
                              </div>
                            </div>
                            <button onClick={() => removeSign(sign.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>

                  {selectedSigns.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                      <Layers size={64} className="mx-auto text-slate-200 mb-4 opacity-50" />
                      <p className="font-bold text-slate-400 text-lg">Chưa có từ vựng nào được chọn</p>
                      <p className="text-sm text-slate-300">Hãy sử dụng thanh tìm kiếm bên phải để thêm từ</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 text-emerald-500 font-black border-b border-slate-50 pb-4">
                    <Globe size={20} />
                    <h3 className="text-slate-900 tracking-tight">Cấu hình hiển thị</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Vùng miền áp dụng</label>
                      <select 
                        value={formData.region} 
                        onChange={(e) => setFormData({...formData, region: e.target.value as LessonRegion})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none"
                      >
                        <option value="TOAN_QUOC">Toàn quốc (Global)</option>
                        <option value="MIEN_BAC">Miền Bắc</option>
                        <option value="MIEN_TRUNG">Miền Trung</option>
                        <option value="MIEN_NAM">Miền Nam</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Trạng thái phát hành</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value as LessonStatus})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none"
                      >
                        <option value="PUBLISHED">Công khai (Live)</option>
                        <option value="DRAFT">Bản nháp (Draft)</option>
                        <option value="ARCHIVED">Lưu trữ (Archived)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6 sticky top-8">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-3 text-blue-500 font-black">
                      <Search size={20} />
                      <h3 className="text-slate-900 tracking-tight">Tìm & Thêm từ</h3>
                    </div>
                    <button 
                      onClick={() => handleSuggestSigns()}
                      disabled={suggestingSigns}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
                      title="AI Gợi ý từ vựng"
                    >
                      {suggestingSigns ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Gõ để tìm kiếm..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between px-1 mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         {searchingSigns ? 'Đang tải...' : `Kết quả: ${totalItems} từ`}
                      </span>
                    </div>

                    {availableSigns.map(sign => (
                      <div key={sign.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 rounded-[20px] border border-transparent hover:border-blue-100 transition-all mb-1">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm">{sign.signWord}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{sign.region}</p>
                        </div>
                        <button 
                          onClick={() => addSign(sign)}
                          className="w-10 h-10 rounded-xl bg-white text-blue-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-95 border border-slate-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    ))}

                    {searchingSigns && (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                    )}

                    {hasMore && !searchingSigns && (
                      <button onClick={loadMoreSigns} className="w-full py-4 mt-4 text-xs font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 rounded-2xl transition-all shadow-sm border border-blue-100">
                        Hiển thị thêm kết quả
                      </button>
                    )}

                    {!hasMore && allSigns.length > 0 && !searchingSigns && (
                      <p className="text-center py-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Đã hiển thị tất cả từ vựng</p>
                    )}

                    {searchTerm && availableSigns.length === 0 && !searchingSigns && (
                      <div className="text-center py-16">
                        <AlertCircle className="mx-auto text-slate-200 mb-3" size={48} />
                        <p className="text-sm font-bold text-slate-400">Không tìm thấy từ vựng nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-12 space-y-8 animate-in fade-in duration-500">
               <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-50">
                    <div className="flex items-center gap-4 text-purple-600">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center shadow-sm"><HelpCircle size={32} /></div>
                        <div>
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight">Thiết kế bài kiểm tra</h2>
                           <p className="text-sm font-medium text-slate-400">Đánh giá khả năng ghi nhớ của học viên qua các câu hỏi trắc nghiệm.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={handleGenerateAIQuiz}
                        disabled={generatingQuiz || selectedSigns.length < 2}
                        className="bg-purple-50 text-purple-600 px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-purple-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
                      >
                        {generatingQuiz ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20} />} AI Gợi ý câu hỏi
                      </button>
                      <button onClick={addQuestion} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <Plus size={20} /> Thêm thủ công
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50 p-10 rounded-[32px] border border-slate-100">
                     <div className="md:col-span-1 space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 font-black text-sm"><Clock size={18}/> Thời gian làm bài</div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                           <input type="range" min="5" max="60" step="5" value={quiz.timeLimitMinutes} onChange={(e) => setQuiz({...quiz, timeLimitMinutes: parseInt(e.target.value)})} className="flex-1 accent-blue-600 h-2 bg-slate-100 rounded-lg" />
                           <span className="w-24 text-center font-black text-blue-600 bg-blue-50 py-2 rounded-xl text-sm">{quiz.timeLimitMinutes} phút</span>
                        </div>
                     </div>
                     <div className="md:col-span-1 space-y-5">
                        <div className="flex items-center gap-2 text-slate-800 font-black text-sm"><CheckCircle size={18}/> Điểm đạt (%)</div>
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                           <input type="range" min="50" max="100" step="5" value={quiz.passingScore} onChange={(e) => setQuiz({...quiz, passingScore: parseInt(e.target.value)})} className="flex-1 accent-emerald-500 h-2 bg-slate-100 rounded-lg" />
                           <span className="w-24 text-center font-black text-emerald-500 bg-emerald-50 py-2 rounded-xl text-sm">{quiz.passingScore}%</span>
                        </div>
                     </div>
                     <div className="md:col-span-1 space-y-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tiêu đề Quiz</div>
                        <input type="text" value={quiz.title} onChange={(e) => setQuiz({...quiz, title: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none shadow-sm focus:ring-2 focus:ring-purple-500/10 transition-all" placeholder="VD: Kiểm tra kiến thức bài 1..."/>
                     </div>
                  </div>

                  <div className="space-y-10">
                    {quiz.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all relative group">
                        <button onClick={() => removeQuestion(qIndex)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20}/></button>
                        <div className="flex items-center gap-5 mb-10">
                           <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">{qIndex + 1}</div>
                           <h3 className="text-xl font-black text-slate-900">Câu hỏi số {qIndex + 1}</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                           <div className="lg:col-span-7 space-y-8">
                              <div>
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Nội dung câu hỏi</label>
                                 <textarea value={q.questionText} onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)} rows={3} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-6 font-bold text-slate-800 outline-none resize-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"/>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {['optionA', 'optionB', 'optionC', 'optionD'].map((opt) => (
                                   <div key={opt} className="relative">
                                      <input 
                                        type="text" 
                                        value={(q as any)[opt]} 
                                        onChange={(e) => updateQuestion(qIndex, opt as any, e.target.value)}
                                        className={`w-full bg-slate-50 border-2 rounded-2xl pl-6 pr-14 py-4 font-bold outline-none transition-all ${q.correctAnswer === (q as any)[opt] && q.correctAnswer !== "" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-transparent focus:bg-white focus:border-blue-100"}`}
                                        placeholder={`Lựa chọn ${opt.slice(-1)}...`}
                                      />
                                      <button 
                                        onClick={() => updateQuestion(qIndex, 'correctAnswer', (q as any)[opt])}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${q.correctAnswer === (q as any)[opt] && q.correctAnswer !== "" ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-slate-200 text-slate-400 hover:bg-emerald-100 hover:text-emerald-500"}`}
                                      >
                                        <CheckCircle2 size={18}/>
                                      </button>
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="lg:col-span-5 space-y-6">
                              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Ký hiệu video liên quan</label>
                                 <select 
                                   value={q.relatedSignId || ""} 
                                   onChange={(e) => updateQuestion(qIndex, 'relatedSignId', Number(e.target.value))}
                                   className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none shadow-sm appearance-none focus:ring-2 focus:ring-blue-500/10"
                                 >
                                   <option value="">Chọn từ danh sách đã chọn...</option>
                                   {selectedSigns.map(s => <option key={s.id} value={s.id}>{s.signWord} ({s.region})</option>)}
                                 </select>
                                 <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                    <p className="text-xs font-bold text-blue-600 leading-relaxed italic flex gap-3">
                                       <AlertCircle size={18} className="shrink-0"/>
                                       Học viên sẽ được xem video minh họa của ký hiệu này trước khi trả lời.
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}

                    {quiz.questions.length === 0 && (
                      <div className="text-center py-32 bg-slate-50 rounded-[60px] border-2 border-dashed border-slate-100">
                         <HelpCircle size={80} className="mx-auto text-slate-200 mb-6 opacity-40" />
                         <p className="text-xl font-black text-slate-400 mb-2">Chưa có câu hỏi nào</p>
                         <p className="text-slate-300 font-medium">Sử dụng AI để gợi ý nhanh hoặc tự tạo từng câu hỏi cho bài học.</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
