"use client";

import { useState, useEffect } from "react";
import { Lesson } from "@/types/lesson";
import { lessonService } from "@/services/lessonService";
import { 
  Sparkles, Play, ArrowRight, Loader2, 
  BookOpen, Clock, Layers, Search, ChevronRight,
  TrendingUp, Globe, Users, Filter, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  
  const router = useRouter();

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    let result = lessons;
    
    // Filter by Search
    if (searchTerm) {
      result = result.filter(l => 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by Category (Level)
    if (activeCategory !== "Tất cả") {
      result = result.filter(l => l.level?.toUpperCase() === activeCategory.toUpperCase());
    }
    
    setFilteredLessons(result);
  }, [searchTerm, activeCategory, lessons]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const data = await lessonService.getAllLessons();
      setLessons(data);
      setFilteredLessons(data);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    try {
      setIsGenerating(true);
      // Xóa dữ liệu cũ trước khi tạo mới
      sessionStorage.removeItem("ai_lesson_preview");
      
      const newLesson = await lessonService.generateAILesson(aiPrompt);
      
      if (newLesson && newLesson.signs && newLesson.signs.length > 0) {
        sessionStorage.setItem("ai_lesson_preview", JSON.stringify(newLesson));
        router.push("/lessons/ai-preview");
      } else {
        // Có thể thêm thông báo không tìm thấy từ vựng phù hợp
        alert("Không tìm thấy từ vựng phù hợp cho chủ đề này trong từ điển.");
      }
    } catch (error) {
      console.error("Failed to generate AI lesson:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "BASIC": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "INTERMEDIATE": return "text-blue-600 bg-blue-50 border-blue-100";
      case "ADVANCED": return "text-rose-600 bg-rose-50 border-rose-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getLessonSignCount = (lesson: Lesson) => {
    return lesson.signCount ?? lesson.signs?.length ?? 0;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 font-sans">
      {/* --- ENHANCED HERO SECTION --- */}
      <div className="relative bg-white border-b border-slate-100 pt-20 pb-24 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <TrendingUp size={14} />
            Hệ thống học tập thông minh
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
          >
            Lộ trình học <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ký Hiệu</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Học tập không giới hạn với bộ dữ liệu 4300 từ vựng và công cụ tạo bài học AI cá nhân hóa.
          </motion.p>
          
          {/* AI Generator Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <form onSubmit={handleGenerateAI} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-all"></div>
              <div className="relative flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-3xl border border-slate-200 shadow-xl transition-all">
                <div className="flex-1 flex items-center px-5 gap-4">
                  <Sparkles className="text-blue-500" size={24} />
                  <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Nhập bất cứ điều gì bạn muốn học (VD: Giao tiếp tại sân bay...)" 
                    className="w-full bg-transparent border-none focus:ring-0 py-4 text-slate-800 font-bold placeholder:text-slate-400 text-lg"
                  />
                </div>
                <button 
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="bg-slate-900 hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 shadow-lg shadow-slate-200"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                      Tạo Lộ Trình AI
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-12 mt-16 text-slate-400">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">4,300+</span>
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                   <Layers size={12} /> Từ vựng
                </span>
             </div>
             <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">100%</span>
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                   <Globe size={12} /> Vùng miền
                </span>
             </div>
             <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">AI</span>
                <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                   <Sparkles size={12} /> Linh hoạt
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        
        {/* Filters & Search Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Thư viện bài học</h2>
            <p className="text-slate-500 font-medium">Khám phá các khóa học được biên soạn bởi chuyên gia</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bài học..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none shadow-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              {["Tất cả", "Basic", "Intermediate"].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    activeCategory === cat 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-white rounded-[32px] border border-slate-100 animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredLessons.map((lesson) => {
                const getFullUrl = (url: string) => {
                  if (!url) return "";
                  if (url.startsWith("http")) return url;
                  let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
                  baseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
                  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
                };

                return (
                  <motion.div
                    key={lesson.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/lessons/${lesson.id}`} className="group block h-full">
                      <div className="relative h-full bg-white rounded-[40px] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 flex flex-col">
                        
                        {/* Cover Image / Icon Header */}
                        <div className="relative h-56 overflow-hidden bg-slate-100">
                           {lesson.coverImage ? (
                             <img 
                               src={getFullUrl(lesson.coverImage)} 
                               alt={lesson.title} 
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                                <BookOpen className="text-blue-200" size={64} />
                             </div>
                           )}
                           <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm ${getLevelColor(lesson.level)}`}>
                                {lesson.level || "BASIC"}
                              </span>
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Play size={18} fill="white" />
                              </div>
                           </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex-1 flex flex-col">
                          <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                            {lesson.title}
                          </h3>
                          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-8 flex-1">
                            {lesson.description || "Khám phá thế giới ngôn ngữ ký hiệu thông qua bài học chuyên sâu về chủ đề này."}
                          </p>

                          {/* Bottom Metadata */}
                          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Layers size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{getLessonSignCount(lesson)} từ</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Globe size={14} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{lesson.region === 'TOAN_QUOC' ? 'Toàn quốc' : lesson.region}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
                               Học ngay <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>

                        {/* Hover subtle glow */}
                        <div className="absolute inset-0 rounded-[40px] ring-1 ring-inset ring-slate-900/5 group-hover:ring-blue-600/20 transition-all"></div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {!isLoading && filteredLessons.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Không tìm thấy bài học</h3>
                <p className="text-slate-400 mt-2 max-w-xs mx-auto font-medium">Thử thay đổi từ khóa hoặc sử dụng AI để tạo lộ trình mới.</p>
                <button onClick={() => {setSearchTerm(""); setActiveCategory("Tất cả");}} className="mt-8 text-blue-600 font-black text-sm uppercase tracking-wider hover:text-blue-700 underline underline-offset-8">
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        )}

        {/* Community Section (Bonus) */}
        <div className="mt-32 relative">
           <div className="bg-slate-900 rounded-[40px] p-12 md:p-20 overflow-hidden relative shadow-2xl shadow-blue-900/20">
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <h2 className="text-4xl font-black text-white mb-6">Bạn không học một mình</h2>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                       Tham gia cùng cộng đồng 10,000+ người đang học ngôn ngữ ký hiệu mỗi ngày. Chia sẻ tiến độ và cùng nhau chinh phục các thử thách mới.
                    </p>
                    <div className="flex flex-wrap gap-4">
                       <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2">
                          Tham gia ngay
                          <Users size={20} />
                       </button>
                       <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black transition-all border border-white/10 backdrop-blur-md">
                          Xem bảng xếp hạng
                       </button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-8">
                       <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                          <h4 className="text-3xl font-black text-blue-400 mb-1">12K</h4>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Học viên</p>
                       </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                          <h4 className="text-3xl font-black text-emerald-400 mb-1">4.9</h4>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đánh giá</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                          <h4 className="text-3xl font-black text-purple-400 mb-1">4.3K</h4>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Từ vựng</p>
                       </div>
                       <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                          <h4 className="text-3xl font-black text-orange-400 mb-1">24/7</h4>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hỗ trợ AI</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
