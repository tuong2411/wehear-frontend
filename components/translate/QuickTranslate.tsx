"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clipboard,
  History,
  Languages,
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  translateVslToVietnamese,
  VslTranslationError,
} from "@/services/vslTranslationService";

interface TranslationHistoryItem {
  source: string;
  translation: string;
}

const EXAMPLES = [
  "Mèo ăn cá",
  "Biết bơi ai?",
  "Mai tôi đi Sài Gòn làm việc",
];

export default function QuickTranslate() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestControllerRef.current?.abort();
  }, []);

  const handleTranslate = async () => {
    const source = inputText.trim().replace(/\s+/g, " ");
    if (!source || isTranslating) return;

    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsTranslating(true);
    setCopied(false);

    try {
      const result = await translateVslToVietnamese(source, controller.signal);
      setTranslation(result);
      setHistory((current) => [
        { source, translation: result },
        ...current.filter((item) => item.source !== source),
      ].slice(0, 5));
      toast.success("Đã tạo câu tiếng Việt.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      const message = error instanceof VslTranslationError
        ? error.message
        : "Không thể kết nối đến dịch vụ dịch. Vui lòng thử lại.";
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
    setCopied(false);
  };

  const speak = () => {
    if (!translation || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = "vi-VN";
    window.speechSynthesis.speak(utterance);
  };

  const copyTranslation = async () => {
    if (!translation) return;
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Không thể sao chép kết quả.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-5 items-stretch">
        <section className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-7 md:p-9">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
                Đầu vào VSL
              </p>
              <h2 className="text-2xl font-black text-slate-900">Chuỗi từ ký hiệu</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Languages size={24} />
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleTranslate();
              }
            }}
            maxLength={500}
            placeholder="Ví dụ: Biết bơi ai?"
            className="w-full min-h-[220px] resize-none rounded-3xl bg-slate-50 border border-slate-100 px-6 py-5 text-xl font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-400">{inputText.length}/500 ký tự</span>
            <button
              type="button"
              onClick={clearAll}
              disabled={!inputText && !translation}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-rose-500 disabled:opacity-40 transition"
            >
              <Trash2 size={17} /> Xóa
            </button>
          </div>
        </section>

        <div className="flex lg:flex-col items-center justify-center gap-4 py-1">
          <div className="hidden lg:block h-full w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => void handleTranslate()}
            disabled={!inputText.trim() || isTranslating}
            className="shrink-0 flex items-center gap-3 rounded-full bg-blue-600 px-7 py-4 text-white font-black shadow-xl shadow-blue-200 transition hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isTranslating ? (
              <><Loader2 size={21} className="animate-spin" /> Đang dịch</>
            ) : (
              <><span>Dịch câu</span><ArrowRight size={21} /></>
            )}
          </button>
          <div className="hidden lg:block h-full w-px bg-slate-200" />
        </div>

        <section className="relative overflow-hidden bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 p-7 md:p-9 text-slate-900 min-h-[390px]">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative h-full flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
                  Kết quả
                </p>
                <h2 className="text-2xl font-black">Câu tiếng Việt</h2>
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
                  <motion.p
                    key={translation}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-3xl md:text-4xl font-black leading-tight tracking-tight"
                  >
                    {translation}
                  </motion.p>
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
                onClick={speak}
                disabled={!translation}
                aria-label="Đọc kết quả"
                className="p-3.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-30 transition"
              >
                <Volume2 size={21} />
              </button>
              <button
                type="button"
                onClick={() => void copyTranslation()}
                disabled={!translation}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-30 transition"
              >
                {copied ? <Check size={19} className="text-emerald-600" /> : <Clipboard size={19} />}
                {copied ? "Đã chép" : "Sao chép"}
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-7 flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-3 shrink-0">
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
              key={item.source}
              title={item.translation}
              onClick={() => {
                setInputText(item.source);
                setTranslation(item.translation);
              }}
              className="px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-full text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition"
            >
              {item.source}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
