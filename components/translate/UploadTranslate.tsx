"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BrainCircuit,
  MessageSquare,
  Save,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { synthesizeVietnameseSpeech, TextToSpeechError } from "@/services/ttsService";
import { saveVslUploadWord } from "@/services/vslUploadWordStore";
import { saveVslUploadVideo, VslUploadVideoError } from "@/services/vslUploadVideoService";
import {
  MAX_VSL_VIDEO_UPLOAD_SIZE,
  predictVslVideo,
  type VslPrediction,
  VslRecognitionError,
} from "@/services/vslRecognitionService";

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [isSelectionSaved, setIsSelectionSaved] = useState(false);
  const [result, setResult] = useState<VslPrediction | null>(null);
  const [predictions, setPredictions] = useState<VslPrediction[]>([]);
  const [selectedPredictionLabel, setSelectedPredictionLabel] = useState("");
  const [editableMeaning, setEditableMeaning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isProcessing = isUploading;
  const selectedPrediction = predictions.find(
    (prediction) => prediction.label === selectedPredictionLabel,
  ) ?? result;

  const stopSpeech = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    URL.revokeObjectURL(audioRef.current.src);
    audioRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    const textToSpeak = text.trim();
    if (!textToSpeak || isSpeaking) return;

    try {
      stopSpeech();
      setIsSpeaking(true);

      const audioBlob = await synthesizeVietnameseSpeech(textToSpeak);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (audioRef.current === audio) audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (audioRef.current === audio) audioRef.current = null;
        toast.error("Không thể phát giọng đọc.");
      };

      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      const message = error instanceof TextToSpeechError
        ? error.message
        : "Không thể tạo giọng đọc. Vui lòng thử lại.";
      toast.error(message);
    }
  }, [isSpeaking, stopSpeech]);

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
    setSelectedPredictionLabel("");
    setEditableMeaning("");
    setIsSelectionSaved(false);
    stopSpeech();
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
    setSelectedPredictionLabel("");
    setEditableMeaning("");
    setIsSelectionSaved(false);

    try {
      const nextPredictions = await predictVslVideo(
        file,
        abortController.signal,
      );
      setPredictions(nextPredictions);
      setResult(nextPredictions[0]);
      setSelectedPredictionLabel(nextPredictions[0]?.label ?? "");
      setEditableMeaning(nextPredictions[0]?.label ?? "");
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
    setSelectedPredictionLabel("");
    setEditableMeaning("");
    setIsSelectionSaved(false);
    stopSpeech();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveSelectedPrediction = async () => {
    const selectedMeaning = editableMeaning.trim();
    if (!file || !selectedPrediction?.label || !selectedMeaning || isSavingSelection) return;

    if (!localStorage.getItem("token")) {
      toast.error("Vui lòng đăng nhập để lưu video.");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }

    setIsSavingSelection(true);
    try {
      const savedVideo = await saveVslUploadVideo(
        file,
        selectedMeaning,
        selectedPrediction.prob,
      );
      saveVslUploadWord(savedVideo.selectedLabel, savedVideo.videoUrl, selectedPrediction.prob);
      setIsSelectionSaved(true);
      toast.success("Đã lưu thành công.");
    } catch (error) {
      const message = error instanceof VslUploadVideoError
        ? error.message
        : "Không thể lưu video. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsSavingSelection(false);
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (preview) URL.revokeObjectURL(preview);
      stopSpeech();
    };
  }, [preview, stopSpeech]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex flex-wrap items-center gap-2 sm:text-xl sm:gap-3">
            <Video size={24} className="text-blue-600" /> Tải video ký hiệu
          </h3>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative aspect-[4/3] rounded-[28px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden sm:aspect-square sm:rounded-[40px] sm:border-4 lg:rounded-[48px] ${
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
                <div className="absolute right-5 top-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={clearFile}
                    aria-label="Xóa video"
                    className="p-4 bg-rose-500 text-white rounded-3xl shadow-xl transform transition-transform hover:scale-110"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center p-5 flex flex-col items-center gap-4 sm:p-10 sm:gap-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-sm sm:h-20 sm:w-20 sm:rounded-3xl">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 sm:text-lg">
                    Kéo thả video vào đây
                  </p>
                  <p className="text-sm font-bold text-slate-400 mt-2">
                    Hỗ trợ MP4, MOV, AVI, tối đa 50MB
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/50 sm:px-8"
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
            className="w-full bg-blue-600 text-white py-4 rounded-[22px] font-black text-base shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 sm:py-5 sm:rounded-[28px] sm:text-lg"
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
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 sm:text-xl">
            <MessageSquare size={24} className="text-indigo-600" /> Kết quả dịch
            thuật
          </h3>

          <div className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/50 p-5 h-full min-h-[360px] flex flex-col sm:rounded-[40px] sm:p-8 md:p-10 lg:rounded-[48px] lg:min-h-[400px]">
            <AnimatePresence mode="wait">
              {selectedPrediction ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 space-y-6"
                >
                  <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle2 size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      Phân tích hoàn tất
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-[24px] border border-slate-100 sm:p-8 sm:rounded-[32px]">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div>
                        <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                          Từ đang chọn
                        </p>
                        <textarea
                          value={editableMeaning}
                          onChange={(event) => {
                            setEditableMeaning(event.target.value);
                            setIsSelectionSaved(false);
                          }}
                          className="w-full min-h-[96px] resize-none rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xl font-black leading-tight text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 sm:min-h-[104px] sm:text-2xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void speak(editableMeaning)}
                        disabled={isSpeaking || !editableMeaning.trim()}
                        aria-label="Đọc kết quả"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition hover:text-blue-600 disabled:opacity-40"
                      >
                        {isSpeaking ? <Loader2 size={21} className="animate-spin" /> : <Volume2 size={21} />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Độ tin cậy tham khảo
                    </p>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full shadow-sm"
                        style={{
                          width: `${Math.max(0, Math.min(selectedPrediction.prob, 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] font-black text-emerald-600">
                        {selectedPrediction.prob.toFixed(1)}% TIN CẬY
                      </span>
                      <span className="text-[10px] font-black text-slate-400">
                        RAILWAY VSL API
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Chọn một kết quả nhận diện
                    </p>
                    {predictions.slice(0, 5).map((prediction, index) => {
                      const isSelected = prediction.label === selectedPredictionLabel;

                      return (
                        <button
                          type="button"
                          key={`${prediction.label}-${index}`}
                          onClick={() => {
                            setSelectedPredictionLabel(prediction.label);
                            setEditableMeaning(prediction.label);
                            setIsSelectionSaved(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-blue-200 bg-blue-50"
                              : "border-transparent bg-slate-50 hover:border-slate-200"
                          }`}
                        >
                          <span className="min-w-0 truncate text-sm font-black text-slate-700">
                            {index + 1}. {prediction.label}
                          </span>
                          <span className={`text-xs font-black ${isSelected ? "text-blue-700" : "text-slate-400"}`}>
                            {prediction.prob.toFixed(1)}%
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => void saveSelectedPrediction()}
                    disabled={!selectedPrediction || !editableMeaning.trim() || isSavingSelection || isSelectionSaved}
                    className={`flex w-full items-center justify-center gap-3 rounded-[24px] px-5 py-4 text-sm font-black text-white shadow-xl transition disabled:opacity-80 ${
                      isSelectionSaved
                        ? "bg-emerald-600 shadow-emerald-100"
                        : "bg-slate-900 shadow-slate-200 hover:bg-blue-600"
                    }`}
                  >
                    {isSavingSelection ? (
                      <>
                        <Loader2 size={19} className="animate-spin" /> Đang lưu video...
                      </>
                    ) : isSelectionSaved ? (
                      <>
                        <CheckCircle2 size={19} /> Đã lưu thành công
                      </>
                    ) : (
                      <>
                        <Save size={19} /> Lưu
                      </>
                    )}
                  </button>
                </motion.div>
              ) : isProcessing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-8 text-center"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-blue-50 border-t-blue-500 rounded-full animate-spin sm:h-32 sm:w-32" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit size={40} className="text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 sm:text-xl">
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
