"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  MAX_VSL_VIDEO_UPLOAD_SIZE,
  predictVslVideo,
  type VslPrediction,
  VslRecognitionError,
} from "@/services/vslRecognitionService";

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function validateVideoFile(file: File) {
  if (!file.type.startsWith("video/")) {
    throw new VslRecognitionError("Vui lòng chọn tệp video.");
  }

  if (file.size > MAX_VSL_VIDEO_UPLOAD_SIZE) {
    throw new VslRecognitionError("Video không được vượt quá 50MB.");
  }
}

export default function UploadTranslate() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<VslPrediction | null>(null);
  const [predictions, setPredictions] = useState<VslPrediction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isProcessing = isUploading;

  const selectFile = (selectedFile: File) => {
    try {
      validateVideoFile(selectedFile);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể chọn video này.",
      );
      return;
    }

    abortControllerRef.current?.abort();

    setFile(selectedFile);
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return URL.createObjectURL(selectedFile);
    });
    setResult(null);
    setPredictions([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) selectFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) selectFile(droppedFile);
  };

  const handleTranslate = async () => {
    if (!file) return;

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsUploading(true);
    setResult(null);
    setPredictions([]);

    try {
      const nextPredictions = await predictVslVideo(
        file,
        abortController.signal,
      );
      setPredictions(nextPredictions);
      setResult(nextPredictions[0]);
      toast.success("Phân tích video thành công.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể phân tích video. Vui lòng thử lại.",
      );
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    abortControllerRef.current?.abort();
    setFile(null);
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return null;
    });
    setResult(null);
    setPredictions([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Video size={24} className="text-blue-600" /> Tải video ký hiệu
          </h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative aspect-square rounded-[48px] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
              file
                ? "border-blue-200 bg-blue-50/30"
                : "border-slate-200 bg-white hover:border-blue-400 hover:bg-slate-50"
            }`}
          >
            {preview ? (
              <div className="relative w-full h-full group">
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={clearFile}
                    className="p-4 bg-rose-500 text-white rounded-3xl shadow-xl transform transition-transform hover:scale-110"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="absolute left-5 bottom-5 right-5 rounded-3xl bg-black/50 px-5 py-3 text-white backdrop-blur-md">
                  <p className="truncate text-sm font-black">{file?.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                    {file ? formatFileSize(file.size) : ""}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-10 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-sm">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">
                    Kéo thả video vào đây
                  </p>
                  <p className="text-sm font-bold text-slate-400 mt-2">
                    Hỗ trợ MP4, MOV, AVI, tối đa 50MB
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50"
                >
                  Chọn từ máy tính
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
          </div>

          <button
            disabled={!file || isProcessing}
            onClick={handleTranslate}
            className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" /> AI đang phân tích...
              </>
            ) : (
              <>
                <BrainCircuit size={24} /> Bắt đầu dịch video
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <MessageSquare size={24} className="text-indigo-600" /> Kết quả dịch
            thuật
          </h3>

          <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 h-full min-h-[400px] flex flex-col">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 space-y-8"
                >
                  <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle2 size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Phân tích hoàn tất
                    </span>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                    <p className="text-2xl font-black text-slate-900 leading-tight">
                      &ldquo;{result.label}&rdquo;
                    </p>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Độ tin cậy
                    </p>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full shadow-sm"
                        style={{
                          width: `${Math.max(0, Math.min(result.prob, 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] font-black text-emerald-600">
                        {result.prob.toFixed(1)}% CHÍNH XÁC
                      </span>
                      <span className="text-[10px] font-black text-slate-400">
                        RAILWAY VSL API
                      </span>
                    </div>
                  </div>

                  {predictions.length > 1 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Top dự đoán
                      </p>
                      {predictions.slice(0, 5).map((prediction, index) => (
                        <div
                          key={`${prediction.label}-${index}`}
                          className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                        >
                          <span className="min-w-0 truncate text-sm font-black text-slate-700">
                            {index + 1}. {prediction.label}
                          </span>
                          <span className="text-xs font-black text-blue-600">
                            {prediction.prob.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : isProcessing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-8 text-center"
                >
                  <div className="relative">
                    <div className="w-32 h-32 border-8 border-blue-50 border-t-blue-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit size={40} className="text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900">
                      AI đang xử lý video
                    </p>
                    <p className="text-sm font-bold text-slate-400 mt-2 max-w-[240px]">
                      Server đang trích xuất landmarks từ video và chạy model nhận
                      diện VSL.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-6 text-center opacity-30"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                    <AlertCircle size={32} className="text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-400 max-w-[200px]">
                    Kết quả dịch video sẽ hiển thị tại đây
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
