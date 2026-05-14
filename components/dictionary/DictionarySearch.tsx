"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";

interface DictionarySearchProps {
  onSearch: (query: string) => void;
  onRegionChange: (region: string) => void;
}

export default function DictionarySearch({ 
  onSearch, 
  onRegionChange 
}: DictionarySearchProps) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");

  const regions = [
    { id: "all", label: "Tất cả" },
    { id: "Bắc", label: "Miền Bắc" },
    { id: "Trung", label: "Miền Trung" },
    { id: "Nam", label: "Miền Nam" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleRegionChange = (id: string) => {
    setRegion(id);
    onRegionChange(id);
  };

  return (
    <div className="mx-auto mb-12 max-w-4xl space-y-6">
      {/* Search Input */}
      <div className="relative flex items-center">
        <div className="absolute left-5 text-slate-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ vựng cần tra cứu..."
          className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-12 text-lg outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-4 rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Region Selector */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-sm font-semibold text-slate-500">Khu vực:</span>
        <div className="flex gap-2">
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRegionChange(r.id)}
              className={`rounded-xl px-6 py-2 text-sm font-bold transition-all ${
                region === r.id 
                ? "bg-blue-600 text-white" 
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
