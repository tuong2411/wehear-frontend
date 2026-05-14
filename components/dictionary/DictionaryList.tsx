"use client";

import { SignDictionary } from "@/types/dictionary";
import DictionaryCard from "./DictionaryCard";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Search, X } from "lucide-react";
import { useState } from "react";
import ContributionForm from "./ContributionForm";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DictionaryListProps {
  items: SignDictionary[];
}

export default function DictionaryList({ items }: DictionaryListProps) {
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SignDictionary | null>(null);
  const router = useRouter();

  const handleOpenContribution = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đóng góp từ vựng.");
      router.push("/login?redirect=/dictionary");
      return;
    }
    setIsContributionModalOpen(true);
  };

  const handleEditContribution = (item: SignDictionary) => {
    setEditItem(item);
    handleOpenContribution();
  };

  const handleCloseModal = () => {
    setIsContributionModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Kết quả tra cứu
          <span className="ml-3 text-sm font-bold text-slate-400">({items.length} từ)</span>
        </h2>
        
        <button
          onClick={() => { setEditItem(null); handleOpenContribution(); }}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
        >
          <PlusCircle size={20} />
          Đóng góp từ mới
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[40px] bg-white p-20 shadow-sm border border-slate-50">
          <div className="h-40 w-40 rounded-full bg-slate-50 flex items-center justify-center">
            <Search className="h-16 w-16 text-slate-200" />
          </div>
          <h3 className="mt-8 text-2xl font-bold text-slate-900">Không tìm thấy từ vựng nào</h3>
          <p className="mt-2 text-slate-500">Hãy thử tìm kiếm với từ khóa khác hoặc đóng góp cho cộng đồng.</p>
          <button
            onClick={() => { setEditItem(null); handleOpenContribution(); }}
            className="mt-8 rounded-2xl border-2 border-blue-600 px-8 py-3.5 font-bold text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
          >
            Đóng góp từ này ngay
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <DictionaryCard item={item} onEdit={handleEditContribution} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Contribution Modal */}
      <AnimatePresence>
        {isContributionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute -top-14 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-all"
              >
                <X size={28} />
              </button>
              <ContributionForm 
                onCancel={handleCloseModal}
                initialType={editItem ? 'EDIT' : 'NEW'}
                targetId={editItem?.id}
                initialWord={editItem?.signWord}
                onSuccess={() => {
                  // Keep modal open to show success state in ContributionForm
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
