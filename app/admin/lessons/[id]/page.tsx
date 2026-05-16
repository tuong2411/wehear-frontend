"use client";

export const runtime = "edge";

import { useEffect, useState, use } from "react";
import LessonForm from "@/components/admin/LessonForm";
import { lessonService } from "@/services/lessonService";
import { Lesson } from "@/types/lesson";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      const numericId = Number(id);
      if (isNaN(numericId)) {
        setLoading(false);
        return;
      }

      try {
        const data = await lessonService.adminGetById(numericId);
        setLesson(data);
      } catch (error) {
        toast.error("Không thể tải thông tin bài học");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLesson();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="font-bold text-slate-400">Đang tải thông tin bài học...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-bold text-slate-400">Không tìm thấy bài học</p>
      </div>
    );
  }

  return <LessonForm initialData={lesson} isEdit={true} />;
}
