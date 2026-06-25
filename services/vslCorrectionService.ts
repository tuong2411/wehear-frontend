import { api } from "@/services/api";
import type { VslTranslationModel } from "@/services/vslTranslationService";

export interface VslTranslationCorrectionPayload {
  sourceText: string;
  modelName: VslTranslationModel;
  modelTranslation: string;
  correctedTranslation: string;
}

export interface VslTranslationCorrection {
  id: number;
  userId: number;
  username?: string;
  userFullName?: string;
  sourceText: string;
  modelName: VslTranslationModel;
  modelTranslation: string;
  correctedTranslation: string;
  createdAt: string;
  updatedAt: string;
}

export async function saveVslTranslationCorrection(payload: VslTranslationCorrectionPayload) {
  const response = await api.post("/vsl-translation-corrections", payload);
  return response.data;
}

export async function getMyVslTranslationCorrections(): Promise<VslTranslationCorrection[]> {
  const response = await api.get("/vsl-translation-corrections/my");
  return response.data.data || [];
}

export async function getVslTranslationTrainingData(limit = 500): Promise<VslTranslationCorrection[]> {
  const response = await api.get("/vsl-translation-corrections/training-data", {
    params: { limit },
  });
  return response.data.data || [];
}
