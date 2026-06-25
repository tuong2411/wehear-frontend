const VSL_RECOGNITION_VIDEO_ENDPOINT =
  process.env.NEXT_PUBLIC_VSL_RECOGNITION_VIDEO_ENDPOINT ||
  "/api/vsl-recognition/video";

export const MAX_VSL_VIDEO_UPLOAD_SIZE = 50 * 1024 * 1024;

export type VslPrediction = {
  label: string;
  prob: number;
};

type RecognitionResponse = {
  predictions?: VslPrediction[];
};

type ApiErrorResponse = {
  detail?: string;
};

export class VslRecognitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VslRecognitionError";
  }
}

export async function predictVslVideo(
  video: File,
  signal?: AbortSignal,
): Promise<VslPrediction[]> {
  if (!video.type.startsWith("video/")) {
    throw new VslRecognitionError("Vui lòng chọn tệp video.");
  }

  if (video.size > MAX_VSL_VIDEO_UPLOAD_SIZE) {
    throw new VslRecognitionError("Video không được vượt quá 50MB.");
  }

  const formData = new FormData();
  formData.append("video", video);

  let response: Response;
  try {
    response = await fetch(VSL_RECOGNITION_VIDEO_ENDPOINT, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new VslRecognitionError(
      "Không thể kết nối đến server nhận diện VSL. Vui lòng thử lại.",
    );
  }

  if (!response.ok) {
    let message = `Server nhận diện trả về lỗi ${response.status}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody.detail) message = errorBody.detail;
    } catch {
      // The API may return a non-JSON error body.
    }

    throw new VslRecognitionError(message);
  }

  const data = (await response.json()) as RecognitionResponse;
  const predictions = data.predictions ?? [];

  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new VslRecognitionError("Server chưa trả về kết quả nhận diện.");
  }

  return predictions
    .filter((prediction) => typeof prediction.label === "string")
    .map((prediction) => ({
      label: prediction.label.trim(),
      prob: Number(prediction.prob ?? 0),
    }))
    .filter((prediction) => prediction.label);
}
