import { api } from "./api";
import { SignDictionary } from "@/types/dictionary";

export interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

export const dictionaryService = {
  getAllSigns: async (page = 0, size = 40, search = "", region = "all"): Promise<PaginatedResponse<SignDictionary>> => {
    let url = `/dictionary?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (region && region !== "all") url += `&region=${encodeURIComponent(region)}`;
    
    const response = await api.get<PaginatedResponse<SignDictionary>>(url);
    return response.data;
  },

  getSignById: async (id: number): Promise<SignDictionary> => {
    const response = await api.get<SignDictionary>(`/dictionary/${id}`);
    return response.data;
  },

  createSign: async (data: Partial<SignDictionary>): Promise<string> => {
    const response = await api.post("/dictionary", data);
    return response.data;
  },

  updateSign: async (id: number, data: Partial<SignDictionary>): Promise<string> => {
    const response = await api.put(`/dictionary/${id}`, data);
    return response.data;
  },

  deleteSign: async (id: number): Promise<string> => {
    const response = await api.delete(`/dictionary/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, active: boolean): Promise<string> => {
    const response = await api.put(`/dictionary/${id}/status?active=${active}`);
    return response.data;
  },

  uploadMedia: async (id: number, file: File, type = "VIDEO"): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    
    const response = await api.post(`/dictionary/${id}/upload-media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  bulkAction: async (ids: number[], action: string): Promise<string> => {
    const response = await api.post("/dictionary/bulk-action", { ids, action });
    return response.data;
  },

  importDataset: async (): Promise<unknown> => {
    const response = await api.post("/dictionary/import");
    return response.data;
  }
};
