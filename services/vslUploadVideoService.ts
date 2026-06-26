import { api } from "@/services/api";

export interface SavedVslUploadVideo {
  id?: number;
  videoUrl: string;
  selectedLabel: string;
  confidence?: number;
}

export interface VslUploadVideoRecord {
  id: number;
  userId: number;
  videoUrl: string;
  selectedLabel: string;
  confidence?: number | null;
  username?: string;
  userFullName?: string;
  createdAt: string;
  updatedAt: string;
}

interface TrainingDataResponse {
  data?: VslUploadVideoRecord[];
}

export class VslUploadVideoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VslUploadVideoError";
  }
}

export async function saveVslUploadVideo(
  video: File,
  selectedLabel: string,
  confidence?: number,
): Promise<SavedVslUploadVideo> {
  const normalizedLabel = selectedLabel.trim().replace(/\s+/g, " ");

  if (!normalizedLabel) {
    throw new VslUploadVideoError("Vui lòng chọn từ nhận diện trước khi lưu.");
  }

  const formData = new FormData();
  formData.append("video", video);
  formData.append("selectedLabel", normalizedLabel);
  if (typeof confidence === "number") {
    formData.append("confidence", String(confidence));
  }

  try {
    const response = await api.post<SavedVslUploadVideo>("/vsl-upload-videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch {
    throw new VslUploadVideoError("Không thể lưu video lên Cloudinary. Vui lòng thử lại.");
  }
}

export async function getVslUploadVideoTrainingData(limit = 500): Promise<VslUploadVideoRecord[]> {
  const response = await api.get<TrainingDataResponse>("/vsl-upload-videos/training-data", {
    params: { limit },
  });

  return response.data.data || [];
}
