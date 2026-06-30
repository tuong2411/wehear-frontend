"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  History,
  Languages,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  DEFAULT_VSL_TRANSLATION_MODEL,
  MAX_VSL_TRANSLATION_INPUT_LENGTH,
  VSL_TRANSLATION_MODELS,
  type VslTranslationModel,
  normalizeVslInput,
  translateVslToVietnamese,
  VslTranslationError,
} from "@/services/vslTranslationService";
import { synthesizeVietnameseSpeech, TextToSpeechError } from "@/services/ttsService";
import {
  getMyVslTranslationCorrections,
  saveVslTranslationCorrection,
  type VslTranslationCorrection,
} from "@/services/vslCorrectionService";
import {
  clearSavedVslUploadWords,
  getSavedVslUploadWords,
  VSL_UPLOAD_WORDS_UPDATED_EVENT,
} from "@/services/vslUploadWordStore";

interface TranslationHistoryItem {
  source: string;
  translation: string;
  modelName: VslTranslationModel;
}

const EXAMPLES = [
  "Mèo ăn cá",
  "Biết bơi ai?",
  "Mai tôi đi Sài Gòn làm việc",
];

export default function QuickTranslate() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [editableTranslation, setEditableTranslation] = useState("");
  const [lastTranslatedSource, setLastTranslatedSource] = useState("");
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [savedUploadWords, setSavedUploadWords] = useState<string[]>([]);
  const [savedCorrections, setSavedCorrections] = useState<VslTranslationCorrection[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<VslTranslationModel>(DEFAULT_VSL_TRANSLATION_MODEL);
  const requestControllerRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const normalizedInput = normalizeVslInput(inputText);
  const canTranslate = Boolean(normalizedInput) && !isTranslating;

  const loadSavedCorrections = useCallback(async () => {
    if (!localStorage.getItem("token")) return;

    setIsLoadingSaved(true);
    try {
      const data = await getMyVslTranslationCorrections();
      setSavedCorrections(data);
    } catch {
      toast.error("Không thể tải danh sách đã lưu.");
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem("token"));
    setIsAuthenticated(hasToken);
    if (hasToken) void loadSavedCorrections();
    setSavedUploadWords(getSavedVslUploadWords());

    const handleSavedUploadWordsUpdated = () => {
      setSavedUploadWords(getSavedVslUploadWords());
    };

    window.addEventListener(VSL_UPLOAD_WORDS_UPDATED_EVENT, handleSavedUploadWordsUpdated);

    return () => {
      window.removeEventListener(VSL_UPLOAD_WORDS_UPDATED_EVENT, handleSavedUploadWordsUpdated);
      requestControllerRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [loadSavedCorrections]);

  const resetCurrentTranslation = () => {
    setTranslation("");
    setEditableTranslation("");
    setLastTranslatedSource("");
    setCopied(false);
    setErrorMessage("");
  };

  const appendSavedUploadWord = (word: string) => {
    const nextInput = normalizeVslInput(`${inputText} ${word}`);
    setInputText(nextInput);
    resetCurrentTranslation();
  };

  const useAllSavedUploadWords = () => {
    const nextInput = normalizeVslInput(savedUploadWords.join(" "));
    setInputText(nextInput);
    resetCurrentTranslation();
  };

  const clearSavedUploadWords = () => {
    clearSavedVslUploadWords();
    setSavedUploadWords([]);
    toast.success("Đã xóa danh sách từ lưu từ video.");
  };

  const handleTranslate = async () => {
    const source = normalizeVslInput(inputText);
    if (!source || isTranslating) return;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsTranslating(true);
    setCopied(false);
    setErrorMessage("");
    setTranslation("");

    try {
      const result = await translateVslToVietnamese(source, selectedModel, controller.signal);
      setTranslation(result);
      setEditableTranslation(result);
      setLastTranslatedSource(source);
      setHistory((current) => [
        { source, translation: result, modelName: selectedModel },
        ...current.filter((item) => !(item.source === source && item.modelName === selectedModel)),
      ].slice(0, 5));
      toast.success("Đã tạo câu tiếng Việt.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      const message = error instanceof VslTranslationError
        ? error.message
        : "Không thể kết nối đến dịch vụ dịch. Vui lòng thử lại.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsTranslating(false);
      }
    }
  };

  const clearAll = () => {
    requestControllerRef.current?.abort();
    setInputText("");
    setTranslation("");
    setEditableTranslation("");
    setLastTranslatedSource("");
    setCopied(false);
    setErrorMessage("");
  };

  const speak = async () => {
    const textToSpeak = normalizeVslInput(editableTranslation || translation);
    if (!textToSpeak || isSpeaking) return;

    setIsSpeaking(true);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }

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
  };

  const copyTranslation = async () => {
    const textToCopy = normalizeVslInput(editableTranslation || translation);
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
      toast.success("Đã sao chép kết quả.");
    } catch {
      toast.error("Không thể sao chép kết quả.");
    }
  };

  const saveCorrection = async () => {
    const correctedTranslation = normalizeVslInput(editableTranslation);
    if (!lastTranslatedSource || !translation || !correctedTranslation || isSavingCorrection) return;

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu kết quả.");
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login?returnUrl=${returnUrl}`;
      return;
    }

    setIsSavingCorrection(true);
    try {
      await saveVslTranslationCorrection({
        sourceText: lastTranslatedSource,
        modelName: selectedModel,
        modelTranslation: translation,
        correctedTranslation,
      });
      await loadSavedCorrections();
      toast.success("Đã lưu kết quả.");
    } catch {
      toast.error("Không thể lưu bản chỉnh sửa. Vui lòng đăng nhập và thử lại.");
    } finally {
      setIsSavingCorrection(false);
    }
  };

  const applySavedCorrection = (item: VslTranslationCorrection) => {
    setInputText(item.sourceText);
    setSelectedModel(item.modelName);
    setTranslation(item.modelTranslation);
    setEditableTranslation(item.correctedTranslation);
    setLastTranslatedSource(item.sourceText);
    setCopied(false);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div
        className={`grid grid-cols-1 gap-4 items-stretch sm:gap-5 ${
          isSavedPanelOpen
            ? "xl:grid-cols-[minmax(0,1.05fr)_auto_minmax(0,1.05fr)_300px]"
            : "xl:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1.2fr)_76px]"
        }`}
      >
        <section className="bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 sm:rounded-[40px] sm:p-7 md:p-9">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
                Đầu vào VSL
              </p>
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Chuỗi từ ký hiệu</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Languages size={24} />
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(event) => {
              setInputText(event.target.value);
              if (translation) {
                setTranslation("");
                setEditableTranslation("");
                setLastTranslatedSource("");
              }
              if (errorMessage) setErrorMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleTranslate();
              }
            }}
            maxLength={MAX_VSL_TRANSLATION_INPUT_LENGTH}
            placeholder="Ví dụ: Biết bơi ai?"
            className="w-full min-h-[180px] resize-none rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4 text-base font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 sm:min-h-[220px] sm:rounded-3xl sm:px-6 sm:py-5 sm:text-xl"
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                Model dịch
              </span>
              <select
                value={selectedModel}
                disabled={isTranslating}
                onChange={(event) => {
                  setSelectedModel(event.target.value as VslTranslationModel);
                  setTranslation("");
                  setEditableTranslation("");
                  setLastTranslatedSource("");
                  setCopied(false);
                  if (errorMessage) setErrorMessage("");
                }}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 disabled:opacity-60"
              >
                {VSL_TRANSLATION_MODELS.map((modelName) => (
                  <option key={modelName} value={modelName}>
                    {modelName}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span className="text-xs font-bold text-slate-400">
                {inputText.length}/{MAX_VSL_TRANSLATION_INPUT_LENGTH} ký tự
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={!inputText && !translation && !errorMessage}
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 disabled:opacity-40 transition"
              >
                <Trash2 size={17} /> Xóa
              </button>
            </div>
          </div>
          {errorMessage && (
            <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
              {errorMessage}
            </p>
          )}
        </section>

        <div className="flex xl:flex-col items-center justify-center gap-4 py-1">
          <div className="hidden xl:block h-full w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => void handleTranslate()}
            disabled={!canTranslate}
            className="shrink-0 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-white font-black shadow-xl shadow-blue-200 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 sm:w-auto sm:rounded-full sm:px-7 sm:hover:scale-105 disabled:hover:scale-100"
          >
            {isTranslating ? (
              <><Loader2 size={21} className="animate-spin" /> Đang dịch</>
            ) : (
              <><span>Dịch câu</span><ArrowRight size={21} /></>
            )}
          </button>
          <div className="hidden xl:block h-full w-px bg-slate-200" />
        </div>

        <section className="relative overflow-hidden bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 text-slate-900 min-h-[340px] sm:rounded-[40px] sm:p-7 md:p-9 sm:min-h-[390px]">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative h-full flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
                  Kết quả
                </p>
                <h2 className="text-xl font-black sm:text-2xl">Câu tiếng Việt</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Sparkles size={24} />
              </div>
            </div>

            <div className="flex-1 flex items-center">
              <AnimatePresence mode="wait">
                {isTranslating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center text-center gap-5 text-slate-400"
                  >
                    <BrainCircuit size={48} className="text-blue-400 animate-pulse" />
                    <p className="font-bold">Mô hình đang sắp xếp và hoàn thiện câu...</p>
                  </motion.div>
                ) : translation ? (
                  <motion.div
                    key={translation}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full space-y-3"
                  >
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Chỉnh sửa kết quả trước khi lưu
                    </label>
                    <textarea
                      value={editableTranslation}
                      onChange={(event) => setEditableTranslation(event.target.value)}
                      className="w-full min-h-[150px] resize-none rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4 text-xl font-black leading-tight text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 sm:min-h-[170px] sm:rounded-3xl sm:px-6 sm:py-5 sm:text-2xl md:text-3xl"
                    />
                    {editableTranslation.trim() !== translation.trim() && (
                      <p className="text-xs font-bold text-emerald-600">
                        Bạn đã chỉnh sửa câu này. Bấm lưu để dùng lại sau.
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full text-center text-slate-500"
                  >
                    <RotateCcw size={44} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">Câu hoàn chỉnh sẽ hiển thị tại đây</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-7 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => void speak()}
                disabled={!translation || isSpeaking}
                aria-label="Đọc kết quả"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-30 transition"
              >
                {isSpeaking ? <Loader2 size={21} strokeWidth={2.8} className="animate-spin" /> : <Volume2 size={21} strokeWidth={2.8} />}
              </button>
              <button
                type="button"
                onClick={() => void copyTranslation()}
                disabled={!translation}
                aria-label="Sao chép kết quả"
                title={copied ? "Đã chép" : "Sao chép"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-30 transition"
              >
                {copied ? <Check size={19} strokeWidth={2.8} className="text-emerald-600" /> : <Clipboard size={19} strokeWidth={2.8} />}
              </button>
              <button
                type="button"
                onClick={() => void saveCorrection()}
                disabled={!translation || !editableTranslation.trim() || isSavingCorrection}
                aria-label={isAuthenticated ? "Lưu kết quả" : "Đăng nhập để lưu"}
                title={isAuthenticated ? "Lưu kết quả" : "Đăng nhập để lưu"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 hover:bg-slate-100 hover:text-emerald-600 disabled:opacity-30 transition"
              >
                {isSavingCorrection ? <Loader2 size={19} strokeWidth={2.8} className="animate-spin" /> : <Save size={19} strokeWidth={2.8} />}
              </button>
            </div>
          </div>
        </section>

        <SavedCorrectionsPanel
          items={savedCorrections}
          isAuthenticated={isAuthenticated}
          isLoading={isLoadingSaved}
          isOpen={isSavedPanelOpen}
          onToggle={() => setIsSavedPanelOpen((current) => !current)}
          onRefresh={() => void loadSavedCorrections()}
          onApply={applySavedCorrection}
        />
      </div>

      <section className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5 md:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600">
                Video upload
              </p>
              <h3 className="mt-1 text-base font-black text-slate-900">Từ đã lưu</h3>
            </div>
            {savedUploadWords.length > 0 && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                {savedUploadWords.length} từ
              </span>
            )}
          </div>

          {savedUploadWords.length > 0 && (
            <div className="space-y-4">
              <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                {savedUploadWords.map((word) => (
                  <button
                    type="button"
                    key={word}
                    onClick={() => appendSavedUploadWord(word)}
                    title="Thêm từ này vào chuỗi VSL"
                    className="rounded-2xl border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-black text-indigo-800 transition hover:border-indigo-200 hover:bg-indigo-100"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={useAllSavedUploadWords}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-600"
                >
                  Dùng tất cả
                </button>
                <button
                  type="button"
                  onClick={clearSavedUploadWords}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600"
                >
                  Xóa danh sách
                </button>
              </div>
            </div>
          )}

          {savedUploadWords.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-bold text-slate-400">
                Chưa có từ nào được lưu từ video upload.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5 md:p-6">
          <div className="mb-4 flex items-center gap-3">
            <History size={19} className="text-blue-600" />
            <span className="text-sm font-black text-slate-700">Dùng thử nhanh</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
          {EXAMPLES.map((example) => (
            <button
              type="button"
              key={example}
              onClick={() => setInputText(example)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-full text-sm font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
            >
              {example}
            </button>
          ))}
          {history.map((item) => (
            <button
              type="button"
              key={`${item.modelName}:${item.source}`}
              title={`${item.modelName}: ${item.translation}`}
              onClick={() => {
                setInputText(item.source);
                setTranslation(item.translation);
                setEditableTranslation(item.translation);
                setLastTranslatedSource(item.source);
                setSelectedModel(item.modelName);
              }}
              className="px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition"
            >
              {item.source}
              <span className="ml-2 text-[10px] uppercase opacity-60">{item.modelName}</span>
            </button>
          ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function SavedCorrectionsPanel({
  items,
  isAuthenticated,
  isLoading,
  isOpen,
  onToggle,
  onRefresh,
  onApply,
}: {
  items: VslTranslationCorrection[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  onApply: (item: VslTranslationCorrection) => void;
}) {
  if (!isOpen) {
    return (
      <aside className="rounded-[28px] border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/40 text-slate-900 xl:min-h-[390px]">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Mở câu đã lưu"
          title="Mở câu đã lưu"
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50 xl:h-full xl:flex-col xl:justify-center xl:px-3 xl:py-4"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <ChevronLeft size={20} strokeWidth={2.8} />
          </span>
          <span className="min-w-0 flex-1 xl:flex-none xl:[writing-mode:vertical-rl] xl:rotate-180">
            <span className="block text-sm font-black text-slate-900">Câu đã lưu</span>
            <span className="mt-1 block text-xs font-bold text-slate-400 xl:hidden">
              {isAuthenticated ? `${items.length} câu` : "Đăng nhập để xem"}
            </span>
          </span>
          {isAuthenticated && items.length > 0 && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 xl:px-2">
              {items.length}
            </span>
          )}
        </button>
      </aside>
    );
  }

  return (
    <section className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 text-slate-900 min-h-[390px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
            Câu của tôi
          </p>
          <h3 className="text-base font-black text-slate-900">Câu đã lưu</h3>
        </div>
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Thu gọn câu đã lưu"
          title="Thu gọn"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <ChevronRight size={17} />
        </button>
        {isAuthenticated && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Làm mới câu đã lưu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={17} className="animate-spin" /> : <RotateCcw size={17} />}
          </button>
        )}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="flex min-h-[290px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
          <p className="text-sm font-bold leading-6 text-slate-500">Đăng nhập để xem lại những câu bạn đã lưu.</p>
        </div>
      ) : isLoading ? (
        <div className="flex min-h-[290px] items-center justify-center gap-3 rounded-2xl bg-slate-50 text-sm font-bold text-slate-500">
          <Loader2 size={18} className="animate-spin text-blue-600" />
          Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[290px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
          <p className="text-sm font-bold leading-6 text-slate-500">Bạn chưa lưu câu nào.</p>
        </div>
      ) : (
        <div className="max-h-[310px] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onApply(item)}
              title={item.correctedTranslation}
              className="block w-full rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <p className="line-clamp-3 text-sm font-black leading-5 text-slate-800">
                {item.correctedTranslation}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
