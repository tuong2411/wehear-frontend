"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  HolisticLandmarker,
  HolisticLandmarkerResult,
} from "@mediapipe/tasks-vision";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  Play,
  Save,
  CheckCircle2,
  Settings,
  MoreHorizontal,
  BrainCircuit,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { synthesizeVietnameseSpeech, TextToSpeechError } from "@/services/ttsService";
import { saveVslUploadWord } from "@/services/vslUploadWordStore";

type Landmark = {
  x: number;
  y: number;
  z?: number;
};

type Prediction = {
  label: string;
  prob: number;
};

const FACE_LANDMARKS = [
  0, 17, 61, 291, 78, 308, 13, 14, 80, 81, 82, 310, 311, 312, 87, 88, 95, 402,
  317, 318, 33, 133, 157, 158, 159, 160, 161, 246, 263, 362, 384, 385, 386,
  387, 388, 466, 46, 53, 52, 65, 55, 70, 107, 276, 283, 282, 295, 285, 336,
  300,
];

const FRAME_INTERVAL_MS = 90;
const PREDICTION_COOLDOWN_MS = 2400;
const MIN_CONFIDENCE_PERCENT = 20;
const STABLE_CONFIDENCE_PERCENT = MIN_CONFIDENCE_PERCENT;
const STABLE_PREDICTION_WINDOW = 5;
const STABLE_PREDICTION_MIN_COUNT = 1;
const MAX_WS_BUFFERED_AMOUNT = 512 * 1024;
const EXPECTED_KEYPOINT_LENGTH = 351;
const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const DEFAULT_HOLISTIC_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task";

function getRecognitionWsUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_VSL_RECOGNITION_WS_URL;
  if (explicitUrl) return explicitUrl;

  const apiUrl = process.env.NEXT_PUBLIC_VSL_RECOGNITION_API_URL;
  if (apiUrl) {
    return `${apiUrl.replace(/^http/, "ws").replace(/\/$/, "")}/predict/stream`;
  }

  return "wss://vsl-recognization-production.up.railway.app/predict/stream";
}

function pushLandmarkValues(target: number[], landmark?: Landmark) {
  target.push(landmark?.x ?? 0, landmark?.y ?? 0, landmark?.z ?? 0);
}

function appendLandmarks(
  target: number[],
  landmarks: Landmark[] | undefined,
  count: number,
  indices?: number[],
) {
  for (let i = 0; i < count; i++) {
    const sourceIndex = indices ? indices[i] : i;
    pushLandmarkValues(target, landmarks?.[sourceIndex]);
  }
}

function extractKeypoints(result: HolisticLandmarkerResult) {
  const keypoints: number[] = [];
  const pose = result.poseLandmarks[0];
  const leftHand = result.leftHandLandmarks[0];
  const rightHand = result.rightHandLandmarks[0];
  const face = result.faceLandmarks[0];

  appendLandmarks(keypoints, pose, 25);
  appendLandmarks(keypoints, leftHand, 21);
  appendLandmarks(keypoints, rightHand, 21);
  appendLandmarks(keypoints, face, FACE_LANDMARKS.length, FACE_LANDMARKS);

  return keypoints;
}

