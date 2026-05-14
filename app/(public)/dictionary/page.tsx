"use client";

import { useState, useEffect } from "react";
import DictionarySearch from "@/components/dictionary/DictionarySearch";
import DictionaryList from "@/components/dictionary/DictionaryList";
import { dictionaryService } from "@/services/dictionaryService";
import { SignDictionary } from "@/types/dictionary";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DictionaryPage() {
  const [mounted, setMounted] = useState(false);
  const [dictionary, setDictionary] = useState<SignDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 40;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDictionary = async (currentPage: number) => {
    try {
      setLoading(true);
      const response = await dictionaryService.getAllSigns(
        currentPage, 
        pageSize, 
        searchQuery, 
        regionFilter
      );
      
      setDictionary(response.items || []);
      setTotalItems(response.totalItems || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch dictionary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset and fetch when filters change
  useEffect(() => {
    if (mounted) {
      setPage(0);
      fetchDictionary(0);
    }
  }, [searchQuery, regionFilter, mounted]);

  // Fetch when page changes
  useEffect(() => {
    if (mounted && page >= 0) {
      fetchDictionary(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, mounted]);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 pt-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Từ điển Ngôn ngữ ký hiệu Việt Nam
          </h1>
          <p className="mt-3 text-slate-500">
            Tra cứu ký hiệu theo vùng miền và học tập qua video minh họa.
          </p>
        </div>

        {/* Search & Filter */}
        <DictionarySearch 
          onSearch={setSearchQuery} 
          onRegionChange={setRegionFilter}
        />

        {/* Stats */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="text-sm font-medium text-slate-500">
            Tìm thấy <span className="text-blue-600 font-bold">{totalItems}</span> từ vựng
          </div>
          <div className="text-sm font-medium text-slate-500">
            Trang {page + 1} / {totalPages || 1}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <DictionaryList items={dictionary} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    // Hiển thị tối đa 5 trang xung quanh trang hiện tại
                    if (i === 0 || i === totalPages - 1 || (i >= page - 2 && i <= page + 2)) {
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`h-10 w-10 rounded-lg border font-bold transition-all ${
                            page === i 
                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    } else if (i === page - 3 || i === page + 3) {
                      return <span key={i} className="flex h-10 w-6 items-center justify-center text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={page === totalPages - 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {dictionary.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-xl font-bold text-slate-400">Không tìm thấy từ vựng nào.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
