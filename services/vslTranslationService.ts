const VSL_TRANSLATION_API_URL = (
  process.env.NEXT_PUBLIC_VSL_TRANSLATION_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

interface TranslationResponse {
  translation: string;
}

interface ApiErrorResponse {
  detail?: string;
}

export class VslTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VslTranslationError";
  }
}

export async function translateVslToVietnamese(
  text: string,
  signal?: AbortSignal,
): Promise<string> {
  const compactText = text.trim().replace(/\s+/g, " ");

  if (!compactText) {
    throw new VslTranslationError("Vui lòng nhập chuỗi từ ký hiệu cần dịch.");
  }

  // Model expects tokenized sentence-ending punctuation: "nội dung ."
  const normalizedText = `${compactText.replace(/\s*[.!?]+\s*$/, "")} .`;

  const response = await fetch(`${VSL_TRANSLATION_API_URL}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: normalizedText }),
    signal,
  });

  if (!response.ok) {
    let message = `Dịch vụ dịch trả về lỗi ${response.status}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody.detail) message = errorBody.detail;
    } catch {
      // The server may return an empty or non-JSON error response.
    }

    throw new VslTranslationError(message);
  }

  const data = (await response.json()) as Partial<TranslationResponse>;
  if (typeof data.translation !== "string") {
    throw new VslTranslationError("Phản hồi từ dịch vụ dịch không hợp lệ.");
  }

  return data.translation.trim();
}
