"use client";

import { useEffect, useState, useRef } from "react";
import { Lesson, QuizQuestion } from "@/types/lesson";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft as ArrowLeftIcon, 
  CheckCircle2 as CheckIcon, 
  XCircle as XIcon, 
  Trophy as TrophyIcon, 
  RefreshCcw as RefreshIcon, 
  Video as VideoIcon, 
  Play as PlayIcon, 
  ArrowRight as ArrowRightIcon, 
  Home as HomeIcon, 
  Sparkles as SparklesIcon, 
  Star as StarIcon, 
  Award as AwardIcon 
} from "lucide-react";
import QuizVideoPlayer from "@/components/quiz/QuizVideoPlayer";

export default function AIQuizPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const data = sessionStorage.getItem("ai_lesson_preview");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.quiz && parsed.quiz.questions && parsed.quiz.questions.length > 0) {
        setLesson(parsed);
      } else {
        router.push("/lessons");
      }
    } else {
      router.push("/lessons");
    }
  }, [router]);

  if (!mounted || !lesson || !lesson.quiz) return null;

  const questions = lesson.quiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://wehear-backend-production.up.railway.app";
    baseUrl = baseUrl.endsWith("/api") ? baseUrl.replace("/api", "") : baseUrl;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-[48px] shadow-2xl p-12 text-center border border-slate-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div className="relative">
            <motion.div 
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-200"
            >
              <TrophyIcon size={64} className="text-white" />
            </motion.div>

            <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">Thật tuyệt vời!</h1>
            <p className="text-slate-500 mb-12 font-bold text-lg">Bạn đã hoàn thành thử thách AI xuất sắc</p>
            
            <div className="grid grid-cols-2 gap-6 mb-12">
               <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                  <div className="text-5xl font-black text-blue-600 mb-1">
                    {score}<span className="text-2xl text-slate-300">/{questions.length}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Câu đúng</p>
               </div>
               <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                  <div className="text-5xl font-black text-indigo-600 mb-1">
                    {percentage}<span className="text-2xl text-slate-300">%</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ chính xác</p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  setScore(0);
                  setCurrentQuestionIndex(0);
                  setIsAnswered(false);
                  setSelectedAnswer(null);
                  setIsFinished(false);
                }}
                className="flex-1 py-6 rounded-[24px] bg-slate-900 text-white font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 group"
              >
                <RefreshIcon size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                Thử thách lại
              </button>
              <Link 
                href="/lessons"
                className="flex-1 py-6 rounded-[24px] bg-white border-2 border-slate-100 text-slate-600 font-black hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
              >
                <HomeIcon size={20} />
                Về danh sách
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const options = [
    currentQuestion.optionA,
    currentQuestion.optionB,
    currentQuestion.optionC,
    currentQuestion.optionD
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <div className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-10">
          <Link href="/lessons/ai-preview" className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 shadow-sm">
            <ArrowLeftIcon className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
          </Link>
          
          <div className="flex-1">
             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                <span className="flex items-center gap-2">
                   <AwardIcon size={14} className="text-blue-500" />
                   Thử thách AI: Câu {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="text-blue-600">{Math.round(progress)}% hoàn thành</span>
             </div>
             <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                />
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          <div className="space-y-8 sticky top-40">
            <motion.div
              key={`q-text-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
               <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                  <SparklesIcon size={12} />
                  Câu hỏi thông minh
               </span>
               <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                 {currentQuestion.questionText}
               </h2>
            </motion.div>

            <QuizVideoPlayer 
              videoUrl={getFullUrl(currentQuestion.signMedia?.mediaUrl || "")} 
              hideAnswer={true}
            />
          </div>

          <div className="pt-4">
            <div className="grid grid-cols-1 gap-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`options-${currentQuestionIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-5"
                >
                  {options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = isAnswered && option.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
                    const isWrong = isAnswered && isSelected && !isCorrect;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        disabled={isAnswered}
                        className={`group relative w-full p-8 rounded-[32px] text-left font-black text-xl transition-all border-b-[6px] active:translate-y-[2px] active:border-b-[2px] flex items-center justify-between ${
                          isCorrect 
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xl shadow-emerald-100" 
                            : isWrong 
                            ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xl shadow-rose-100"
                            : isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-lg shadow-blue-100"
                            : "bg-white border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-slate-50 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg shadow-sm transition-all ${
                            isCorrect ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="tracking-tight">{option}</span>
                        </div>
                        <AnimatePresence>
                           {isCorrect && (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                               <CheckIcon size={32} className="text-emerald-500" />
                             </motion.div>
                           )}
                           {isWrong && (
                             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                               <XIcon size={32} className="text-rose-500" />
                             </motion.div>
                           )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {!isAnswered && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 1 }}
                 className="mt-12 p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-start gap-4"
               >
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                     <StarIcon size={18} className="text-yellow-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                     Hãy chú ý kỹ chuyển động của bàn tay và các ngón tay. Mỗi ký hiệu ngôn ngữ ký hiệu Việt Nam (VSL) đều có đặc điểm riêng biệt.
                  </p>
               </motion.div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isAnswered && (
          <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className={`fixed bottom-0 inset-x-0 p-8 border-t-[8px] z-50 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.1)] ${
              selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase()
                ? "bg-white border-emerald-500" 
                : "bg-white border-rose-500"
            }`}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-lg ${
                  selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "bg-emerald-500" : "bg-rose-500"
                }`}>
                  {selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? <CheckIcon size={40} color="white" /> : <XIcon size={40} color="white" />}
                </div>
                <div>
                  <h4 className={`text-3xl font-black tracking-tight ${
                    selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "text-emerald-700" : "text-rose-700"
                  }`}>
                    {selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "Chính xác, quá giỏi!" : "Rất tiếc, chưa đúng"}
                  </h4>
                  <p className={`font-bold text-lg ${
                    selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "text-emerald-600/70" : "text-rose-600/70"
                  }`}>
                    {selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() 
                      ? "Bạn đang nắm bắt ký hiệu rất tốt." 
                      : `Đáp án đúng là: ${currentQuestion.correctAnswer}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={nextQuestion}
                className={`w-full sm:w-auto px-12 py-6 rounded-[24px] text-white text-xl font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                  selectedAnswer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                }`}
              >
                {currentQuestionIndex < questions.length - 1 ? "Câu hỏi tiếp theo" : "Xem kết quả chung cuộc"}
                <ArrowRightIcon size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
