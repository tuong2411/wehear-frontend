"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, X, CheckCircle2, ChevronRight, ChevronLeft, Info, HelpCircle } from "lucide-react";
import { ContributionFormData } from "@/types/contribution";
import { contributionService } from "@/services/contributionService";
import { dictionaryService } from "@/services/dictionaryService";
import { toast } from "react-hot-toast";

interface ContributionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialType?: 'NEW' | 'EDIT';
  targetId?: number;
  initialWord?: string;
}

export default function ContributionForm({ onSuccess, onCancel, initialType = 'NEW', targetId, initialWord = "" }: ContributionFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ContributionFormData>({
    word: initialWord,
    description: "",
    example: "",
    type: initialType,
    targetDictionaryId: targetId
  });
  const [isCheckingWord, setIsCheckingWord] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_ROOT = "http://localhost:8668";

  const getFullVideoUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("blob:")) return url;
    if (url.startsWith("http")) return url;
    return `${API_ROOT}${url}`;
  };

  const checkWordExistence = async () => {
    if (!formData.word.trim() || formData.type === 'EDIT') return;
    
    setIsCheckingWord(true);
    try {
      const response = await dictionaryService.getAllSigns(0, 5, formData.word.trim());
      const existing = response.items.find(item => 
        item.signWord.toLowerCase() === formData.word.trim().toLowerCase()
      );

      if (existing) {
        setFormData(prev => ({
          ...prev,
          type: 'EDIT',
          targetDictionaryId: existing.id
        }));
        toast.success(`Từ "${existing.signWord}" đã có sẵn. Bạn đang đóng góp bản chỉnh sửa.`);
      } else {
        setFormData(prev => ({ ...prev, type: 'NEW', targetDictionaryId: undefined }));
      }
    } catch (error) {
      console.error("Check word existence failed", error);
    } finally {
      setIsCheckingWord(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Video selected:", file.name, file.type, file.size);
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Video quá lớn. Vui lòng chọn file dưới 20MB.");
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.word.trim()) {
        toast.error("Vui lòng nhập từ vựng.");
        return;
      }
      if (!formData.description.trim()) {
        toast.error("Vui lòng nhập mô tả cách thực hiện.");
        return;
      }
    }
    if (step === 2 && !videoFile) {
      toast.error("Vui lòng tải lên video minh họa.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalVideoUrl = "";
      
      if (videoFile) {
        console.log("Uploading video file...");
        const uploadRes = await contributionService.uploadContributionVideo(videoFile);
        if (uploadRes.success) {
          finalVideoUrl = uploadRes.videoUrl;
          console.log("Video upload success, URL:", finalVideoUrl);
        } else {
          throw new Error(uploadRes.message || "Lỗi upload video");
        }
      } else {
        throw new Error("Vui lòng chọn video minh họa.");
      }

      const submissionData = {
        ...formData,
        videoUrl: finalVideoUrl
      };

      console.log("Submitting contribution data:", submissionData);
      await contributionService.submitContribution(submissionData);
      
      toast.success("Đóng góp của bạn đã được gửi!");
      if (onSuccess) onSuccess();
      setStep(4);
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Gửi đóng góp thất bại.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Thông tin", icon: <Info size={16} /> },
    { title: "Video", icon: <Video size={16} /> },
    { title: "Xem trước", icon: <HelpCircle size={16} /> },
  ];

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100">
      {/* Progress Header */}
      {step < 4 && (
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center flex-1 relative">
                <div 
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    step > i + 1 
                      ? "bg-blue-600 border-blue-600 text-white" 
                      : step === i + 1 
                        ? "bg-white border-blue-600 text-blue-600 shadow-md" 
                        : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {step > i + 1 ? <CheckCircle2 size={20} /> : s.icon}
                </div>
                <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${step === i + 1 ? "text-blue-600" : "text-slate-400"}`}>
                  {s.title}
                </span>
                {i < steps.length - 1 && (
                  <div className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 ${step > i + 1 ? "bg-blue-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Thông tin ký hiệu</h3>
                <p className="text-slate-500 text-sm mt-1">Mô tả chi tiết về từ vựng bạn muốn đóng góp.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-slate-700">Từ vựng <span className="text-red-500">*</span></label>
                    {isCheckingWord && <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />}
                  </div>
                  <input
                    type="text"
                    value={formData.word}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    onBlur={checkWordExistence}
                    className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50/50 transition-all"
                    placeholder="Ví dụ: Xin chào"
                  />
                  {formData.type === 'EDIT' && (
                    <p className="mt-1 text-[10px] font-bold text-amber-600 uppercase">Chế độ: Đóng góp chỉnh sửa</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả cách thực hiện <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50/50 transition-all"
                    placeholder="Mô tả các cử động tay, vị trí và biểu cảm khuôn mặt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Câu ví dụ (Tùy chọn)</label>
                  <input
                    type="text"
                    value={formData.example}
                    onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-50/50 transition-all"
                    placeholder="Ví dụ: Tôi muốn nói lời xin chào với mọi người."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={onCancel}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  Tiếp theo <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Tải lên Video</h3>
                <p className="text-slate-500 text-sm mt-1">Video minh họa rõ ràng cử động tay và khuôn mặt.</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all ${
                  videoPreview ? "border-blue-500 bg-slate-900" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                {videoPreview ? (
                  <>
                    <video src={getFullVideoUrl(videoPreview)} className="h-full w-full object-contain" autoPlay loop muted />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setVideoPreview(null); setVideoFile(null); }}
                      className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white backdrop-blur hover:bg-white/40"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <Upload className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-600">Click để tải video lên</p>
                      <p className="text-xs">MP4, MOV (Tối đa 20MB)</p>
                    </div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleVideoChange} accept="video/*" className="hidden" />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={18} /> Quay lại
                </button>
                <div className="flex items-center gap-4">
                   <button
                    onClick={onCancel}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition-colors"
                  >
                    Xem lại <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Kiểm tra lại</h3>
                <p className="text-slate-500 text-sm mt-1">Xem lại thông tin trước khi gửi đóng góp.</p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <div className="aspect-video w-full bg-slate-900">
                  <video src={getFullVideoUrl(videoPreview)} className="h-full w-full object-contain" controls />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                      {formData.type === 'NEW' ? 'Từ mới' : 'Chỉnh sửa'}
                    </span>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">{formData.word}</h4>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hướng dẫn</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{formData.description}</p>
                  </div>
                  {formData.example && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ví dụ</p>
                      <p className="text-slate-600 text-sm italic">"{formData.example}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  <ChevronLeft size={18} /> Quay lại
                </button>
                <div className="flex items-center gap-4">
                   <button
                    onClick={onCancel}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>Gửi đóng góp <CheckCircle2 size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-10 text-center"
            >
              <div className="mb-6 rounded-full bg-green-50 p-6 text-green-500">
                <CheckCircle2 size={80} strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-black text-slate-900">Tuyệt vời!</h3>
              <p className="mt-4 max-w-sm text-slate-500 leading-relaxed">
                Đóng góp của bạn đã được gửi đi thành công. Chúng tôi sẽ kiểm duyệt và phản hồi sớm nhất có thể.
              </p>
              
              <div className="mt-10 flex flex-col w-full gap-3">
                <button
                  onClick={() => window.location.href = "/history"}
                  className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white hover:bg-slate-800 transition-all"
                >
                  Xem lịch sử đóng góp
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setFormData({ word: "", description: "", example: "", type: 'NEW' });
                    setVideoPreview(null);
                    setVideoFile(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 px-6 py-4 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Tiếp tục đóng góp từ khác
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
