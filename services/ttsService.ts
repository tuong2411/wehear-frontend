import { api } from "@/services/api";

export class TextToSpeechError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TextToSpeechError";
  }
}

export async function synthesizeVietnameseSpeech(text: string): Promise<Blob> {
  const normalizedText = text.trim().replace(/\s+/g, " ");

  if (!normalizedText) {
    throw new TextToSpeechError("Không có nội dung để đọc.");
  }

  try {
    const response = await api.post<Blob>(
      "/tts",
      { text: normalizedText },
      { responseType: "blob" },
    );

    return response.data;
  } catch {
    const message = "Không thể tạo giọng đọc. Vui lòng kiểm tra cấu hình FPT.AI hoặc thử lại.";
    throw new TextToSpeechError(message);
  }
}
