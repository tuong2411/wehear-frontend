const VSL_TRANSLATION_API_URL = (
  process.env.NEXT_PUBLIC_VSL_TRANSLATION_API_URL ||
  "https://believable-dream-production-fdca.up.railway.app"
).replace(/\/$/, "");

export const MAX_VSL_TRANSLATION_INPUT_LENGTH = 500;
export const VSL_TRANSLATION_MODELS = ["vsl-nano", "vsl-mini", "vsl-nemotron"] as const;
export const DEFAULT_VSL_TRANSLATION_MODEL = "vsl-mini";

export type VslTranslationModel = (typeof VSL_TRANSLATION_MODELS)[number];

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

export function normalizeVslInput(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export async function translateVslToVietnamese(
  text: string,
  modelName: VslTranslationModel = DEFAULT_VSL_TRANSLATION_MODEL,
  signal?: AbortSignal,
): Promise<string> {
  const compactText = normalizeVslInput(text);

  if (!compactText) {
    throw new VslTranslationError("Vui lòng nhập chuỗi từ ký hiệu cần dịch.");
  }

  if (compactText.length > MAX_VSL_TRANSLATION_INPUT_LENGTH) {
    throw new VslTranslationError(
      `Chuỗi ký hiệu không được vượt quá ${MAX_VSL_TRANSLATION_INPUT_LENGTH} ký tự.`,
    );
  }

  let response: Response;
  try {
    response = await fetch(`${VSL_TRANSLATION_API_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: compactText,
        length_penalty: 1.2,
        repetition_penalty: 1.1,
        model_name: modelName,
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new VslTranslationError("Không thể kết nối đến dịch vụ dịch. Vui lòng thử lại.");
  }

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

  const translation = data.translation.trim();
  if (!translation) {
    throw new VslTranslationError("Dịch vụ chưa trả về nội dung dịch.");
  }

  return translation;
}
