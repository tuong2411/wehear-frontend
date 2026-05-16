"use client";

export const runtime = "edge";

import { useState, useEffect, use } from "react";
import { 
  ChevronLeft, CheckCircle2, Play, ArrowRight, Loader2, 
  Trophy, RefreshCw, Home, BookOpen, Video, Layers, 
  Award, ArrowLeft, Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { lessonService } from "@/services/lessonService";
import { Lesson } from "@/types/lesson";
import QuizVideoPlayer from "@/components/quiz/QuizVideoPlayer";

export default function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSignIndex, setActiveSignIndex] = useState(0);
  const [mode, setActiveMode] = useState<'LEARNING' | 'QUIZ' | 'RESULT'>('LEARNING');
  
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      let data: Lesson;
      const numericId = Number(id);
      
      if (!isNaN(numericId)) {
        data = await lessonService.getLessonById(numericId);
      } else {
        data = await lessonService.getLessonBySlug(id);
      }
      
      // Nếu bài học không có quiz, tự tạo quiz từ danh sách từ vựng
      if (data && !data.quiz && data.signs && data.signs.length > 0) {
        const questions = data.signs.map(sign => {
          const otherSigns = data.signs!.filter(s => s.id !== sign.id);
          const shuffled = [...otherSigns].sort(() => 0.5 - Math.random());
          const options = [sign.signWord, ...shuffled.slice(0, 3).map(s => s.signWord)].sort(() => 0.5 - Math.random());
          
          return {
            questionText: `Ký hiệu này có nghĩa là gì?`,
            questionType: "MULTIPLE_CHOICE",
            optionA: options[0],
            optionB: options[1],
            optionC: options[2],
            optionD: options[3],
            correctAnswer: sign.signWord,
            signMedia: sign.media?.[0]
          };
        });
        
        data.quiz = {
          title: `Kiểm tra: ${data.title}`,
          questions: questions
        };
      }
      
      setLesson(data);
    } catch (error) {
      console.error("Failed to fetch lesson", error);
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8668/api";
    baseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered || !lesson?.quiz) return;
    const currentQuestion = lesson.quiz.questions[currentQuestionIndex];
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    if (answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()) {
      setScore(prev => prev + 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={48} />
    </div>
  );

  if (!lesson) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-black text-slate-900 mb-4">Không tìm thấy bài học</h1>
      <Link href="/lessons" className="text-blue-600 font-bold hover:underline">Quay lại danh sách</Link>
    </div>
  );

  // --- RENDER MODES ---

  if (mode === 'RESULT' && lesson.quiz) {
    const percentage = Math.round((score / lesson.quiz.questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-2xl w-full bg-white rounded-[48px] shadow-2xl p-12 text-center border border-slate-100">
          <div className="w-32 h-32 bg-yellow-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-100">
            <Trophy size={64} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-3">Hoàn thành!</h1>
          <p className="text-slate-500 mb-12 font-bold text-lg">Bạn đã hoàn thành bài học: {lesson.title}</p>
          <div className="grid grid-cols-2 gap-6 mb-12">
             <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                <div className="text-5xl font-black text-blue-600 mb-1">{score}<span className="text-2xl text-slate-300">/{lesson.quiz.questions.length}</span></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Câu đúng</p>
             </div>
             <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                <div className="text-5xl font-black text-emerald-600 mb-1">{percentage}%</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ chính xác</p>
             </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => { setScore(0); setCurrentQuestionIndex(0); setActiveMode('LEARNING'); }} className="flex-1 py-6 rounded-[24px] bg-slate-900 text-white font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
              <RefreshCw size={20} /> Học lại từ đầu
            </button>
            <Link href="/lessons" className="flex-1 py-6 rounded-[24px] bg-white border-2 border-slate-100 text-slate-600 font-black hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-3">
              <Home size={20} /> Về danh sách
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'QUIZ' && lesson.quiz) {
    const currentQuestion = lesson.quiz.questions[currentQuestionIndex];
    const options = [currentQuestion.optionA, currentQuestion.optionB, currentQuestion.optionC, currentQuestion.optionD];
    const progress = (currentQuestionIndex / lesson.quiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-white font-sans overflow-x-hidden">
        <div className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center gap-10">
            <button onClick={() => setActiveMode('LEARNING')} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
               <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  <span>Câu {currentQuestionIndex + 1} / {lesson.quiz.questions.length}</span>
                  <span className="text-blue-600">{Math.round(progress)}%</span>
               </div>
               <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" />
               </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-6 pt-40 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8 sticky top-40">
              <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{currentQuestion.questionText}</h2>
              <QuizVideoPlayer videoUrl={getFullUrl(currentQuestion.signMedia?.mediaUrl || "")} hideAnswer={true} />
            </div>
            <div className="pt-4 space-y-5">
              {(options || []).map((option, idx) => {
                const normalizedOption = (option ?? "").toString().trim().toLowerCase();
                const normalizedCorrectAnswer = (currentQuestion?.correctAnswer ?? "").toString().trim().toLowerCase();

                const isSelected = selectedAnswer === option;
                const isCorrect = isAnswered && normalizedOption !== "" && normalizedOption === normalizedCorrectAnswer;
                const isWrong = isAnswered && isSelected && !isCorrect;
                return (
                  <button key={idx} onClick={() => handleAnswer(option)} disabled={isAnswered} className={`w-full p-8 rounded-[32px] text-left font-black text-xl border-b-[6px] transition-all active:translate-y-[2px] active:border-b-[2px] flex items-center justify-between ${isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xl" : isWrong ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xl" : isSelected ? "bg-blue-50 border-blue-500 text-blue-700 shadow-lg" : "bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-slate-50"}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg ${isCorrect ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "bg-slate-50 text-slate-400"}`}>{String.fromCharCode(65 + idx)}</div>
                      <span>{option ?? "N/A"}</span>
                    </div>
                    {isCorrect && <CheckCircle2 className="text-emerald-500" size={32} />}
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        <AnimatePresence>
          {isAnswered && (
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className={`fixed bottom-0 inset-x-0 p-8 border-t-[8px] z-50 shadow-2xl bg-white ${selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "border-emerald-500" : "border-rose-500"}`}>
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg ${selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "bg-emerald-500" : "bg-rose-500"}`}>
                    {selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? <CheckCircle2 size={40} color="white" /> : <Layers size={40} color="white" />}
                  </div>
                  <div>
                    <h4 className="text-3xl font-black">{selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "Chính xác!" : "Rất tiếc..."}</h4>
                    <p className="font-bold text-slate-500">Đáp án đúng: {currentQuestion.correctAnswer}</p>
                  </div>
                </div>
                <button onClick={() => { if (currentQuestionIndex < lesson.quiz!.questions.length - 1) { setCurrentQuestionIndex(prev => prev + 1); setSelectedAnswer(null); setIsAnswered(false); } else { setActiveMode('RESULT'); } }} className={`px-12 py-6 rounded-[24px] text-white text-xl font-black shadow-xl flex items-center gap-3 ${selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "bg-emerald-500" : "bg-rose-500"}`}>
                  {currentQuestionIndex < lesson.quiz!.questions.length - 1 ? "Tiếp theo" : "Xem kết quả"} <ArrowRight size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- LEARNING MODE (Default) ---
  const currentSign = lesson.signs?.[activeSignIndex];
  const primaryVideo = currentSign?.media?.find(m => m.mediaType === "video" && m.isPrimary) || currentSign?.media?.[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/lessons" className="flex items-center gap-3 text-slate-500 font-bold hover:text-slate-900 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm"><ChevronLeft size={18} /></div>
            Quay lại
          </Link>
          <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-black uppercase tracking-tight">
            <BookOpen size={18} /> {lesson.title}
          </div>
          <button onClick={() => setActiveMode('QUIZ')} disabled={!lesson.quiz} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:bg-slate-200">
            <Award size={20} /> Làm bài kiểm tra
          </button>
        </div>
      </div>

      {/* Hero Section with Cover Image */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-12">
        <div className="relative h-[300px] md:h-[400px] rounded-[48px] overflow-hidden shadow-2xl border-8 border-white">
           {lesson.coverImage ? (
             <img src={getFullUrl(lesson.coverImage)} alt={lesson.title} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
           <div className="absolute bottom-10 left-10 right-10">
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">{lesson.level}</span>
                 <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">{lesson.region}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">{lesson.title}</h1>
              <p className="text-white/70 text-lg font-medium max-w-2xl line-clamp-2">{lesson.description}</p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-100">
              {primaryVideo ? (
                <video key={primaryVideo.mediaUrl} src={getFullUrl(primaryVideo.mediaUrl)} className="w-full h-full object-contain" controls autoPlay loop />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500"><Video size={64} className="mb-4 opacity-10" /><p className="font-bold">Không tìm thấy video hướng dẫn</p></div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
               <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{currentSign?.signWord}</h1>
               <div className="space-y-6">
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Ý nghĩa & Cách thực hiện</h3>
                     <p className="text-slate-600 leading-relaxed text-xl font-medium">{currentSign?.description || "Quan sát video để nắm bắt các cử chỉ tay và biểu cảm khuôn mặt."}</p>
                  </div>
                  {currentSign?.exampleSentence && (
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-2">Ví dụ minh họa</h3>
                       <p className="text-slate-700 italic font-bold">"{currentSign.exampleSentence}"</p>
                    </div>
                  )}
               </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-32">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 ring-1 ring-slate-900/5">
              <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">Nội dung bài học <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black">{lesson.signs?.length}</span></h2>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar">
                {lesson.signs?.map((sign, index) => (
                  <button key={index} onClick={() => setActiveSignIndex(index)} className={`w-full group flex items-center gap-5 p-5 rounded-[24px] transition-all text-left border ${activeSignIndex === index ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20" : "bg-white border-slate-50 hover:border-blue-200 hover:bg-blue-50/30 text-slate-600"}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${activeSignIndex === index ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>{(index + 1).toString().padStart(2, '0')}</div>
                    <div className="flex-1"><div className="font-black text-lg group-hover:translate-x-1 transition-transform">{sign.signWord}</div><div className={`text-[10px] font-black uppercase tracking-widest ${activeSignIndex === index ? "text-slate-400" : "text-slate-300"}`}>{sign.region || "Toàn quốc"}</div></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