export default function LiveTranslate() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const holisticRef = useRef<HolisticLandmarker | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);
  const isAudioEnabledRef = useRef(true);
  const lastFrameAtRef = useRef(0);
  const lastPredictionRef = useRef({ label: "", at: 0 });
  const recentPredictionsRef = useRef<
    { label: string; confidence: number; at: number }[]
  >([]);
  const lowConfidenceStatusTimeoutRef = useRef<number | null>(null);
  const currentResultRef = useRef("");
  const lastDetectionErrorAtRef = useRef(0);

  const [isActive, setIsActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentResult, setCurrentResult] = useState("");
  const [editableResult, setEditableResult] = useState("");
  const [isCurrentResultSaved, setIsCurrentResultSaved] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [engineStatus, setEngineStatus] = useState("Sẵn sàng");
  const [isEngineLoading, setIsEngineLoading] = useState(false);

  useEffect(() => {
    isAudioEnabledRef.current = isAudioEnabled;
  }, [isAudioEnabled]);

  const stopSpeech = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    URL.revokeObjectURL(audioRef.current.src);
    audioRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, force = false) => {
    if ((!force && !isAudioEnabledRef.current) || !text) return;

    try {
      stopSpeech();
      setIsSpeaking(true);

      const audioBlob = await synthesizeVietnameseSpeech(text);
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
  }, [stopSpeech]);

  const initializeHolistic = useCallback(async () => {
    if (holisticRef.current) return holisticRef.current;

    setIsEngineLoading(true);
    setEngineStatus("Đang tải MediaPipe");

    try {
      const { FilesetResolver, HolisticLandmarker } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
      const modelAssetPath =
        process.env.NEXT_PUBLIC_MEDIAPIPE_HOLISTIC_MODEL_URL ||
        DEFAULT_HOLISTIC_MODEL_URL;
      const options = {
        runningMode: "VIDEO" as const,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minHandLandmarksConfidence: 0.5,
      };

      let holistic: HolisticLandmarker;
      try {
        holistic = await HolisticLandmarker.createFromOptions(vision, {
          ...options,
          baseOptions: {
            modelAssetPath,
            delegate: "GPU",
          },
        });
      } catch (error) {
        console.warn("MediaPipe GPU delegate failed, falling back to CPU.", error);
        setEngineStatus("Đang tải MediaPipe bằng CPU");
        holistic = await HolisticLandmarker.createFromOptions(vision, {
          ...options,
          baseOptions: {
            modelAssetPath,
            delegate: "CPU",
          },
        });
      }

      holisticRef.current = holistic;
      return holistic;
    } finally {
      setIsEngineLoading(false);
    }
  }, []);

  const stopLiveRecognition = useCallback(() => {
    isActiveRef.current = false;

    if (lowConfidenceStatusTimeoutRef.current !== null) {
      window.clearTimeout(lowConfidenceStatusTimeoutRef.current);
      lowConfidenceStatusTimeoutRef.current = null;
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    stopSpeech();
    setIsActive(false);
    setIsAnalyzing(false);
    recentPredictionsRef.current = [];
    lastPredictionRef.current = { label: "", at: 0 };
    currentResultRef.current = "";
    setCurrentResult("");
    setEditableResult("");
    setIsCurrentResultSaved(false);
    setEngineStatus("Sẵn sàng");
  }, [stopSpeech]);

  const handlePredictionMessage = useCallback(
    (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as {
          predictions?: Prediction[];
          error?: string;
        };

        if (payload.error) {
          setEngineStatus(payload.error);
          return;
        }

        const topPrediction = payload.predictions?.[0];
        if (!topPrediction?.label) return;

        const confidence = Number(topPrediction.prob ?? 0);
        const label = topPrediction.label.trim();
        const now = Date.now();
        const previous = lastPredictionRef.current;

        if (confidence < MIN_CONFIDENCE_PERCENT) {
          recentPredictionsRef.current = [];
          lastPredictionRef.current = { label: "", at: 0 };
          currentResultRef.current = "";
          setCurrentResult("");
          setEditableResult("");
          setIsCurrentResultSaved(false);
          setIsAnalyzing(false);
          if (lowConfidenceStatusTimeoutRef.current !== null) {
            window.clearTimeout(lowConfidenceStatusTimeoutRef.current);
            lowConfidenceStatusTimeoutRef.current = null;
          }
          setEngineStatus("Vui lòng thực hiện lại động tác");
          lowConfidenceStatusTimeoutRef.current = window.setTimeout(() => {
            if (!isActiveRef.current) return;
            setEngineStatus("Đang nhận diện");
            lowConfidenceStatusTimeoutRef.current = null;
          }, 1400);
          return;
        }

        setIsAnalyzing(false);

        if (currentResultRef.current !== label) {
          currentResultRef.current = label;
          setCurrentResult(label);
          setEditableResult(label);
          setIsCurrentResultSaved(false);
        }

        recentPredictionsRef.current = [
          ...recentPredictionsRef.current,
          { label, confidence, at: now },
        ].slice(-STABLE_PREDICTION_WINDOW);

        const stablePredictions = recentPredictionsRef.current.filter(
          (prediction) => prediction.confidence >= STABLE_CONFIDENCE_PERCENT,
        );
        const stableCount = stablePredictions.filter(
          (prediction) => prediction.label === label,
        ).length;

        if (stableCount < STABLE_PREDICTION_MIN_COUNT) {
          setEngineStatus(`Đang kiểm tra kết quả ${Math.round(confidence)}%`);
          return;
        }

        if (previous.label === label && now - previous.at < PREDICTION_COOLDOWN_MS) {
          return;
        }

        setEngineStatus(`Nhận diện ${Math.round(confidence)}%`);
        if (lowConfidenceStatusTimeoutRef.current !== null) {
          window.clearTimeout(lowConfidenceStatusTimeoutRef.current);
          lowConfidenceStatusTimeoutRef.current = null;
        }
        lowConfidenceStatusTimeoutRef.current = window.setTimeout(() => {
          if (!isActiveRef.current) return;
          setEngineStatus("Đang nhận diện");
          lowConfidenceStatusTimeoutRef.current = null;
        }, 1400);

        lastPredictionRef.current = { label, at: now };
        setTranscript((prev) => [...prev, label].slice(-10));
        void speak(label);
      } catch {
        setEngineStatus("Phản hồi AI không hợp lệ");
      }
    },
    [speak],
  );

  const drawMirroredFrame = useCallback((video: HTMLVideoElement) => {
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.save();
    context.clearRect(0, 0, width, height);
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);
    context.restore();

    return canvas;
  }, []);

  const startFrameLoop = useCallback(() => {
    const processFrame = (timestamp: number) => {
      if (!isActiveRef.current) return;

      animationFrameRef.current = requestAnimationFrame(processFrame);

      if (timestamp - lastFrameAtRef.current < FRAME_INTERVAL_MS) return;
      lastFrameAtRef.current = timestamp;

      const video = videoRef.current;
      const holistic = holisticRef.current;
      const socket = wsRef.current;

      if (
        !video ||
        !holistic ||
        !socket ||
        socket.readyState !== WebSocket.OPEN ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        return;
      }

      if (socket.bufferedAmount > MAX_WS_BUFFERED_AMOUNT) {
        setEngineStatus("Đang chờ server xử lý");
        return;
      }

      const frame = drawMirroredFrame(video);
      if (!frame) return;

      try {
        const result = holistic.detectForVideo(frame, timestamp);
        const keypoints = extractKeypoints(result);

        if (keypoints.length !== EXPECTED_KEYPOINT_LENGTH) {
          setEngineStatus(`Sai số keypoint: ${keypoints.length}`);
          return;
        }

        socket.send(JSON.stringify({ keypoints }));
        setIsAnalyzing(true);
      } catch (error) {
        const now = Date.now();
        if (now - lastDetectionErrorAtRef.current > 3000) {
          lastDetectionErrorAtRef.current = now;
          setEngineStatus("Không trích xuất được keypoints");
          console.error(error);
        }
      }
    };

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [drawMirroredFrame]);

  const startLiveRecognition = useCallback(async () => {
    try {
      currentResultRef.current = "";
      recentPredictionsRef.current = [];
      lastPredictionRef.current = { label: "", at: 0 };
      setCurrentResult("");
      setEditableResult("");
      setIsCurrentResultSaved(false);
      setEngineStatus("Đang mở camera");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false,
      });

      if (!videoRef.current) {
        throw new Error("Video element is not ready");
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      isActiveRef.current = true;
      setIsActive(true);

      await initializeHolistic();

      const socket = new WebSocket(getRecognitionWsUrl());
      wsRef.current = socket;
      setEngineStatus("Đang kết nối AI");

      socket.onopen = () => {
        setEngineStatus("Đang nhận diện");
        setIsAnalyzing(true);
        startFrameLoop();
      };

      socket.onmessage = handlePredictionMessage;

      socket.onerror = () => {
        setEngineStatus("Không kết nối được AI");
        toast.error("Không kết nối được server nhận diện VSL.");
      };

      socket.onclose = () => {
        if (!isActiveRef.current) return;
        setEngineStatus("Mất kết nối AI");
        setIsAnalyzing(false);
      };

      toast.success("Đã kết nối Camera và AI engine");
    } catch (error) {
      console.error(error);
      stopLiveRecognition();
      toast.error(
        "Không thể khởi động dịch live. Vui lòng kiểm tra Camera, mạng hoặc model AI.",
      );
    }
  }, [
    handlePredictionMessage,
    initializeHolistic,
    startFrameLoop,
    stopLiveRecognition,
  ]);

  const toggleCamera = async () => {
    if (isActive) {
      stopLiveRecognition();
      return;
    }

    await startLiveRecognition();
  };

  const saveCurrentResult = () => {
    const word = editableResult.trim();
    if (!word) return;

    saveVslUploadWord(word);
    setIsCurrentResultSaved(true);
    toast.success("Đã lưu từ.");
  };

  useEffect(() => {
    return () => {
      stopLiveRecognition();
      stopSpeech();
      holisticRef.current?.close();
      holisticRef.current = null;
    };
  }, [stopLiveRecognition, stopSpeech]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative bg-slate-900 rounded-[48px] overflow-hidden aspect-video shadow-2xl ring-8 ring-white group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!isActive ? "hidden" : "block"}`}
            />

            {!isActive && (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                  <Camera size={40} className="text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-400">Camera đang tắt</p>
                  <p className="text-sm font-bold text-slate-600 mt-2">
                    Nhấn &quot;Bắt đầu dịch&quot; để kích hoạt AI
                  </p>
                </div>
              </div>
            )}

            <AnimatePresence>
              {currentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
                >
                  <div className="bg-black/40 backdrop-blur-xl px-10 py-5 rounded-[32px] border border-white/20 shadow-2xl">
                    <p className="text-3xl md:text-4xl font-black text-white tracking-tight text-center">
                      {currentResult}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-8 left-8 flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border ${
                  isActive
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "bg-white/10 border-white/10 text-white/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive ? "bg-emerald-500 animate-ping" : "bg-slate-500"
                  }`}
                />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isActive ? "Live" : "Offline"}
                </span>
              </div>
              {(isAnalyzing || isEngineLoading) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full backdrop-blur-md text-blue-400">
                  <BrainCircuit size={14} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    AI Processing
                  </span>
                </div>
              )}
            </div>

            <div className="absolute top-8 right-8 max-w-[240px] px-4 py-2 bg-white/10 border border-white/10 rounded-full backdrop-blur-md text-white/70">
              <p className="truncate text-[10px] font-black uppercase tracking-widest">
                {engineStatus}
              </p>
            </div>

            <div className="absolute bottom-8 right-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-4 rounded-3xl transition-all ${
                  isAudioEnabled ? "bg-white text-slate-900" : "bg-rose-500 text-white"
                }`}
              >
                {isSpeaking ? <Loader2 size={24} className="animate-spin" /> : isAudioEnabled ? <Volume2 size={24} /> : <MicOff size={24} />}
              </button>
              <button className="p-4 bg-white/20 backdrop-blur-md text-white rounded-3xl hover:bg-white/30 transition-all">
                <Settings size={24} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <button
                onClick={toggleCamera}
                disabled={isEngineLoading}
                className={`flex items-center gap-3 px-10 py-5 rounded-[32px] font-black text-lg transition-all shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 ${
                  isActive
                    ? "bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600"
                    : "bg-slate-900 text-white shadow-slate-200 hover:bg-blue-600"
                }`}
              >
                {isActive ? (
                  <>
                    <CameraOff size={24} /> Dừng phiên dịch
                  </>
                ) : (
                  <>
                    <Play size={24} /> Bắt đầu dịch
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                  <Mic size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Âm thanh đầu ra
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {isAudioEnabled ? "Tự động phát âm thanh" : "Đã tắt tiếng"}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm font-bold text-slate-400">
              Nhật ký được giữ trong phiên hiện tại
            </div>
          </div>
          <div className="hidden">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                  Kết quả hiện tại
                </p>
                <h3 className="mt-1 text-base font-black text-slate-900">Chỉnh sửa và lưu từ</h3>
              </div>
              {isCurrentResultSaved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  <CheckCircle2 size={14} /> Đã lưu
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-stretch">
              <textarea
                value={editableResult}
                onChange={(event) => {
                  setEditableResult(event.target.value);
                  setIsCurrentResultSaved(false);
                }}
                disabled={!currentResult}
                placeholder="Kết quả realtime sẽ hiện tại đây"
                className="min-h-[88px] w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 disabled:text-slate-400"
              />
              <button
                type="button"
                onClick={() => void speak(editableResult, true)}
                disabled={!editableResult.trim() || isSpeaking}
                aria-label="Đọc từ đang chỉnh"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 sm:h-auto sm:w-12"
              >
                {isSpeaking ? <Loader2 size={19} className="animate-spin" /> : <Volume2 size={19} />}
              </button>
              <button
                type="button"
                onClick={saveCurrentResult}
                disabled={!editableResult.trim() || isCurrentResultSaved}
                aria-label="Lưu từ đang chỉnh"
                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black text-white transition disabled:opacity-70 sm:h-auto sm:w-auto ${
                  isCurrentResultSaved ? "bg-emerald-600" : "bg-slate-900 hover:bg-blue-600"
                }`}
              >
                {isCurrentResultSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                Lưu
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-full">
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <MessageSquare size={24} className="text-rose-500" /> Nhật ký hội
                thoại
              </h3>
              <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black">
                LIVE
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar flex flex-col-reverse">
              <AnimatePresence initial={false}>
                {transcript
                  .slice()
                  .reverse()
                  .map((text, i) => {
                    const isLatest = i === 0;
                    return (
                    <motion.div
                      key={transcript.length - i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-50 p-5 rounded-[28px] border border-slate-100 group relative"
                    >
                      {isLatest ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                              Mới nhất
                            </span>
                            {isCurrentResultSaved && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
                                <CheckCircle2 size={13} /> Đã lưu
                              </span>
                            )}
                          </div>
                          <textarea
                            value={editableResult}
                            onChange={(event) => {
                              setEditableResult(event.target.value);
                              setIsCurrentResultSaved(false);
                            }}
                            className="min-h-[92px] w-full resize-none rounded-2xl border border-slate-100 bg-white px-4 py-3 text-lg font-black leading-tight text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => void speak(editableResult, true)}
                              disabled={!editableResult.trim() || isSpeaking}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white text-sm font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"
                            >
                              {isSpeaking ? <Loader2 size={17} className="animate-spin" /> : <Volume2 size={17} />}
                              Nghe
                            </button>
                            <button
                              type="button"
                              onClick={saveCurrentResult}
                              disabled={!editableResult.trim() || isCurrentResultSaved}
                              className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-black text-white transition disabled:opacity-70 ${
                                isCurrentResultSaved ? "bg-emerald-600" : "bg-slate-900 hover:bg-blue-600"
                              }`}
                            >
                              {isCurrentResultSaved ? <CheckCircle2 size={17} /> : <Save size={17} />}
                              Lưu
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-slate-800 text-lg leading-tight pr-16">
                            {text}
                          </p>
                          <div className="absolute top-5 right-5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void speak(text, true)}
                              disabled={isSpeaking}
                              className="text-slate-300 transition-colors hover:text-blue-500 disabled:opacity-40"
                            >
                              {isSpeaking ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                saveVslUploadWord(text);
                                toast.success("Đã lưu từ.");
                              }}
                              className="text-slate-300 transition-colors hover:text-emerald-500"
                            >
                              <Save size={17} />
                            </button>
                          </div>
                        </>
                      )}
                      <span className="text-[10px] font-black text-slate-300 uppercase mt-2 block tracking-tighter">
                        {new Date().toLocaleTimeString("vi-VN")} - AI RECOGNIZED
                      </span>
                    </motion.div>
                    );
                  })}
              </AnimatePresence>

              {transcript.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4 opacity-30">
                  <MoreHorizontal size={48} className="text-slate-400" />
                  <p className="text-sm font-bold text-slate-400">
                    Hội thoại sẽ được ghi lại tại đây theo thời gian thực
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                <BrainCircuit size={24} className="text-blue-500 flex-shrink-0" />
                <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                  Hệ thống trích xuất 351 keypoints trên trình duyệt rồi stream
                  tới model nhận diện VSL theo thời gian thực.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
